const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace Integration", function () {
  let nftCollection, marketplace, usdc;
  let owner, seller, bidder1, bidder2, feeRecipient;
  const PLATFORM_FEE = 250; // 2.5%
  const MINT_PRICE_USDC = ethers.parseUnits("5", 6); // 5 USDC

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2, feeRecipient] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("Mock USDC", "USDC", 6);

    // Mint USDC to users
    await usdc.mint(seller.address, ethers.parseUnits("100", 6));
    await usdc.mint(bidder1.address, ethers.parseUnits("10000", 6));
    await usdc.mint(bidder2.address, ethers.parseUnits("10000", 6));

    // Deploy NFT Collection with USDC minting
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    nftCollection = await NFTCollection.deploy(
      "Test NFTs",
      "TNFT",
      "ipfs://collection",
      0, // Unlimited supply
      MINT_PRICE_USDC,
      usdc.target // Use USDC for minting
    );

    // Deploy Marketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await NFTMarketplace.deploy(PLATFORM_FEE, feeRecipient.address);

    // Approve USDC for minting
    await usdc.connect(seller).approve(nftCollection.target, MINT_PRICE_USDC);

    // Seller mints an NFT
    await nftCollection.connect(seller).mint(seller.address, "ipfs://test-token-uri");

    // Approve marketplace to transfer NFTs
    await nftCollection.connect(seller).setApprovalForAll(marketplace.target, true);

    // Approve marketplace to spend USDC for bidding
    await usdc.connect(bidder1).approve(marketplace.target, ethers.MaxUint256);
    await usdc.connect(bidder2).approve(marketplace.target, ethers.MaxUint256);
  });

  describe("Complete Auction Flow", function () {
    it("Should complete full auction cycle: mint → list → bid → end", async function () {
      const minBid = ethers.parseUnits("100", 6);
      const buyoutPrice = ethers.parseUnits("1000", 6);
      const duration = 7 * 24 * 60 * 60; // 7 days

      // 1. Create auction
      await expect(
        marketplace.connect(seller).createAuction(
          nftCollection.target,
          0, // Token ID
          usdc.target,
          minBid,
          buyoutPrice,
          duration
        )
      ).to.emit(marketplace, "AuctionCreated");

      // Verify NFT transferred to marketplace
      expect(await nftCollection.ownerOf(0)).to.equal(marketplace.target);

      // 2. Place bids
      const bid1 = ethers.parseUnits("150", 6);
      await marketplace.connect(bidder1).placeBid(0, bid1);

      const auction1 = await marketplace.getAuction(0);
      expect(auction1.highestBidder).to.equal(bidder1.address);
      expect(auction1.highestBid).to.equal(bid1);

      // 3. Outbid
      const bid2 = ethers.parseUnits("200", 6);
      const bidder1BalanceBefore = await usdc.balanceOf(bidder1.address);

      await marketplace.connect(bidder2).placeBid(0, bid2);

      // Bidder1 should be refunded
      const bidder1BalanceAfter = await usdc.balanceOf(bidder1.address);
      expect(bidder1BalanceAfter - bidder1BalanceBefore).to.equal(bid1);

      // 4. End auction
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");

      const sellerBalanceBefore = await usdc.balanceOf(seller.address);
      const feeRecipientBalanceBefore = await usdc.balanceOf(feeRecipient.address);

      await marketplace.endAuction(0);

      // 5. Verify outcomes
      // NFT to winner
      expect(await nftCollection.ownerOf(0)).to.equal(bidder2.address);

      // Payment to seller (minus fee)
      const fee = (bid2 * BigInt(PLATFORM_FEE)) / BigInt(10000);
      const sellerAmount = bid2 - fee;
      const sellerBalanceAfter = await usdc.balanceOf(seller.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(sellerAmount);

      // Platform fee
      const feeRecipientBalanceAfter = await usdc.balanceOf(feeRecipient.address);
      expect(feeRecipientBalanceAfter - feeRecipientBalanceBefore).to.equal(fee);
    });

    it("Should handle buyout correctly", async function () {
      const minBid = ethers.parseUnits("100", 6);
      const buyoutPrice = ethers.parseUnits("1000", 6);
      const duration = 7 * 24 * 60 * 60;

      // Create auction
      await marketplace.connect(seller).createAuction(
        nftCollection.target,
        0,
        usdc.target,
        minBid,
        buyoutPrice,
        duration
      );

      // Place buyout bid
      const sellerBalanceBefore = await usdc.balanceOf(seller.address);

      await expect(marketplace.connect(bidder1).placeBid(0, buyoutPrice))
        .to.emit(marketplace, "AuctionEnded");

      // Auction should end immediately
      const auction = await marketplace.getAuction(0);
      expect(auction.ended).to.be.true;

      // NFT to bidder
      expect(await nftCollection.ownerOf(0)).to.equal(bidder1.address);

      // Payment processed
      const sellerBalanceAfter = await usdc.balanceOf(seller.address);
      expect(sellerBalanceAfter).to.be.gt(sellerBalanceBefore);
    });
  });

  describe("Multiple NFTs Workflow", function () {
    beforeEach(async function () {
      // Mint more NFTs for seller
      await usdc.connect(seller).approve(nftCollection.target, MINT_PRICE_USDC * BigInt(5));

      const tokenURIs = [
        "ipfs://token-1",
        "ipfs://token-2",
        "ipfs://token-3",
        "ipfs://token-4",
        "ipfs://token-5",
      ];

      await nftCollection.connect(seller).batchMint(seller.address, tokenURIs);
    });

    it("Should handle multiple concurrent auctions", async function () {
      const minBid = ethers.parseUnits("100", 6);
      const buyoutPrice = ethers.parseUnits("1000", 6);
      const duration = 7 * 24 * 60 * 60;

      // Create multiple auctions
      for (let i = 1; i <= 3; i++) {
        await marketplace.connect(seller).createAuction(
          nftCollection.target,
          i,
          usdc.target,
          minBid,
          buyoutPrice,
          duration
        );
      }

      // Verify all auctions are active
      const validAuctions = await marketplace.getAllValidAuctions();
      expect(validAuctions.length).to.equal(3);

      // Bid on different auctions
      await marketplace.connect(bidder1).placeBid(0, ethers.parseUnits("150", 6));
      await marketplace.connect(bidder2).placeBid(1, ethers.parseUnits("200", 6));
      await marketplace.connect(bidder1).placeBid(2, ethers.parseUnits("175", 6));

      // Verify bids
      const auction0 = await marketplace.getAuction(0);
      const auction1 = await marketplace.getAuction(1);
      const auction2 = await marketplace.getAuction(2);

      expect(auction0.highestBidder).to.equal(bidder1.address);
      expect(auction1.highestBidder).to.equal(bidder2.address);
      expect(auction2.highestBidder).to.equal(bidder1.address);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle auction with no bids", async function () {
      const minBid = ethers.parseUnits("100", 6);
      const buyoutPrice = ethers.parseUnits("1000", 6);
      const duration = 3600; // 1 hour (minimum duration)

      await marketplace.connect(seller).createAuction(
        nftCollection.target,
        0,
        usdc.target,
        minBid,
        buyoutPrice,
        duration
      );

      // Wait for auction to end
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");

      // End auction
      await marketplace.endAuction(0);

      // NFT should return to seller
      expect(await nftCollection.ownerOf(0)).to.equal(seller.address);
    });

    it("Should prevent listing already listed NFT", async function () {
      const minBid = ethers.parseUnits("100", 6);
      const buyoutPrice = ethers.parseUnits("1000", 6);
      const duration = 7 * 24 * 60 * 60;

      // Create auction
      await marketplace.connect(seller).createAuction(
        nftCollection.target,
        0,
        usdc.target,
        minBid,
        buyoutPrice,
        duration
      );

      // Try to create another auction for same NFT
      await expect(
        marketplace.connect(seller).createAuction(
          nftCollection.target,
          0,
          usdc.target,
          minBid,
          buyoutPrice,
          duration
        )
      ).to.be.reverted; // NFT not owned by seller anymore
    });

    it("Should handle cancellation before first bid", async function () {
      const minBid = ethers.parseUnits("100", 6);
      const buyoutPrice = ethers.parseUnits("1000", 6);
      const duration = 7 * 24 * 60 * 60;

      await marketplace.connect(seller).createAuction(
        nftCollection.target,
        0,
        usdc.target,
        minBid,
        buyoutPrice,
        duration
      );

      // Cancel auction
      await expect(marketplace.connect(seller).cancelAuction(0))
        .to.emit(marketplace, "AuctionCancelled");

      // NFT returned to seller
      expect(await nftCollection.ownerOf(0)).to.equal(seller.address);

      const auction = await marketplace.getAuction(0);
      expect(auction.cancelled).to.be.true;
    });
  });

  describe("Payment Token Switching During Active Marketplace", function () {
    it("Should handle collection payment token change independently", async function () {
      // Original collection uses USDC for minting
      expect(await nftCollection.useERC20Payment()).to.be.true;

      // Create auction (marketplace uses USDC for bidding)
      const minBid = ethers.parseUnits("100", 6);
      const buyoutPrice = ethers.parseUnits("1000", 6);
      const duration = 7 * 24 * 60 * 60;

      await marketplace.connect(seller).createAuction(
        nftCollection.target,
        0,
        usdc.target,
        minBid,
        buyoutPrice,
        duration
      );

      // Switch collection to native token for future mints
      await nftCollection.setPaymentToken(ethers.ZeroAddress);
      await nftCollection.setMintPrice(ethers.parseEther("0.1"));

      // Existing auction should still work with USDC
      await marketplace.connect(bidder1).placeBid(0, minBid);

      const auction = await marketplace.getAuction(0);
      expect(auction.highestBidder).to.equal(bidder1.address);

      // New mints should use native token
      await nftCollection.connect(seller).mint(seller.address, "ipfs://new-token", {
        value: ethers.parseEther("0.1"),
      });

      expect(await nftCollection.ownerOf(1)).to.equal(seller.address);
    });
  });

  describe("Gas Usage Estimates", function () {
    it("Should estimate gas for common operations", async function () {
      // Mint NFT with USDC
      await usdc.connect(seller).approve(nftCollection.target, MINT_PRICE_USDC);
      const mintTx = await nftCollection.connect(seller).mint(seller.address, "ipfs://gas-test");
      const mintReceipt = await mintTx.wait();
      console.log("      Gas used for USDC mint:", mintReceipt.gasUsed.toString());

      // Create auction
      const minBid = ethers.parseUnits("100", 6);
      const buyoutPrice = ethers.parseUnits("1000", 6);
      const duration = 7 * 24 * 60 * 60;

      const createTx = await marketplace.connect(seller).createAuction(
        nftCollection.target,
        1,
        usdc.target,
        minBid,
        buyoutPrice,
        duration
      );
      const createReceipt = await createTx.wait();
      console.log("      Gas used for create auction:", createReceipt.gasUsed.toString());

      // Place bid
      const bidTx = await marketplace.connect(bidder1).placeBid(0, minBid);
      const bidReceipt = await bidTx.wait();
      console.log("      Gas used for place bid:", bidReceipt.gasUsed.toString());

      // End auction
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");

      const endTx = await marketplace.endAuction(0);
      const endReceipt = await endTx.wait();
      console.log("      Gas used for end auction:", endReceipt.gasUsed.toString());
    });
  });
});

