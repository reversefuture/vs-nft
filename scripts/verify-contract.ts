import { run } from "hardhat";

async function main() {
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("Please set VITE_CONTRACT_ADDRESS in your .env file");
    process.exit(1);
  }

  console.log("Verifying contract at:", contractAddress);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});