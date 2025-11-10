const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace", function () {
  let nftCollection, marketplace, usdc;
  let owner, seller, bidder1, bidder2, feeRecipient;
  const PLATFORM_FEE = 250; // 2.5%
  const MINT_PRICE = 0;
  const MAX_SUPPLY = 0;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2, feeRecipient] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("Mock USDC", "USDC", 6);

    // Mint USDC to bidders
    await usdc.mint(bidder1.address, ethers.parseUnits("10000", 6));
    await usdc.mint(bidder2.address, ethers.parseUnits("10000", 6));

    // Deploy NFT Collection (free minting with native token)
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    nftCollection = await NFTCollection.deploy(
      "Test NFTs",
      "TNFT",
      "",
      MAX_SUPPLY,
      0, // Free minting
      ethers.ZeroAddress // Native token
    );

    // Deploy Marketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await NFTMarketplace.deploy(PLATFORM_FEE, feeRecipient.address);

    // Mint NFT to seller
    await nftCollection.connect(seller).mint(seller.address, "ipfs://test-token-uri");

    // Approve marketplace to transfer NFT
    await nftCollection.connect(seller).setApprovalForAll(marketplace.target, true);

    // Approve marketplace to spend USDC
    await usdc.connect(bidder1).approve(marketplace.target, ethers.MaxUint256);
    await usdc.connect(bidder2).approve(marketplace.target, ethers.MaxUint256);
  });

  describe("Auction Creation", function () {
    it("Should create an auction", async function () {
      const minBid = ethers.parseUnits("100", 6);
      const buyoutPrice = ethers.parseUnits("1000", 6);
      const duration = 7 * 24 * 60 * 60; // 7 days

      await expect(
        marketplace.connect(seller).createAuction(
          nftCollection.target,
          0,
          usdc.target,
          minBid,
          buyoutPrice,
          duration
        )
      ).to.emit(marketplace, "AuctionCreated");

      const auction = await marketplace.getAuction(0);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.minBid).to.equal(minBid);
      expect(auction.buyoutPrice).to.equal(buyoutPrice);
    });

    it("Should transfer NFT to marketplace", async function () {
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

      expect(await nftCollection.ownerOf(0)).to.equal(marketplace.target);
    });
  });

  describe("Bidding", function () {
    beforeEach(async function () {
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
    });

    it("Should allow placing a valid bid", async function () {
      const bidAmount = ethers.parseUnits("150", 6);

      await expect(
        marketplace.connect(bidder1).placeBid(0, bidAmount)
      ).to.emit(marketplace, "BidPlaced");

      const auction = await marketplace.getAuction(0);
      expect(auction.highestBidder).to.equal(bidder1.address);
      expect(auction.highestBid).to.equal(bidAmount);
    });

    it("Should refund previous bidder when outbid", async function () {
      const bid1 = ethers.parseUnits("150", 6);
      const bid2 = ethers.parseUnits("200", 6);

      await marketplace.connect(bidder1).placeBid(0, bid1);
      const balanceBefore = await usdc.balanceOf(bidder1.address);

      await marketplace.connect(bidder2).placeBid(0, bid2);
      const balanceAfter = await usdc.balanceOf(bidder1.address);

      expect(balanceAfter - balanceBefore).to.equal(bid1);
    });

    it("Should reject bid below minimum", async function () {
      const bidAmount = ethers.parseUnits("50", 6);

      await expect(
        marketplace.connect(bidder1).placeBid(0, bidAmount)
      ).to.be.revertedWith("Bid below minimum");
    });

    it("Should automatically end auction on buyout", async function () {
      const buyoutPrice = ethers.parseUnits("1000", 6);

      await expect(
        marketplace.connect(bidder1).placeBid(0, buyoutPrice)
      ).to.emit(marketplace, "AuctionEnded");

      const auction = await marketplace.getAuction(0);
      expect(auction.ended).to.be.true;
    });
  });

  describe("Auction Ending", function () {
    beforeEach(async function () {
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

      const bidAmount = ethers.parseUnits("150", 6);
      await marketplace.connect(bidder1).placeBid(0, bidAmount);
    });

    it("Should transfer NFT to winner", async function () {
      // Wait for auction to end
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");

      await marketplace.endAuction(0);

      expect(await nftCollection.ownerOf(0)).to.equal(bidder1.address);
    });

    it("Should transfer payment to seller minus fees", async function () {
      const bidAmount = ethers.parseUnits("150", 6);
      const fee = (bidAmount * BigInt(PLATFORM_FEE)) / BigInt(10000);
      const sellerAmount = bidAmount - fee;

      const sellerBalanceBefore = await usdc.balanceOf(seller.address);

      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");

      await marketplace.endAuction(0);

      const sellerBalanceAfter = await usdc.balanceOf(seller.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(sellerAmount);
    });

    it("Should transfer platform fee", async function () {
      const bidAmount = ethers.parseUnits("150", 6);
      const fee = (bidAmount * BigInt(PLATFORM_FEE)) / BigInt(10000);

      const feeBalanceBefore = await usdc.balanceOf(feeRecipient.address);

      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");

      await marketplace.endAuction(0);

      const feeBalanceAfter = await usdc.balanceOf(feeRecipient.address);
      expect(feeBalanceAfter - feeBalanceBefore).to.equal(fee);
    });
  });

  describe("Auction Cancellation", function () {
    it("Should allow seller to cancel auction with no bids", async function () {
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

      await expect(
        marketplace.connect(seller).cancelAuction(0)
      ).to.emit(marketplace, "AuctionCancelled");

      expect(await nftCollection.ownerOf(0)).to.equal(seller.address);
    });

    it("Should not allow cancellation with existing bids", async function () {
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

      await marketplace.connect(bidder1).placeBid(0, minBid);

      await expect(
        marketplace.connect(seller).cancelAuction(0)
      ).to.be.revertedWith("Cannot cancel with bids");
    });
  });
});

// Mock ERC20 contract for testing
const MockERC20Source = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;

    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
`;

