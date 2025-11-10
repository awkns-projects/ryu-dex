const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Position NFT Marketplace - AI Trader Use Case", function () {
  let nftCollection, marketplace, usdc;
  let owner, trader1, trader2, bidder1, bidder2, feeRecipient;
  const PLATFORM_FEE = 250; // 2.5%
  const MINT_PRICE_USDC = ethers.parseUnits("5", 6); // 5 USDC to mint position NFT

  beforeEach(async function () {
    [owner, trader1, trader2, bidder1, bidder2, feeRecipient] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("Mock USDC", "USDC", 6);

    // Mint USDC to users
    await usdc.mint(trader1.address, ethers.parseUnits("1000", 6));
    await usdc.mint(trader2.address, ethers.parseUnits("1000", 6));
    await usdc.mint(bidder1.address, ethers.parseUnits("10000", 6));
    await usdc.mint(bidder2.address, ethers.parseUnits("10000", 6));

    // Deploy NFT Collection for Position NFTs with USDC minting
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    nftCollection = await NFTCollection.deploy(
      "AI Trader Position NFTs",
      "AIPOS",
      "ipfs://position-collection-metadata",
      0, // Unlimited supply
      MINT_PRICE_USDC,
      usdc.target // Use USDC for minting
    );

    // Deploy Marketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await NFTMarketplace.deploy(PLATFORM_FEE, feeRecipient.address);

    // Approve marketplace to transfer NFTs
    await nftCollection.connect(trader1).setApprovalForAll(marketplace.target, true);
    await nftCollection.connect(trader2).setApprovalForAll(marketplace.target, true);

    // Approve marketplace to spend USDC for buying/bidding
    await usdc.connect(bidder1).approve(marketplace.target, ethers.MaxUint256);
    await usdc.connect(bidder2).approve(marketplace.target, ethers.MaxUint256);
  });

  describe("Position NFT Creation", function () {
    it("Should allow trader to mint position NFT with USDC", async function () {
      // Simulate: Trader creates AI agent and agent creates a leveraged position
      const positionMetadata = JSON.stringify({
        name: "Long BTC Position #1",
        description: "10x leveraged long position on BTC/USD",
        image: "ipfs://position-image-1",
        attributes: {
          positionId: "pos_12345",
          traderId: "trader_001",
          agentName: "AI Trader Bot Alpha",
          symbol: "BTC/USD",
          leverage: "10x",
          entryPrice: "45000",
          positionSize: "1.5",
          pnl: "+2450.50",
          pnlPercent: "+24.5%",
          timestamp: Date.now(),
        },
      });

      // Approve USDC for minting
      await usdc.connect(trader1).approve(nftCollection.target, MINT_PRICE_USDC);

      // Mint position NFT
      await expect(nftCollection.connect(trader1).mint(trader1.address, positionMetadata))
        .to.emit(nftCollection, "NFTMinted")
        .withArgs(trader1.address, 0, positionMetadata);

      // Verify ownership
      expect(await nftCollection.ownerOf(0)).to.equal(trader1.address);

      // Verify USDC was paid
      expect(await usdc.balanceOf(nftCollection.target)).to.equal(MINT_PRICE_USDC);
    });

    it("Should store position metadata in token URI", async function () {
      const positionMetadata = JSON.stringify({
        name: "Short ETH Position #2",
        attributes: {
          positionId: "pos_67890",
          symbol: "ETH/USD",
          leverage: "5x",
          entryPrice: "3200",
        },
      });

      await usdc.connect(trader1).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(trader1).mint(trader1.address, positionMetadata);

      const tokenURI = await nftCollection.tokenURI(0);
      expect(tokenURI).to.equal(positionMetadata);
    });

    it("Should allow multiple traders to mint position NFTs", async function () {
      // Trader 1 mints position
      await usdc.connect(trader1).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(trader1).mint(trader1.address, "position-1-metadata");

      // Trader 2 mints position
      await usdc.connect(trader2).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(trader2).mint(trader2.address, "position-2-metadata");

      expect(await nftCollection.ownerOf(0)).to.equal(trader1.address);
      expect(await nftCollection.ownerOf(1)).to.equal(trader2.address);
      expect(await nftCollection.totalSupply()).to.equal(2);
    });
  });

  describe("Position NFT - Auction Listing", function () {
    beforeEach(async function () {
      // Mint a position NFT for trader1
      await usdc.connect(trader1).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(trader1).mint(
        trader1.address,
        JSON.stringify({
          name: "Profitable BTC Position",
          attributes: { positionId: "pos_auction_001", pnl: "+5000" },
        })
      );
    });

    it("Should allow position owner to list NFT on auction", async function () {
      const minBid = ethers.parseUnits("100", 6); // 100 USDC
      const buyoutPrice = ethers.parseUnits("500", 6); // 500 USDC
      const duration = 7 * 24 * 60 * 60; // 7 days

      const tx = await marketplace.connect(trader1).createAuction(
        nftCollection.target,
        0,
        usdc.target,
        minBid,
        buyoutPrice,
        duration
      );

      await expect(tx)
        .to.emit(marketplace, "AuctionCreated");

      // Verify auction was created
      const auction = await marketplace.getAuction(0);
      expect(auction.seller).to.equal(trader1.address);
      expect(auction.minBid).to.equal(minBid);
      expect(auction.buyoutPrice).to.equal(buyoutPrice);

      // NFT transferred to marketplace
      expect(await nftCollection.ownerOf(0)).to.equal(marketplace.target);
    });

    it("Should allow users to bid on position NFT with USDC", async function () {
      const minBid = ethers.parseUnits("100", 6);
      const buyoutPrice = ethers.parseUnits("500", 6);
      const duration = 7 * 24 * 60 * 60;

      // Create auction
      await marketplace.connect(trader1).createAuction(
        nftCollection.target,
        0,
        usdc.target,
        minBid,
        buyoutPrice,
        duration
      );

      // Bidder 1 places bid
      await marketplace.connect(bidder1).placeBid(0, ethers.parseUnits("150", 6));

      const auction = await marketplace.getAuction(0);
      expect(auction.highestBidder).to.equal(bidder1.address);
      expect(auction.highestBid).to.equal(ethers.parseUnits("150", 6));
    });

    it("Should complete auction and transfer position NFT to winner", async function () {
      const minBid = ethers.parseUnits("100", 6);
      const buyoutPrice = ethers.parseUnits("500", 6);
      const duration = 3600; // 1 hour (minimum duration)

      // Create auction
      await marketplace.connect(trader1).createAuction(
        nftCollection.target,
        0,
        usdc.target,
        minBid,
        buyoutPrice,
        duration
      );

      // Place bid
      const bidAmount = ethers.parseUnits("200", 6);
      await marketplace.connect(bidder1).placeBid(0, bidAmount);

      // Wait for auction to end
      await ethers.provider.send("evm_increaseTime", [3601]); // Wait for auction to end
      await ethers.provider.send("evm_mine");

      const trader1BalanceBefore = await usdc.balanceOf(trader1.address);

      // End auction
      await marketplace.endAuction(0);

      // Verify NFT transferred to winner
      expect(await nftCollection.ownerOf(0)).to.equal(bidder1.address);

      // Verify payment to seller (minus fee)
      const fee = (bidAmount * BigInt(PLATFORM_FEE)) / BigInt(10000);
      const sellerAmount = bidAmount - fee;
      const trader1BalanceAfter = await usdc.balanceOf(trader1.address);
      expect(trader1BalanceAfter - trader1BalanceBefore).to.equal(sellerAmount);
    });
  });

  describe("Position NFT - Fixed Price Listing", function () {
    beforeEach(async function () {
      // Mint a position NFT for trader2
      await usdc.connect(trader2).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(trader2).mint(
        trader2.address,
        JSON.stringify({
          name: "ETH Long Position",
          attributes: { positionId: "pos_direct_001", pnl: "+3000" },
        })
      );
    });

    it("Should allow position owner to create fixed price listing", async function () {
      const price = ethers.parseUnits("300", 6); // 300 USDC

      await expect(
        marketplace.connect(trader2).createDirectListing(
          nftCollection.target,
          0,
          usdc.target,
          price
        )
      )
        .to.emit(marketplace, "DirectListingCreated")
        .withArgs(0, nftCollection.target, 0, trader2.address, price);

      // NFT transferred to marketplace
      expect(await nftCollection.ownerOf(0)).to.equal(marketplace.target);

      // Verify listing details
      const listing = await marketplace.getDirectListing(0);
      expect(listing.seller).to.equal(trader2.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.be.true;
    });

    it("Should allow user to buy position NFT at fixed price", async function () {
      const price = ethers.parseUnits("300", 6);

      // Create listing
      await marketplace.connect(trader2).createDirectListing(
        nftCollection.target,
        0,
        usdc.target,
        price
      );

      const trader2BalanceBefore = await usdc.balanceOf(trader2.address);
      const bidder1BalanceBefore = await usdc.balanceOf(bidder1.address);

      // Buy listing
      await expect(marketplace.connect(bidder1).buyDirectListing(0))
        .to.emit(marketplace, "DirectListingSold")
        .withArgs(0, bidder1.address, price);

      // Verify NFT transferred to buyer
      expect(await nftCollection.ownerOf(0)).to.equal(bidder1.address);

      // Verify payment (minus platform fee)
      const fee = (price * BigInt(PLATFORM_FEE)) / BigInt(10000);
      const sellerAmount = price - fee;

      const trader2BalanceAfter = await usdc.balanceOf(trader2.address);
      const bidder1BalanceAfter = await usdc.balanceOf(bidder1.address);

      expect(trader2BalanceAfter - trader2BalanceBefore).to.equal(sellerAmount);
      expect(bidder1BalanceBefore - bidder1BalanceAfter).to.equal(price);

      // Listing should be inactive
      const listing = await marketplace.getDirectListing(0);
      expect(listing.active).to.be.false;
    });

    it("Should calculate and transfer platform fee correctly", async function () {
      const price = ethers.parseUnits("1000", 6); // 1000 USDC

      await marketplace.connect(trader2).createDirectListing(
        nftCollection.target,
        0,
        usdc.target,
        price
      );

      const feeRecipientBalanceBefore = await usdc.balanceOf(feeRecipient.address);

      await marketplace.connect(bidder1).buyDirectListing(0);

      const feeRecipientBalanceAfter = await usdc.balanceOf(feeRecipient.address);
      const expectedFee = (price * BigInt(PLATFORM_FEE)) / BigInt(10000); // 2.5% of 1000 = 25 USDC

      expect(feeRecipientBalanceAfter - feeRecipientBalanceBefore).to.equal(expectedFee);
    });

    it("Should allow seller to cancel fixed price listing", async function () {
      const price = ethers.parseUnits("300", 6);

      await marketplace.connect(trader2).createDirectListing(
        nftCollection.target,
        0,
        usdc.target,
        price
      );

      // Cancel listing
      await expect(marketplace.connect(trader2).cancelDirectListing(0))
        .to.emit(marketplace, "DirectListingCancelled")
        .withArgs(0);

      // NFT returned to seller
      expect(await nftCollection.ownerOf(0)).to.equal(trader2.address);

      // Listing should be inactive
      const listing = await marketplace.getDirectListing(0);
      expect(listing.active).to.be.false;
    });

    it("Should not allow buyer to be the seller", async function () {
      const price = ethers.parseUnits("300", 6);

      await marketplace.connect(trader2).createDirectListing(
        nftCollection.target,
        0,
        usdc.target,
        price
      );

      await expect(
        marketplace.connect(trader2).buyDirectListing(0)
      ).to.be.revertedWith("Seller cannot buy");
    });

    it("Should not allow buying inactive listing", async function () {
      const price = ethers.parseUnits("300", 6);

      await marketplace.connect(trader2).createDirectListing(
        nftCollection.target,
        0,
        usdc.target,
        price
      );

      // Buy once
      await marketplace.connect(bidder1).buyDirectListing(0);

      // Try to buy again
      await expect(
        marketplace.connect(bidder2).buyDirectListing(0)
      ).to.be.revertedWith("Listing not active");
    });
  });

  describe("Complex Position NFT Scenarios", function () {
    it("Should handle multiple position NFTs with different listing types", async function () {
      // Trader1 mints and lists on auction
      await usdc.connect(trader1).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(trader1).mint(trader1.address, "position-1");

      await marketplace.connect(trader1).createAuction(
        nftCollection.target,
        0,
        usdc.target,
        ethers.parseUnits("100", 6),
        ethers.parseUnits("500", 6),
        7 * 24 * 60 * 60
      );

      // Trader2 mints and lists at fixed price
      await usdc.connect(trader2).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(trader2).mint(trader2.address, "position-2");

      await marketplace.connect(trader2).createDirectListing(
        nftCollection.target,
        1,
        usdc.target,
        ethers.parseUnits("300", 6)
      );

      // Verify both are active
      const validAuctions = await marketplace.getAllValidAuctions();
      const activeListings = await marketplace.getAllActiveDirectListings();

      expect(validAuctions.length).to.equal(1);
      expect(activeListings.length).to.equal(1);

      // Buy fixed price listing
      await marketplace.connect(bidder1).buyDirectListing(0);
      expect(await nftCollection.ownerOf(1)).to.equal(bidder1.address);

      // Bid on auction
      await marketplace.connect(bidder2).placeBid(0, ethers.parseUnits("150", 6));
      const auction = await marketplace.getAuction(0);
      expect(auction.highestBidder).to.equal(bidder2.address);
    });

    it("Should handle position NFT with high profit correctly", async function () {
      const highProfitPosition = JSON.stringify({
        name: "Super Profitable Position",
        description: "AI bot made 500% profit on this position",
        attributes: {
          positionId: "pos_profit_999",
          pnl: "+125000",
          pnlPercent: "+500%",
          entryPrice: "25000",
          currentPrice: "150000",
          leverage: "20x",
        },
      });

      await usdc.connect(trader1).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(trader1).mint(trader1.address, highProfitPosition);

      // List at premium price
      const premiumPrice = ethers.parseUnits("5000", 6); // 5000 USDC
      await marketplace.connect(trader1).createDirectListing(
        nftCollection.target,
        0,
        usdc.target,
        premiumPrice
      );

      // Someone buys it
      await marketplace.connect(bidder1).buyDirectListing(0);

      expect(await nftCollection.ownerOf(0)).to.equal(bidder1.address);
    });

    it("Should query all active listings", async function () {
      // Create multiple listings
      for (let i = 0; i < 3; i++) {
        await usdc.connect(trader1).approve(nftCollection.target, MINT_PRICE_USDC);
        await nftCollection.connect(trader1).mint(trader1.address, `position-${i}`);
        await marketplace.connect(trader1).createDirectListing(
          nftCollection.target,
          i,
          usdc.target,
          ethers.parseUnits("100", 6)
        );
      }

      const activeListings = await marketplace.getAllActiveDirectListings();
      expect(activeListings.length).to.equal(3);

      // Buy one
      await marketplace.connect(bidder1).buyDirectListing(0);

      // Should have 2 active now
      const updatedListings = await marketplace.getAllActiveDirectListings();
      expect(updatedListings.length).to.equal(2);
    });
  });

  describe("Position NFT Edge Cases", function () {
    it("Should handle position NFT with loss", async function () {
      const lossPosition = JSON.stringify({
        name: "Losing Position",
        attributes: {
          positionId: "pos_loss_001",
          pnl: "-1500",
          pnlPercent: "-30%",
        },
      });

      await usdc.connect(trader1).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(trader1).mint(trader1.address, lossPosition);

      // Try to sell at low price
      await marketplace.connect(trader1).createDirectListing(
        nftCollection.target,
        0,
        usdc.target,
        ethers.parseUnits("10", 6) // Very low price
      );

      // Still should work
      await marketplace.connect(bidder1).buyDirectListing(0);
      expect(await nftCollection.ownerOf(0)).to.equal(bidder1.address);
    });

    it("Should prevent listing same NFT twice", async function () {
      await usdc.connect(trader1).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(trader1).mint(trader1.address, "position-1");

      // List once
      await marketplace.connect(trader1).createDirectListing(
        nftCollection.target,
        0,
        usdc.target,
        ethers.parseUnits("100", 6)
      );

      // Try to list again (should fail - NFT already transferred)
      await expect(
        marketplace.connect(trader1).createDirectListing(
          nftCollection.target,
          0,
          usdc.target,
          ethers.parseUnits("200", 6)
        )
      ).to.be.reverted;
    });
  });
});

