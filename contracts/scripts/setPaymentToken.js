const hre = require("hardhat");

async function main() {
  console.log("Setting payment token for NFTCollection...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get addresses from environment
  const NFT_COLLECTION_ADDRESS = process.env.NFT_COLLECTION_ADDRESS || "0x7Ba1C5dcee3B61E8DCd65045fadE9221ec7458d1";
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0xF7FA86E77607C3b63b96765F9131f678e7d82F1F";
  const MINT_PRICE = process.env.NFT_MINT_PRICE || "10"; // Default 10 USDC

  console.log("NFT Collection:", NFT_COLLECTION_ADDRESS);
  console.log("USDC Address:", USDC_ADDRESS);
  console.log("Mint Price:", MINT_PRICE, "USDC\n");

  // Get NFTCollection contract
  const nftCollection = await hre.ethers.getContractAt("NFTCollection", NFT_COLLECTION_ADDRESS);

  // Set payment token to USDC
  console.log("Setting payment token to USDC...");
  const setTokenTx = await nftCollection.setPaymentToken(USDC_ADDRESS);
  await setTokenTx.wait();
  console.log("✅ Payment token set to USDC");

  // Set mint price in USDC (with 6 decimals)
  const mintPriceInUSDC = hre.ethers.parseUnits(MINT_PRICE, 6);
  console.log("\nSetting mint price to", MINT_PRICE, "USDC...");
  const setPriceTx = await nftCollection.setMintPrice(mintPriceInUSDC);
  await setPriceTx.wait();
  console.log("✅ Mint price set to", MINT_PRICE, "USDC");

  // Verify settings
  const paymentToken = await nftCollection.paymentToken();
  const mintPrice = await nftCollection.mintPrice();
  
  console.log("\n" + "=".repeat(60));
  console.log("📝 CONFIGURATION SUMMARY");
  console.log("=".repeat(60));
  console.log("NFT Collection:", NFT_COLLECTION_ADDRESS);
  console.log("Payment Token:", paymentToken);
  console.log("Mint Price:", hre.ethers.formatUnits(mintPrice, 6), "USDC");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

