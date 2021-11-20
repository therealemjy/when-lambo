// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

contract Migrations {
  address public owner;
  uint256 public lastCompletedMigration;

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  constructor() {
    owner = msg.sender;
  }

  function setCompleted(uint256 completed) public restricted {
    lastCompletedMigration = completed;
  }
}
