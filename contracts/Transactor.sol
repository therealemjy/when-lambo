// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './Owner.sol';
import './interfaces/IUniswapV2Router.sol';

contract Transactor is Owner {
  IUniswapV2Router private uniswapV2Router;

  constructor(address _uniswapV2RouterAddress) {
    // Initialize exchange contracts
    uniswapV2Router = IUniswapV2Router(_uniswapV2RouterAddress);
  }

  function getBalance() public view owned returns (uint256 balance) {
    return address(this).balance;
  }

  function withdraw(address _token, uint256 _tokenAmount) public owned {
    IERC20(_token).transfer(address(owner), _tokenAmount);
  }

  function execute(
    address _fromToken,
    uint256 _fromTokenAmount,
    address _toToken,
    uint256 _minToTokenAmount,
    uint256 _deadline
  ) public owned {
    IERC20(_fromToken).approve(address(uniswapV2Router), _fromTokenAmount);

    // For now, we only handle simple paths from one token to another
    address[] memory path = new address[](2);
    path[0] = address(_fromToken);
    path[1] = address(_toToken);

    uniswapV2Router.swapExactTokensForTokens(_fromTokenAmount, _minToTokenAmount, path, msg.sender, _deadline);
  }
}
