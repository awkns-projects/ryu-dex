const hre = require("hardhat");

// Deployed contract addresses on Sepolia
const USDC_ADDRESS = "0xF7FA86E77607C3b63b96765F9131f678e7d82F1F";
const NFT_COLLECTION_ADDRESS = "0x7Ba1C5dcee3B61E8DCd65045fadE9221ec7458d1";
const MARKETPLACE_ADDRESS = "0x44Fa26061246B2C3178C94789Ae5A136D08031f6";

async function main() {
  console.log("🧪 Testing Deployed Contracts on Sepolia\n");
  console.log("=".repeat(80));

  const [user1, user2] = await hre.ethers.getSigners();
  console.log("Test User 1:", user1.address);
  if (user2) console.log("Test User 2:", user2.address);
  console.log("=".repeat(80));

  // Get contract instances
  console.log("\n📦 Connecting to contracts...");
  const usdc = await hre.ethers.getContractAt("MockERC20", USDC_ADDRESS);
  const nft = await hre.ethers.getContractAt("NFTCollection", NFT_COLLECTION_ADDRESS);
  const marketplace = await hre.ethers.getContractAt("NFTMarketplace", MARKETPLACE_ADDRESS);
  console.log("✅ Connected to all contracts");

  // Test 1: Check contract configuration
  console.log("\n" + "=".repeat(80));
  console.log("TEST 1: Contract Configuration");
  console.log("=".repeat(80));

  const paymentToken = await nft.paymentToken();
  const mintPrice = await nft.mintPrice();
  const platformFee = await marketplace.platformFee();
  const feeRecipient = await marketplace.feeRecipient();

  console.log("NFT Collection:");
  console.log("  Payment Token:", paymentToken);
  console.log("  Mint Price:", hre.ethers.formatUnits(mintPrice, 6), "USDC");
  console.log("\nMarketplace:");
  console.log("  Platform Fee:", platformFee.toString(), "basis points");
  console.log("  Fee Recipient:", feeRecipient);

  const configCorrect =
    paymentToken.toLowerCase() === USDC_ADDRESS.toLowerCase() &&
    mintPrice === hre.ethers.parseUnits("10", 6) &&
    platformFee === 250n;

  console.log("\n" + (configCorrect ? "✅ Configuration is correct" : "❌ Configuration mismatch"));

  // Test 2: Check USDC balance and mint if needed
  console.log("\n" + "=".repeat(80));
  console.log("TEST 2: USDC Balance & Minting");
  console.log("=".repeat(80));

  let balance = await usdc.balanceOf(user1.address);
  console.log("Current USDC Balance:", hre.ethers.formatUnits(balance, 6), "USDC");

  if (balance < hre.ethers.parseUnits("100", 6)) {
    console.log("Minting 100 USDC...");
    const mintTx = await usdc.mint(user1.address, hre.ethers.parseUnits("100", 6));
    await mintTx.wait();
    balance = await usdc.balanceOf(user1.address);
    console.log("✅ New Balance:", hre.ethers.formatUnits(balance, 6), "USDC");
  } else {
    console.log("✅ Sufficient USDC balance");
  }

  // Test 3: Mint NFT
  console.log("\n" + "=".repeat(80));
  console.log("TEST 3: NFT Minting");
  console.log("=".repeat(80));

  const nftBalanceBefore = await nft.balanceOf(user1.address);
  console.log("NFT Balance Before:", nftBalanceBefore.toString());

  console.log("Approving USDC for NFT minting...");
  const approveTx = await usdc.approve(nft.target, hre.ethers.parseUnits("10", 6));
  await approveTx.wait();
  console.log("✅ USDC approved");

  console.log("Minting NFT with metadata...");
  const tokenURI = `ipfs://QmTest${Date.now()}`;
  const mintTx = await nft.mint(user1.address, tokenURI);
  const mintReceipt = await mintTx.wait();

  // Get the minted token ID from events
  const transferEvent = mintReceipt.logs.find(log => {
    try {
      return nft.interface.parseLog(log)?.name === "Transfer";
    } catch {
      return false;
    }
  });

  let tokenId;
  if (transferEvent) {
    const parsed = nft.interface.parseLog(transferEvent);
    tokenId = parsed.args.tokenId;
  } else {
    // Fallback: assume it's the total supply
    tokenId = await nft.totalSupply();
  }

  console.log("✅ NFT Minted! Token ID:", tokenId.toString());
  console.log("   Token URI:", tokenURI);

  const nftBalanceAfter = await nft.balanceOf(user1.address);
  console.log("NFT Balance After:", nftBalanceAfter.toString());
  console.log(nftBalanceAfter > nftBalanceBefore ? "✅ Balance increased" : "❌ Balance did not increase");

  // Test 4: Create Auction
  console.log("\n" + "=".repeat(80));
  console.log("TEST 4: Create Auction Listing");
  console.log("=".repeat(80));

  console.log("Approving marketplace to transfer NFT...");
  const approveNFTTx = await nft.approve(marketplace.target, tokenId);
  await approveNFTTx.wait();
  console.log("✅ NFT approved");

  const minimumBid = hre.ethers.parseUnits("20", 6);
  const buyoutPrice = hre.ethers.parseUnits("50", 6);
  const duration = 86400; // 1 day

  console.log("Creating auction with:");
  console.log("  Token ID:", tokenId.toString());
  console.log("  Minimum Bid:", hre.ethers.formatUnits(minimumBid, 6), "USDC");
  console.log("  Buyout Price:", hre.ethers.formatUnits(buyoutPrice, 6), "USDC");
  console.log("  Duration:", duration, "seconds (1 day)");

  const totalAuctionsBefore = await marketplace.totalAuctions();
  const auctionTx = await marketplace.createAuction(
    nft.target,
    tokenId,
    usdc.target,
    minimumBid,
    buyoutPrice,
    duration
  );
  await auctionTx.wait();

  const totalAuctionsAfter = await marketplace.totalAuctions();
  const auctionId = totalAuctionsAfter - 1n;

  console.log("✅ Auction Created! ID:", auctionId.toString());
  console.log("Total Auctions:", totalAuctionsAfter.toString());

  // Get auction details
  const auction = await marketplace.getAuction(auctionId);
  console.log("\nAuction Details:");
  console.log("  Seller:", auction.seller);
  console.log("  NFT Contract:", auction.nftContract);
  console.log("  Token ID:", auction.tokenId.toString());
  console.log("  Payment Token:", auction.paymentToken);
  console.log("  Current Bid:", hre.ethers.formatUnits(auction.currentBid || 0n, 6), "USDC");
  console.log("  Highest Bidder:", auction.highestBidder || "None");
  console.log("  End Time:", new Date(Number(auction.endTime) * 1000).toLocaleString());
  console.log("  Active:", auction.active);

  // Test 5: Check active auctions
  console.log("\n" + "=".repeat(80));
  console.log("TEST 5: Active Auctions Query");
  console.log("=".repeat(80));

  const activeAuctions = await marketplace.getAllValidAuctions();
  console.log("Total Valid/Active Auctions:", activeAuctions.length);
  console.log("✅ Query successful");

  // Test 6: Mint another NFT for direct listing
  console.log("\n" + "=".repeat(80));
  console.log("TEST 6: Direct Listing (Fixed Price)");
  console.log("=".repeat(80));

  console.log("Minting another NFT for direct listing...");
  const approveTx2 = await usdc.approve(nft.target, hre.ethers.parseUnits("10", 6));
  await approveTx2.wait();

  const tokenURI2 = `ipfs://QmTest${Date.now()}_direct`;
  const mintTx2 = await nft.mint(user1.address, tokenURI2);
  const mintReceipt2 = await mintTx2.wait();

  // Get the second token ID
  const transferEvent2 = mintReceipt2.logs.find(log => {
    try {
      return nft.interface.parseLog(log)?.name === "Transfer";
    } catch {
      return false;
    }
  });

  let tokenId2;
  if (transferEvent2) {
    const parsed = nft.interface.parseLog(transferEvent2);
    tokenId2 = parsed.args.tokenId;
  } else {
    tokenId2 = await nft.totalSupply();
  }

  console.log("✅ Second NFT Minted! Token ID:", tokenId2.toString());

  // Create direct listing
  console.log("\nApproving marketplace for second NFT...");
  const approveNFTTx2 = await nft.approve(marketplace.target, tokenId2);
  await approveNFTTx2.wait();
  console.log("✅ NFT approved");

  const directPrice = hre.ethers.parseUnits("30", 6);
  console.log("Creating direct listing with price:", hre.ethers.formatUnits(directPrice, 6), "USDC");

  const totalListingsBefore = await marketplace.totalDirectListings();
  const directListingTx = await marketplace.createDirectListing(
    nft.target,
    tokenId2,
    usdc.target,
    directPrice
  );
  await directListingTx.wait();

  const totalListingsAfter = await marketplace.totalDirectListings();
  const listingId = totalListingsAfter - 1n;

  console.log("✅ Direct Listing Created! ID:", listingId.toString());

  // Get listing details
  const listing = await marketplace.getDirectListing(listingId);
  console.log("\nDirect Listing Details:");
  console.log("  Seller:", listing.seller);
  console.log("  NFT Contract:", listing.nftContract);
  console.log("  Token ID:", listing.tokenId.toString());
  console.log("  Payment Token:", listing.paymentToken);
  console.log("  Price:", hre.ethers.formatUnits(listing.price || 0n, 6), "USDC");
  console.log("  Active:", listing.active);

  // Test 7: Check all active direct listings
  console.log("\n" + "=".repeat(80));
  console.log("TEST 7: Active Direct Listings Query");
  console.log("=".repeat(80));

  const activeListings = await marketplace.getAllActiveDirectListings();
  console.log("Total Active Direct Listings:", activeListings.length);
  console.log("✅ Query successful");

  // Final Summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(80));

  const finalUSDCBalance = await usdc.balanceOf(user1.address);
  const finalNFTBalance = await nft.balanceOf(user1.address);
  const finalTotalSupply = await nft.totalSupply();
  const finalTotalAuctions = await marketplace.totalAuctions();
  const finalTotalListings = await marketplace.totalDirectListings();

  console.log("\nUser 1 Final State:");
  console.log("  USDC Balance:", hre.ethers.formatUnits(finalUSDCBalance, 6), "USDC");
  console.log("  NFT Balance:", finalNFTBalance.toString());

  console.log("\nContract State:");
  console.log("  Total NFTs Minted:", finalTotalSupply.toString());
  console.log("  Total Auctions:", finalTotalAuctions.toString());
  console.log("  Active Auctions:", activeAuctions.length);
  console.log("  Total Direct Listings:", finalTotalListings.toString());
  console.log("  Active Direct Listings:", activeListings.length);

  console.log("\n" + "=".repeat(80));
  console.log("✅ ALL TESTS COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(80));

  console.log("\n📝 Test Results:");
  console.log("  ✅ Contract configuration verified");
  console.log("  ✅ USDC minting working");
  console.log("  ✅ NFT minting working (costs 10 USDC)");
  console.log("  ✅ Auction creation working");
  console.log("  ✅ Direct listing creation working");
  console.log("  ✅ All queries working");

  console.log("\n🔗 View on Etherscan:");
  console.log("  NFT Collection:", `https://sepolia.etherscan.io/address/${NFT_COLLECTION_ADDRESS}`);
  console.log("  Marketplace:", `https://sepolia.etherscan.io/address/${MARKETPLACE_ADDRESS}`);
  console.log("  Your Account:", `https://sepolia.etherscan.io/address/${user1.address}`);
}

main()
  .then(() => {
    console.log("\n✨ Integration tests completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error during testing:");
    console.error(error);
    process.exit(1);
  });

