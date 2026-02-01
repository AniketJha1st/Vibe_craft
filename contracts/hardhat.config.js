require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });

const QUAI_RPC_URL = process.env.QUAI_RPC_URL || "https://rpc.testnet.quai.network";
const QUAI_CHAIN_ID = parseInt(process.env.QUAI_CHAIN_ID || "9000");
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

// Only use private key if it looks valid (length 66 implies 0x + 64 hex chars)
const accounts = (DEPLOYER_PRIVATE_KEY && DEPLOYER_PRIVATE_KEY.length === 66 && DEPLOYER_PRIVATE_KEY !== "0xYOUR_PRIVATE_KEY_HERE")
    ? [DEPLOYER_PRIVATE_KEY]
    : [];

module.exports = {
    solidity: "0.8.20",
    networks: {
        quai: {
            url: QUAI_RPC_URL,
            accounts: accounts,
            chainId: QUAI_CHAIN_ID
        }
    }
};
