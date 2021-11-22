// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Owner {
  address public owner;

  modifier owned() {
    require(msg.sender == owner, 'Owner only');
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function setOwner(address _newOwner) public owned {
    owner = _newOwner;
  }
}
