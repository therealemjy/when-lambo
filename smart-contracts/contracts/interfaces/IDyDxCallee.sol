// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '../libraries/DyDx.sol';

// Interface used for a contract to be callable after receiving a flash loan
interface IDyDxCallee {
  function callFunction(
    address sender,
    Account.Info memory accountInfo,
    bytes memory data
  ) external;
}
