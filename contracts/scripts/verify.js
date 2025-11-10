const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting contract verification on", hre.network.name);

  // Get the latest deployment file
  const deploymentsDir = path.join(__dirname, "../deployments");
  const files = fs.readdirSync(deploymentsDir);
  const networkFiles = files.filter((f) =>
    f.startsWith(hre.network.name)
  ).sort().reverse();

  if (networkFiles.length === 0) {
    console.error("No deployment found for network:", hre.network.name);
    process.exit(1);
  }

  const latestDeployment = JSON.parse(
    fs.readFileSync(path.join(deploymentsDir, networkFiles[0]))
  );

  console.log("Using deployment:", networkFiles[0]);
  console.log("\n" + "=".repeat(60));

  // Verify NFTCollection
  console.log("\n🔍 Verifying NFTCollection...");
  try {
    await hre.run("verify:verify", {
      address: latestDeployment.contracts.NFTCollection.address,
      constructorArguments: latestDeployment.contracts.NFTCollection.args,
    });
    console.log("✅ NFTCollection verified");
  } catch (error) {
    console.error("❌ NFTCollection verification failed:", error.message);
  }

  // Verify NFTMarketplace
  console.log("\n🔍 Verifying NFTMarketplace...");
  try {
    await hre.run("verify:verify", {
      address: latestDeployment.contracts.NFTMarketplace.address,
      constructorArguments: latestDeployment.contracts.NFTMarketplace.args,
    });
    console.log("✅ NFTMarketplace verified");
  } catch (error) {
    console.error("❌ NFTMarketplace verification failed:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Verification process completed");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

