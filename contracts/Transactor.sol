// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import './Owner.sol';

contract Transactor is Owner {
  address public uniswapV2RouterAddress;

  constructor(address _uniswapV2RouterAddress) {
    uniswapV2RouterAddress = _uniswapV2RouterAddress;
  }
}
