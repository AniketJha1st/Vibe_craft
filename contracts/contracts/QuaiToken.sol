// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract QuaiToken is ERC20 {
    constructor() ERC20("Quai Nexus Token", "QNX") {
        _mint(msg.sender, 1_000_000 ether);
    }
}
