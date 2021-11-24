// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Owner.sol";

contract Migrator is Owner {
    uint256 public lastCompletedMigration;

    function setCompleted(uint256 _completed) public owned {
        lastCompletedMigration = _completed;
    }
}
