const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Mock USDC...");
  console.log("Network:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy Mock USDC
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  console.log("\nDeploying MockERC20 (USDC)...");

  const usdc = await MockERC20.deploy("Mock USDC", "USDC", 6);
  await usdc.waitForDeployment();
  
  console.log("✅ Mock USDC deployed to:", usdc.target);

  // Mint initial supply to deployer (1 million USDC for testing)
  const initialSupply = hre.ethers.parseUnits("1000000", 6);
  console.log("\nMinting initial supply...");
  const mintTx = await usdc.mint(deployer.address, initialSupply);
  await mintTx.wait();

  console.log("✅ Minted 1,000,000 USDC to:", deployer.address);

  // Wait for block confirmations before verification
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\nWaiting for 5 block confirmations...");
    const deployTx = usdc.deploymentTransaction();
    if (deployTx) await deployTx.wait(5);

    // Verify on Etherscan (Sepolia)
    if (hre.network.name === "sepolia") {
      try {
        console.log("\nVerifying contract on Etherscan...");
        await hre.run("verify:verify", {
          address: usdc.target,
          constructorArguments: ["Mock USDC", "USDC", 6],
        });
        console.log("✅ Contract verified on Etherscan!");
      } catch (error) {
        if (error.message.includes("Already Verified")) {
          console.log("✅ Contract already verified!");
        } else {
          console.log("⚠️  Verification error:", error.message);
          console.log("You can verify manually with:");
          console.log(`npx hardhat verify --network ${hre.network.name} ${usdc.target} "Mock USDC" "USDC" 6`);
        }
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("📝 DEPLOYMENT SUMMARY");
  console.log("=".repeat(80));
  console.log("Network:        ", hre.network.name);
  console.log("Mock USDC:      ", usdc.target);
  console.log("Deployer:       ", deployer.address);
  console.log("Initial Supply: ", "1,000,000 USDC");
  console.log("Decimals:       ", "6");
  console.log("=".repeat(80));
  
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Update your .env file with:");
  console.log(`   USDC_ADDRESS=${usdc.target}`);
  console.log(`   NFT_PAYMENT_TOKEN=${usdc.target}`);
  console.log("\n2. Deploy NFT contracts:");
  console.log(`   npm run deploy:${hre.network.name}`);
  console.log("\n3. Mint USDC to test accounts (in Hardhat console):");
  console.log(`   const usdc = await ethers.getContractAt("MockERC20", "${usdc.target}");`);
  console.log(`   await usdc.mint("0x_address", ethers.parseUnits("10000", 6));`);
  console.log("=".repeat(80));

  // Save deployment info to file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    mockUSDC: usdc.target,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const filename = `deployments-${hre.network.name}.json`;
  let deployments = {};

  if (fs.existsSync(filename)) {
    deployments = JSON.parse(fs.readFileSync(filename, "utf8"));
  }

  deployments.mockUSDC = deploymentInfo;
  fs.writeFileSync(filename, JSON.stringify(deployments, null, 2));
  console.log(`\n💾 Deployment info saved to: ${filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

