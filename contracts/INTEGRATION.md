# Quai Network Integration Guide

Here are the snippets to connect your Vibe_craft application to the deployed Quai contracts.

## 1. Frontend (React/Next.js) - Connecting MetaMask to Quai

Install `ethers`:
```bash
npm install ethers
```

**`client/src/utils/quai.js`**:
```javascript
import { ethers } from "ethers";

// Replace with REAL deployed addresses from scripts/deploy.js output
const TOKEN_ADDRESS = "0x..."; 
const NFT_ADDRESS = "0x...";

// Basic ABIs (export these or import from artifacts)
const TOKEN_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];
const NFT_ABI = [
  "function mint(address to) external"
];

export async function connectToQuai() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  
  await window.ethereum.request({ method: "eth_requestAccounts" });
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
  const nft = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
  
  return { provider, signer, token, nft };
}
```

## 2. Backend (Node.js) - Triggering Rewards

Install `ethers` and `dotenv`:
```bash
npm install ethers dotenv
```

**`server/services/rewardService.js`**:
```javascript
const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.QUAI_RPC_URL);
const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

const TOKEN_ADDRESS = "0x..."; // Replace after deployment
const NFT_ADDRESS = "0x...";   // Replace after deployment

const TOKEN_ABI = ["function transfer(address to, uint256 amount) external returns (bool)"];
const NFT_ABI = ["function mint(address to) external"];

const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, wallet);
const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, wallet);

async function distributeReward(userAddress, amountEther) {
  try {
    const amount = ethers.parseEther(amountEther.toString());
    const tx = await tokenContract.transfer(userAddress, amount);
    await tx.wait();
    console.log(`Reward sent! Tx: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error("Reward failed:", error);
    throw error;
  }
}

async function mintGuardianNFT(userAddress) {
  try {
    const tx = await nftContract.mint(userAddress);
    await tx.wait();
    console.log(`NFT minted! Tx: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error("Mint failed:", error);
    throw error;
  }
}

module.exports = { distributeReward, mintGuardianNFT };
```
