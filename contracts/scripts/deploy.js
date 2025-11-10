const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment to", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Get deployment configuration from environment
  const NFT_NAME = process.env.NFT_COLLECTION_NAME || "AI Trader Position NFTs";
  const NFT_SYMBOL = process.env.NFT_COLLECTION_SYMBOL || "AIPOS";
  const NFT_URI = process.env.NFT_COLLECTION_URI || "";
  const MAX_SUPPLY = process.env.NFT_MAX_SUPPLY || "0"; // 0 = unlimited
  const MINT_PRICE = process.env.NFT_MINT_PRICE || "0"; // Free minting
  const PAYMENT_TOKEN = process.env.NFT_PAYMENT_TOKEN || hre.ethers.ZeroAddress; // Zero address = native token (HYPE)

  const PLATFORM_FEE = parseInt(process.env.MARKETPLACE_PLATFORM_FEE || "250"); // 2.5%
  // Ensure FEE_RECIPIENT is always a valid address string
  const FEE_RECIPIENT = process.env.MARKETPLACE_FEE_RECIPIENT || deployer.address;
  const USDC_ADDRESS = process.env.USDC_ADDRESS || hre.ethers.ZeroAddress;

  console.log("\n⚙️  Deployment Configuration:");
  console.log("Platform Fee:", PLATFORM_FEE, "basis points");
  console.log("Fee Recipient:", FEE_RECIPIENT);

  // Deploy NFT Collection
  console.log("\n📦 Deploying NFTCollection...");
  const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
  const nftCollection = await NFTCollection.deploy(
    NFT_NAME,
    NFT_SYMBOL,
    NFT_URI,
    MAX_SUPPLY,
    MINT_PRICE,
    PAYMENT_TOKEN
  );
  await nftCollection.waitForDeployment();
  console.log("✅ NFTCollection deployed to:", nftCollection.target);

  // Deploy NFT Marketplace
  console.log("\n📦 Deploying NFTMarketplace...");
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy(
    PLATFORM_FEE,
    FEE_RECIPIENT
  );
  await nftMarketplace.waitForDeployment();
  console.log("✅ NFTMarketplace deployed to:", nftMarketplace.target);

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      NFTCollection: {
        address: nftCollection.target,
        args: [NFT_NAME, NFT_SYMBOL, NFT_URI, MAX_SUPPLY, MINT_PRICE, PAYMENT_TOKEN],
      },
      NFTMarketplace: {
        address: nftMarketplace.target,
        args: [PLATFORM_FEE, FEE_RECIPIENT],
      },
    },
    configuration: {
      mintPaymentToken: PAYMENT_TOKEN,
      useERC20ForMinting: PAYMENT_TOKEN !== hre.ethers.ZeroAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📄 Deployment info saved to:", deploymentFile);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("NFTCollection:", nftCollection.target);
  console.log("NFTMarketplace:", nftMarketplace.target);
  console.log("\n⚙️  Configuration:");
  console.log("Platform Fee:", PLATFORM_FEE, "basis points (", PLATFORM_FEE / 100, "%)");
  console.log("Fee Recipient:", FEE_RECIPIENT);
  console.log("Mint Price:", MINT_PRICE);
  console.log("Payment Token:", PAYMENT_TOKEN === hre.ethers.ZeroAddress ? "Native (HYPE)" : `ERC20 (${PAYMENT_TOKEN})`);
  console.log("\n🔗 Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("\n📝 Next Steps:");
  console.log("1. Update your .env.local file with these addresses:");
  console.log(`   NEXT_PUBLIC_NFT_COLLECTION_ADDRESS=${nftCollection.target}`);
  console.log(`   NEXT_PUBLIC_MARKETPLACE_ADDRESS=${nftMarketplace.target}`);
  if (USDC_ADDRESS !== hre.ethers.ZeroAddress) {
    console.log(`   NEXT_PUBLIC_USDC_ADDRESS=${USDC_ADDRESS}`);
  }
  console.log("2. If using USDC for minting, update collection payment token:");
  console.log(`   await nftCollection.setPaymentToken("${USDC_ADDRESS}")`);
  console.log("3. Verify contracts on block explorer (if supported)");
  console.log("4. Test contract functionality");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

