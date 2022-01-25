// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './Owner.sol';
import './interfaces/IDyDxCallee.sol';
import './interfaces/IDyDxSoloMargin.sol';
import './interfaces/IUniswapV2Router.sol';
import './libraries/DyDx.sol';

enum Exchange {
  UniswapV2,
  Sushiswap,
  CryptoCom
}

contract Transactor is Owner, IDyDxCallee {
  IERC20 private weth;
  IDyDxSoloMargin private dydxSoloMargin;
  IUniswapV2Router private uniswapV2Router;
  IUniswapV2Router private sushiswapRouter;
  IUniswapV2Router private cryptoComRouter;

  event SuccessfulTrade(
    address tradedTokenAddress,
    uint256 borrowedWethAmount,
    Exchange sellingExchangeIndex,
    uint256 tradedTokenAmountOut,
    Exchange buyingExchangeIndex,
    uint256 wethAmountOut
  );

  struct CallFunctionData {
    uint256 borrowedWethAmount;
    address tradedToken;
    uint256 tradedTokenAmountOutMin;
    uint256 wethAmountOutMin;
    Exchange sellingExchangeIndex;
    Exchange buyingExchangeIndex;
    uint256 deadline;
  }

  constructor(
    address _wethAddress,
    address _dydxSoloMargin,
    address _uniswapV2Router,
    address _sushiswapRouter,
    address _cryptoComRouter
  ) {
    weth = IERC20(_wethAddress);

    // Initialize exchange contracts
    dydxSoloMargin = IDyDxSoloMargin(_dydxSoloMargin);
    uniswapV2Router = IUniswapV2Router(_uniswapV2Router);
    // Note: we use the same interface for SushiswapRouter and CryptoComRouter because
    // they are both forks of UniswapV2Router
    sushiswapRouter = IUniswapV2Router(_sushiswapRouter);
    cryptoComRouter = IUniswapV2Router(_cryptoComRouter);
  }

  function destruct(address payable _to) external owned {
    // Transfer WETH left on the contract to the provided address
    uint256 wethBalance = weth.balanceOf(address(this));
    weth.transfer(_to, wethBalance);

    selfdestruct(_to);
  }

  // Function to receive ethers when msg.data is empty
  // solhint-disable-next-line no-empty-blocks
  receive() external payable {}

  // Fallback function to receive ethers when msg.data is not empty
  fallback() external payable {}

  function transferERC20(
    address _token,
    uint256 _amount,
    address _to
  ) external owned {
    IERC20(_token).transfer(_to, _amount);
  }

  function transferETH(uint256 _amount, address payable _to) external owned {
    // solhint-disable-next-line avoid-low-level-calls
    (bool success, ) = _to.call{value: _amount}('');
    require(success, 'Transfer failed');
  }

  function getExchange(Exchange exchangeIndex) public view returns (IUniswapV2Router) {
    // Define selling and buying exchanges based on passed sellingExchangeIndex and buyingExchangeIndex
    // Note: we can use single variables that contain the selling and buying exchanges because
    // currently all our exchanges share the same interface (UniswapV2Router). This logic will need to
    // be updated once we support non-Uniswap like exchanges.
    IUniswapV2Router exchange = uniswapV2Router;

    if (exchangeIndex == Exchange.Sushiswap) {
      exchange = sushiswapRouter;
    } else if (exchangeIndex == Exchange.CryptoCom) {
      exchange = cryptoComRouter;
    }

    return exchange;
  }

  function swap(
    address fromToken,
    uint256 fromTokenAmountIn,
    Exchange exchangeIndex,
    address toToken,
    uint256 toTokenAmountOutMin,
    uint256 deadline
  ) internal returns (uint256 toTokenAmountOut) {
    IUniswapV2Router exchange = getExchange(exchangeIndex);

    // Allow the exchange to withdraw the amount of fromToken we want to exchange
    IERC20(fromToken).approve(address(exchange), fromTokenAmountIn);

    // Swap all the fromTokens to toTokens
    address[] memory path = new address[](2);
    path[0] = fromToken;
    path[1] = toToken;

    uint256 toTokenAmountReceived = exchange.swapExactTokensForTokens(
      fromTokenAmountIn,
      toTokenAmountOutMin,
      path,
      address(this),
      deadline
    )[1];

    return toTokenAmountReceived;
  }

  function trade(
    uint256 expectedBlockNumber,
    uint256 _wethAmountToBorrow,
    Exchange _sellingExchangeIndex,
    address _tradedToken,
    uint256 _tradedTokenAmountOutMin,
    Exchange _buyingExchangeIndex,
    uint256 _wethAmountOutMin,
    // Although the deadline does not really apply in our case since our trade is
    // only valid for one block, we still need to provide one to the exchanges
    uint256 _deadline
  ) external owned {
    // Make sure trade does not execute if a new block was mined since the transaction has been sent
    require(expectedBlockNumber == block.number, 'Trade expired');

    /*
      The first step is to initiate a flashloan with DyDx.

      The flash loan functionality in DyDx is predicated by their "operate" function,
      which takes a list of operations to execute, and defers validating the state of
      things until it's done executing them.

      We thus create three operations, a Withdraw (which loans us the funds), a Call
      (which invokes the callFunction method on this contract), and a Deposit (which
      repays the loan, plus the 2 wei fee), and pass them all to "operate".

      Note that the Deposit operation will invoke the transferFrom to pay the loan
      (or whatever amount it was initialized with) back to itself, there is no need
      to pay it back explicitly.

      At the moment, we only make flashloans in WETH.
    */

    // DyDx take a fee of 2 wei to execute the flashloan
    uint256 wethAmountToRepay = _wethAmountToBorrow + 2;

    // Give DyDx permission to withdraw amount to repay. This amount
    // will only be withdrawn after we've executed our trade.
    weth.approve(address(dydxSoloMargin), wethAmountToRepay);

    Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);

    // Borrow funds
    operations[0] = Actions.ActionArgs({
      actionType: Actions.ActionType.Withdraw,
      accountId: 0,
      amount: Types.AssetAmount({
        sign: false,
        denomination: Types.AssetDenomination.Wei,
        ref: Types.AssetReference.Delta,
        value: _wethAmountToBorrow // Amount to borrow
      }),
      primaryMarketId: 0, // WETH
      secondaryMarketId: 0,
      otherAddress: address(this),
      otherAccountId: 0,
      data: ''
    });

    // Call callFunction to execute the rest of the trade
    operations[1] = Actions.ActionArgs({
      actionType: Actions.ActionType.Call,
      accountId: 0,
      amount: Types.AssetAmount({
        sign: false,
        denomination: Types.AssetDenomination.Wei,
        ref: Types.AssetReference.Delta,
        value: 0
      }),
      primaryMarketId: 0,
      secondaryMarketId: 0,
      otherAddress: address(this),
      otherAccountId: 0,
      data: abi.encode(
        // These parameters will be passed to callFunction
        CallFunctionData({
          borrowedWethAmount: _wethAmountToBorrow,
          tradedToken: _tradedToken,
          tradedTokenAmountOutMin: _tradedTokenAmountOutMin,
          wethAmountOutMin: _wethAmountOutMin,
          sellingExchangeIndex: _sellingExchangeIndex,
          buyingExchangeIndex: _buyingExchangeIndex,
          deadline: _deadline
        })
      )
    });

    // Repay borrowed funds + fee
    operations[2] = Actions.ActionArgs({
      actionType: Actions.ActionType.Deposit,
      accountId: 0,
      amount: Types.AssetAmount({
        sign: true,
        denomination: Types.AssetDenomination.Wei,
        ref: Types.AssetReference.Delta,
        value: wethAmountToRepay
      }),
      primaryMarketId: 0, // Market ID of the WETH
      secondaryMarketId: 0,
      otherAddress: address(this),
      otherAccountId: 0,
      data: ''
    });

    Account.Info[] memory accountInfos = new Account.Info[](1);
    accountInfos[0] = Account.Info({owner: address(this), number: 1});

    dydxSoloMargin.operate(accountInfos, operations);
  }

  // Function called by DyDx after giving us the loan
  // Note: the type of this function comes from DyDx, do not update it
  // (even if a warning shows saying some of the parameters are unused)!
  // Also, its name has to be callFunction.
  function callFunction(
    address sender,
    Account.Info memory accountInfo,
    bytes memory data
  ) external override {
    // Make sure the call comes from DyDx' solo margin contract
    assert(msg.sender == address(dydxSoloMargin));

    // Decode the passed variables from the data object
    CallFunctionData memory tradeData = abi.decode(data, (CallFunctionData));

    // Sell all the borrowed WETH for as much tradedToken as possible
    uint256 tradedTokenAmountOut = swap(
      address(weth), // fromToken
      tradeData.borrowedWethAmount, // fromTokenAmountIn
      tradeData.sellingExchangeIndex,
      tradeData.tradedToken, // toToken
      tradeData.tradedTokenAmountOutMin, // Minimum tradedToken amount out for this deal to be profitable
      tradeData.deadline
    );

    // Sell all the tradedToken obtained for as much WETH as possible
    uint256 wethAmountOut = swap(
      tradeData.tradedToken,
      tradedTokenAmountOut, // tradedToken amount received from selling the borrowed WETH
      tradeData.buyingExchangeIndex,
      address(weth),
      tradeData.borrowedWethAmount, // Minimum WETH amount out for this deal to be profitable
      tradeData.deadline
    );

    emit SuccessfulTrade(
      tradeData.tradedToken,
      tradeData.borrowedWethAmount,
      tradeData.sellingExchangeIndex,
      tradedTokenAmountOut,
      tradeData.buyingExchangeIndex,
      wethAmountOut
    );

    // After that DyDx will withdraw the amount of WETH we borrowed from them (+ 2 wei fee) and the
    // profit (in WETH) will be left on the contract
  }
}
