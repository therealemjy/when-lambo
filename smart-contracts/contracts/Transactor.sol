// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './Owner.sol';
import './interfaces/IDyDxCallee.sol';
import './interfaces/IDyDxSoloMargin.sol';
import './interfaces/IUniswapV2Router.sol';
import './interfaces/ISushiswapRouter.sol';
import './interfaces/ICryptoComRouter.sol';
import './interfaces/IKyberNetworkProxy.sol';
import './libraries/DyDx.sol';

// TODO: remove in prod
import 'hardhat/console.sol';

contract Transactor is Owner, IDyDxCallee {
  IERC20 private weth;
  IDyDxSoloMargin private dydxSoloMargin;
  IUniswapV2Router private uniswapV2Router;
  ISushiswapRouter private sushiswapRouter;
  ICryptoComRouter private cryptoComRouter;
  IKyberNetworkProxy private kyberNetworkProxy;

  constructor(
    address _wethAddress,
    address _dydxSoloMarginAddress,
    address _uniswapV2RouterAddress,
    address _sushiswapRouterAddress,
    address _cryptoComRouterAddress,
    address _kyberNetworkProxyAddress
  ) {
    weth = IERC20(_wethAddress);

    // Initialize exchange contracts
    dydxSoloMargin = IDyDxSoloMargin(_dydxSoloMarginAddress);
    uniswapV2Router = IUniswapV2Router(_uniswapV2RouterAddress);
    sushiswapRouter = ISushiswapRouter(_sushiswapRouterAddress);
    cryptoComRouter = ICryptoComRouter(_cryptoComRouterAddress);
    kyberNetworkProxy = IKyberNetworkProxy(_kyberNetworkProxyAddress);
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

  function execute(uint256 _borrowedWethAmount) public owned {
    console.log('Contract balance: %s', weth.balanceOf(address(this)));

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
    uint256 repayAmount = _borrowedWethAmount + 2;

    // Give DyDx permission to withdraw amount to repay. This amount
    // will only be withdrawn after we've executed our trade.
    weth.approve(address(dydxSoloMargin), repayAmount);

    Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);

    // Borrow funds
    operations[0] = Actions.ActionArgs({
      actionType: Actions.ActionType.Withdraw,
      accountId: 0,
      amount: Types.AssetAmount({
        sign: false,
        denomination: Types.AssetDenomination.Wei,
        ref: Types.AssetReference.Delta,
        value: _borrowedWethAmount // Amount to borrow
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
        // TODO: add any relevant data that needs to be sent to
        // callFunction to execute the trade
        // Replace or add any additional variables that you want
        // to be available to the receiver function
        _borrowedWethAmount
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
        value: repayAmount // Amount to repay
      }),
      primaryMarketId: 0, // market ID of the WETH
      secondaryMarketId: 0,
      otherAddress: address(this),
      otherAccountId: 0,
      data: ''
    });

    Account.Info[] memory accountInfos = new Account.Info[](1);
    accountInfos[0] = Account.Info({owner: address(this), number: 1});

    console.log('Executing operations');

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
    console.log('Callback called by DyDx');

    // Decode the passed variables from the data object
    uint256 loanAmount = abi.decode(data, (uint256));

    console.log('Expected amount of WETH received: %s', loanAmount);
    console.log('Contract balance: %s', weth.balanceOf(address(this)));

    // Exchange tokens on Uniswap

    // Allow Kyber to withdraw the amount of WETH we want to exchange
    weth.approve(address(kyberNetworkProxy), loanAmount);

    // TODO: define minConversionRate
    uint256 minConversionRate = 1;
    uint256 amountReceived = kyberNetworkProxy.swapTokenToToken(
      weth,
      loanAmount,
      IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F), // DAI
      minConversionRate
    );

    console.log('Amount received from selling: %s DAI decimals', amountReceived);

    // Exchange tokens on Uniswap
    address[] memory buyPath = new address[](2);
    buyPath[0] = 0x6B175474E89094C44Da98b954EedeAC495271d0F; // DAI address
    buyPath[1] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // WETH address
    uint256 deadline = block.timestamp + 1 days;

    // Allow Uniswap to withdraw the amount of WETH we want to exchange
    weth.approve(address(uniswapV2Router), amountReceived);

    uint256 finalAmount = uniswapV2Router.swapExactTokensForTokens(
      amountReceived,
      40200508545589900000, // Arbitrary number (we'll need to set one based on the trade)
      buyPath,
      address(this),
      deadline
    )[1];

    // address[] memory buyPath = new address[](2);
    // buyPath[0] = 0x6B175474E89094C44Da98b954EedeAC495271d0F; // DAI address
    // buyPath[1] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // WETH address

    //   // Allow Sushiswap to withdraw the amount of MANA we want to exchange
    //   IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F).approve(address(sushiswapRouter), amountReceived);

    //   // Exchange amount received on Sushiswap
    //   uint256 finalAmount = sushiswapRouter.swapExactTokensForTokens(
    //     amountReceived,
    //     6818466095429090000, // Arbitrary number (we'll need to set one based on the trade)
    //     buyPath,
    //     address(this),
    //     deadline
    //   )[1];

    // IERC20(0x0F5D2fB29fb7d3CFeE444a200298f468908cC942).approve(address(cryptoComRouter), amountReceived);

    // // Exchange amount received on Sushiswap
    // uint256 finalAmount = cryptoComRouter.swapExactTokensForTokens(
    //   amountReceived,
    //   1, // Arbitrary number (we'll need to set one based on the trade)
    //   buyPath,
    //   address(this),
    //   deadline
    // )[1];

    // require(weth.balanceOf(address(this)) > repayAmount, 'Cannot repay loan');

    console.log('Amount received from buying: %s WETH decimals', finalAmount);
  }
}
