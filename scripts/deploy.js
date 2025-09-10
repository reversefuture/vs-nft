const hre = require("hardhat");

async function main() {
  const NFTPostMinter = await hre.ethers.getContractFactory("NFTPostMinter");
  const nftPostMinter = await NFTPostMinter.deploy();

  await nftPostMinter.deployed();
  console.log("NFTPostMinter deployed to:", nftPostMinter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
