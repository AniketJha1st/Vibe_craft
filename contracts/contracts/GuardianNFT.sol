// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GuardianNFT is ERC721, Ownable {
    uint256 public tokenId;

    constructor() ERC721("Chain Guardian", "GUARD") Ownable(msg.sender) {}

    function mint(address to) external onlyOwner {
        tokenId++;
        _safeMint(to, tokenId);
    }
}
