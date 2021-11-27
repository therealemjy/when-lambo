// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '../libraries/DyDx.sol';

interface IDyDxSoloMargin {
  function operate(Account.Info[] memory accounts, Actions.ActionArgs[] memory actions) external;
}
