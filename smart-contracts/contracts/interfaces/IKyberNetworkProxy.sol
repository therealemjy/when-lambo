// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IKyberNetworkProxy {
  function swapTokenToToken(
    IERC20 src,
    uint256 srcAmount,
    IERC20 dest,
    uint256 minConversionRate
  ) external returns (uint256 destAmount);

  // TODO: remove
  function getExpectedRate(
    IERC20 src,
    IERC20 dest,
    uint256 srcQty
  ) external view returns (uint256 expectedRate, uint256 worstRate);
}
