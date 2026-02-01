const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const Token = await hre.ethers.getContractFactory("QuaiToken");
    const token = await Token.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();

    const NFT = await hre.ethers.getContractFactory("GuardianNFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();

    console.log("QuaiToken deployed to:", tokenAddress);
    console.log("GuardianNFT deployed to:", nftAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
