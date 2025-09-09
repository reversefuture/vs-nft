import hre from "hardhat";

async function main() {
  console.log("Deploying VSPostNFT contract...");

  // Get the contract factory
  const VSPostNFT = await hre.ethers.getContractFactory("VSPostNFT");

  // Deploy the contract
  const vsPostNFT = await VSPostNFT.deploy(
    "VS Post NFT", // name
    "VSNFT"       // symbol
  );

  await vsPostNFT.waitForDeployment();

  const contractAddress = await vsPostNFT.getAddress();
  console.log("VSPostNFT deployed to:", contractAddress);

  // Verify deployment
  console.log("Contract name:", await vsPostNFT.name());
  console.log("Contract symbol:", await vsPostNFT.symbol());
  console.log("Max supply:", await vsPostNFT.MAX_SUPPLY());
  console.log("Minting fee:", hre.ethers.formatEther(await vsPostNFT.mintingFee()), "ETH");

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: (await hre.ethers.provider.getNetwork()).name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    deployedAt: new Date().toISOString(),
    contractName: "VSPostNFT",
    symbol: "VSNFT"
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for frontend integration
  console.log("\n=== Frontend Integration ===");
  console.log("Add this to your .env file:");
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`VITE_CHAIN_ID=${deploymentInfo.chainId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });