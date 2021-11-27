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

  struct CallFunctionData {
    uint256 borrowedWethAmount;
    uint256 wethAmountToRepay;
    address tradedTokenAddress;
    uint256 minTradedTokenAmountOut;
    uint256 minWethAmountOut;
    Exchange sellingExchangeIndex;
    Exchange buyingExchangeIndex;
    uint256 deadline;
  }

  constructor(
    address _wethAddress,
    address _dydxSoloMarginAddress,
    address _uniswapV2RouterAddress,
    address _sushiswapRouterAddress,
    address _cryptoComRouterAddress
  ) {
    weth = IERC20(_wethAddress);

    // Initialize exchange contracts
    dydxSoloMargin = IDyDxSoloMargin(_dydxSoloMarginAddress);
    uniswapV2Router = IUniswapV2Router(_uniswapV2RouterAddress);
    // Note: we use the same interface for SushiswapRouter and CryptoComRouter, because
    // they are both forks of UniswapV2Router
    sushiswapRouter = IUniswapV2Router(_sushiswapRouterAddress);
    cryptoComRouter = IUniswapV2Router(_cryptoComRouterAddress);
  }

  function getBalance(address _fromToken) public view owned returns (uint256 balance) {
    return IERC20(_fromToken).balanceOf(address(this));
  }

  function withdraw(address _token, uint256 _tokenAmount) public owned {
    IERC20(_token).transfer(address(owner), _tokenAmount);
  }

  // TODO: update
  // function withdrawETH(uint256 _amount) public owned {
  //   address(owner).transfer(_amount);
  // }

  // We need our contract to be able to receive ETH to repay the flashloan
  // fee of DyDx

  // Function to receive ethers. Note that msg.data must be empty
  receive() external payable {}

  // Fallback function to receive ethers when msg.data is not empty
  fallback() external payable {}

  function execute(
    uint256 _wethAmountToBorrow,
    address _tradedTokenAddress,
    uint256 _minTradedTokenAmountOut,
    uint256 _minWethAmountOut,
    Exchange _sellingExchangeIndex,
    Exchange _buyingExchangeIndex,
    // Although the deadline does not really apply in our case since our trade is
    // only valid for one block, we still need to provide one to the exchanges
    uint256 _deadline
  ) public owned {
    /*
      The first step is to initiate a Flashloan with DyDx.

      The flash loan functionality in DyDx is predicated by their "operate" function,
      which takes a list of operations to execute, and defers validating the state of
      things until it's done executing them.

      We thus create three operations, a Withdraw (which loans us the funds), a Call
      (which invokes the callFunction method on this contract), and a Deposit (which
      repays the loan, plus the 2 wei fee), and pass them all to "operate".

      Note that the Deposit operation will invoke the transferFrom to pay the loan
      (or whatever amount it was initialised with) back to itself, there is no need
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
          wethAmountToRepay: wethAmountToRepay,
          tradedTokenAddress: _tradedTokenAddress,
          minTradedTokenAmountOut: _minTradedTokenAmountOut,
          minWethAmountOut: _minWethAmountOut,
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
  function callFunction(
    address sender,
    Account.Info memory accountInfo,
    bytes memory data
  ) external override {
    // TODO: add require to verify sender is the owner of the contract (?)

    // Decode the passed variables from the data object
    CallFunctionData memory tradeData = abi.decode(data, (CallFunctionData));

    // Define selling and buying exchanges based on passed sellingExchangeIndex and buyingExchangeIndex
    // Note: we can use single variables that contain the selling and buying exchanges because
    // currently all our exchanges share the same interface (UniswapV2Router). This logic will need to
    // be updated once we support non-Uniswap like exchanges.
    IUniswapV2Router sellingExchange = uniswapV2Router;

    if (tradeData.sellingExchangeIndex == Exchange.Sushiswap) {
      sellingExchange = sushiswapRouter;
    } else if (tradeData.sellingExchangeIndex == Exchange.CryptoCom) {
      sellingExchange = cryptoComRouter;
    }

    IUniswapV2Router buyingExchange = uniswapV2Router;

    if (tradeData.buyingExchangeIndex == Exchange.Sushiswap) {
      buyingExchange = sushiswapRouter;
    } else if (tradeData.buyingExchangeIndex == Exchange.CryptoCom) {
      buyingExchange = cryptoComRouter;
    }

    // Allow the selling exchange to withdraw the amount of WETH we want to exchange
    weth.approve(address(sellingExchange), tradeData.borrowedWethAmount);

    // Swap all the borrowed WETH to tradedToken
    address[] memory sellingPath = new address[](2);
    sellingPath[0] = address(weth);
    sellingPath[1] = tradeData.tradedTokenAddress;

    uint256 tradedTokenAmountReceived = sellingExchange.swapExactTokensForTokens(
      tradeData.borrowedWethAmount, // WETH amount in
      tradeData.minTradedTokenAmountOut, // Minimum tradedToken amount out for this deal to be profitable
      sellingPath,
      address(this),
      tradeData.deadline
    )[1];

    // Swap tradedToken amount received back to WETH
    address[] memory buyingPath = new address[](2);
    buyingPath[0] = tradeData.tradedTokenAddress;
    buyingPath[1] = address(weth);

    // Allow the buying exchange to withdraw the amount of tradedToken we just received
    IERC20(tradeData.tradedTokenAddress).approve(address(buyingExchange), tradedTokenAmountReceived);

    uint256 wethAmountReceived = buyingExchange.swapExactTokensForTokens(
      tradedTokenAmountReceived, // tradedToken amount received from selling swap
      tradeData.minWethAmountOut, // Minimum WETH amount out for this deal to be profitable
      buyingPath,
      address(this),
      tradeData.deadline
    )[1];

    require(weth.balanceOf(address(this)) > tradeData.wethAmountToRepay, 'Cannot repay loan');

    // After that DyDx will withdraw the amount of WETH we borrowed from them (+ 2 wei fee) and the
    // profit (in WETH) will be left on the contract

    // TODO: send event
  }
}
