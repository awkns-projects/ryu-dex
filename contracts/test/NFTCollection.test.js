const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTCollection", function () {
  let nftCollection, usdc;
  let owner, user1, user2;
  const NAME = "Test NFT Collection";
  const SYMBOL = "TNFT";
  const COLLECTION_URI = "ipfs://collection-uri";
  const MAX_SUPPLY = 100;
  const MINT_PRICE_NATIVE = ethers.parseEther("0.1"); // 0.1 HYPE
  const MINT_PRICE_USDC = ethers.parseUnits("10", 6); // 10 USDC

  describe("Deployment with Native Token", function () {
    beforeEach(async function () {
      [owner, user1, user2] = await ethers.getSigners();

      const NFTCollection = await ethers.getContractFactory("NFTCollection");
      nftCollection = await NFTCollection.deploy(
        NAME,
        SYMBOL,
        COLLECTION_URI,
        MAX_SUPPLY,
        MINT_PRICE_NATIVE,
        ethers.ZeroAddress // Native token
      );
    });

    it("Should set the correct name and symbol", async function () {
      expect(await nftCollection.name()).to.equal(NAME);
      expect(await nftCollection.symbol()).to.equal(SYMBOL);
    });

    it("Should set the correct collection URI", async function () {
      expect(await nftCollection.collectionURI()).to.equal(COLLECTION_URI);
    });

    it("Should set the correct max supply", async function () {
      expect(await nftCollection.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should set the correct mint price", async function () {
      expect(await nftCollection.mintPrice()).to.equal(MINT_PRICE_NATIVE);
    });

    it("Should use native token payment by default", async function () {
      expect(await nftCollection.useERC20Payment()).to.equal(false);
      expect(await nftCollection.paymentToken()).to.equal(ethers.ZeroAddress);
    });

    it("Should not be paused initially", async function () {
      expect(await nftCollection.paused()).to.equal(false);
    });

    it("Should set the correct owner", async function () {
      expect(await nftCollection.owner()).to.equal(owner.address);
    });
  });

  describe("Minting with Native Token", function () {
    beforeEach(async function () {
      [owner, user1, user2] = await ethers.getSigners();

      const NFTCollection = await ethers.getContractFactory("NFTCollection");
      nftCollection = await NFTCollection.deploy(
        NAME,
        SYMBOL,
        COLLECTION_URI,
        MAX_SUPPLY,
        MINT_PRICE_NATIVE,
        ethers.ZeroAddress
      );
    });

    it("Should mint an NFT with correct payment", async function () {
      const tokenURI = "ipfs://token-1";
      await expect(
        nftCollection.connect(user1).mint(user1.address, tokenURI, {
          value: MINT_PRICE_NATIVE,
        })
      )
        .to.emit(nftCollection, "NFTMinted")
        .withArgs(user1.address, 0, tokenURI);

      expect(await nftCollection.ownerOf(0)).to.equal(user1.address);
      expect(await nftCollection.tokenURI(0)).to.equal(tokenURI);
      expect(await nftCollection.totalSupply()).to.equal(1);
    });

    it("Should reject minting with insufficient payment", async function () {
      const tokenURI = "ipfs://token-1";
      await expect(
        nftCollection.connect(user1).mint(user1.address, tokenURI, {
          value: ethers.parseEther("0.05"), // Less than mint price
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should allow minting with overpayment", async function () {
      const tokenURI = "ipfs://token-1";
      await nftCollection.connect(user1).mint(user1.address, tokenURI, {
        value: ethers.parseEther("0.2"), // More than mint price
      });

      expect(await nftCollection.ownerOf(0)).to.equal(user1.address);
    });

    it("Should enforce max supply", async function () {
      // Mint max supply
      for (let i = 0; i < MAX_SUPPLY; i++) {
        await nftCollection.connect(user1).mint(user1.address, `ipfs://token-${i}`, {
          value: MINT_PRICE_NATIVE,
        });
      }

      // Try to mint one more
      await expect(
        nftCollection.connect(user1).mint(user1.address, "ipfs://token-overflow", {
          value: MINT_PRICE_NATIVE,
        })
      ).to.be.revertedWith("Max supply reached");
    });

    it("Should batch mint multiple NFTs", async function () {
      const tokenURIs = ["ipfs://token-1", "ipfs://token-2", "ipfs://token-3"];
      const totalPrice = MINT_PRICE_NATIVE * BigInt(tokenURIs.length);

      await nftCollection.connect(user1).batchMint(user1.address, tokenURIs, {
        value: totalPrice,
      });

      expect(await nftCollection.balanceOf(user1.address)).to.equal(3);
      expect(await nftCollection.totalSupply()).to.equal(3);

      for (let i = 0; i < tokenURIs.length; i++) {
        expect(await nftCollection.ownerOf(i)).to.equal(user1.address);
        expect(await nftCollection.tokenURI(i)).to.equal(tokenURIs[i]);
      }
    });

    it("Should reject batch mint with insufficient payment", async function () {
      const tokenURIs = ["ipfs://token-1", "ipfs://token-2"];
      await expect(
        nftCollection.connect(user1).batchMint(user1.address, tokenURIs, {
          value: MINT_PRICE_NATIVE, // Only enough for 1
        })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Minting with USDC", function () {
    beforeEach(async function () {
      [owner, user1, user2] = await ethers.getSigners();

      // Deploy Mock USDC
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      usdc = await MockERC20.deploy("Mock USDC", "USDC", 6);

      // Mint USDC to users
      await usdc.mint(user1.address, ethers.parseUnits("1000", 6));
      await usdc.mint(user2.address, ethers.parseUnits("1000", 6));

      // Deploy NFT Collection with USDC
      const NFTCollection = await ethers.getContractFactory("NFTCollection");
      nftCollection = await NFTCollection.deploy(
        NAME,
        SYMBOL,
        COLLECTION_URI,
        MAX_SUPPLY,
        MINT_PRICE_USDC,
        usdc.target // Use USDC
      );
    });

    it("Should use ERC20 payment", async function () {
      expect(await nftCollection.useERC20Payment()).to.equal(true);
      expect(await nftCollection.paymentToken()).to.equal(usdc.target);
    });

    it("Should mint an NFT with USDC payment", async function () {
      const tokenURI = "ipfs://token-1";

      // Approve USDC
      await usdc.connect(user1).approve(nftCollection.target, MINT_PRICE_USDC);

      // Mint
      await expect(nftCollection.connect(user1).mint(user1.address, tokenURI))
        .to.emit(nftCollection, "NFTMinted")
        .withArgs(user1.address, 0, tokenURI);

      expect(await nftCollection.ownerOf(0)).to.equal(user1.address);
      expect(await usdc.balanceOf(nftCollection.target)).to.equal(MINT_PRICE_USDC);
    });

    it("Should reject minting without USDC approval", async function () {
      const tokenURI = "ipfs://token-1";

      await expect(
        nftCollection.connect(user1).mint(user1.address, tokenURI)
      ).to.be.reverted;
    });

    it("Should reject minting with native token when using USDC", async function () {
      const tokenURI = "ipfs://token-1";

      await usdc.connect(user1).approve(nftCollection.target, MINT_PRICE_USDC);

      await expect(
        nftCollection.connect(user1).mint(user1.address, tokenURI, {
          value: ethers.parseEther("0.1"),
        })
      ).to.be.revertedWith("Send ERC20, not native token");
    });

    it("Should batch mint with USDC", async function () {
      const tokenURIs = ["ipfs://token-1", "ipfs://token-2", "ipfs://token-3"];
      const totalPrice = MINT_PRICE_USDC * BigInt(tokenURIs.length);

      // Approve USDC
      await usdc.connect(user1).approve(nftCollection.target, totalPrice);

      // Batch mint
      await nftCollection.connect(user1).batchMint(user1.address, tokenURIs);

      expect(await nftCollection.balanceOf(user1.address)).to.equal(3);
      expect(await usdc.balanceOf(nftCollection.target)).to.equal(totalPrice);
    });
  });

  describe("Payment Method Switching", function () {
    beforeEach(async function () {
      [owner, user1, user2] = await ethers.getSigners();

      // Deploy Mock USDC
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      usdc = await MockERC20.deploy("Mock USDC", "USDC", 6);
      await usdc.mint(user1.address, ethers.parseUnits("1000", 6));

      // Deploy with native token
      const NFTCollection = await ethers.getContractFactory("NFTCollection");
      nftCollection = await NFTCollection.deploy(
        NAME,
        SYMBOL,
        COLLECTION_URI,
        MAX_SUPPLY,
        MINT_PRICE_NATIVE,
        ethers.ZeroAddress
      );
    });

    it("Should switch from native to USDC", async function () {
      // Initially native
      expect(await nftCollection.useERC20Payment()).to.equal(false);

      // Switch to USDC
      await expect(nftCollection.setPaymentToken(usdc.target))
        .to.emit(nftCollection, "PaymentTokenUpdated")
        .withArgs(usdc.target, true);

      expect(await nftCollection.useERC20Payment()).to.equal(true);
      expect(await nftCollection.paymentToken()).to.equal(usdc.target);
    });

    it("Should switch from USDC to native", async function () {
      // Switch to USDC first
      await nftCollection.setPaymentToken(usdc.target);
      expect(await nftCollection.useERC20Payment()).to.equal(true);

      // Switch back to native
      await nftCollection.setPaymentToken(ethers.ZeroAddress);

      expect(await nftCollection.useERC20Payment()).to.equal(false);
      expect(await nftCollection.paymentToken()).to.equal(ethers.ZeroAddress);
    });

    it("Should only allow owner to switch payment method", async function () {
      await expect(
        nftCollection.connect(user1).setPaymentToken(usdc.target)
      ).to.be.reverted;
    });

    it("Should mint with new payment method after switching", async function () {
      const tokenURI = "ipfs://token-1";

      // Mint with native first
      await nftCollection.connect(user1).mint(user1.address, tokenURI, {
        value: MINT_PRICE_NATIVE,
      });

      // Switch to USDC
      await nftCollection.setPaymentToken(usdc.target);
      await nftCollection.setMintPrice(MINT_PRICE_USDC);

      // Approve and mint with USDC
      await usdc.connect(user1).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(user1).mint(user1.address, "ipfs://token-2");

      expect(await nftCollection.totalSupply()).to.equal(2);
    });
  });

  describe("Pausing", function () {
    beforeEach(async function () {
      [owner, user1] = await ethers.getSigners();

      const NFTCollection = await ethers.getContractFactory("NFTCollection");
      nftCollection = await NFTCollection.deploy(
        NAME,
        SYMBOL,
        COLLECTION_URI,
        MAX_SUPPLY,
        MINT_PRICE_NATIVE,
        ethers.ZeroAddress
      );
    });

    it("Should pause minting", async function () {
      await expect(nftCollection.setPaused(true))
        .to.emit(nftCollection, "PausedStateChanged")
        .withArgs(true);

      expect(await nftCollection.paused()).to.equal(true);

      await expect(
        nftCollection.connect(user1).mint(user1.address, "ipfs://token-1", {
          value: MINT_PRICE_NATIVE,
        })
      ).to.be.revertedWith("Minting is paused");
    });

    it("Should unpause minting", async function () {
      await nftCollection.setPaused(true);
      await nftCollection.setPaused(false);

      expect(await nftCollection.paused()).to.equal(false);

      await nftCollection.connect(user1).mint(user1.address, "ipfs://token-1", {
        value: MINT_PRICE_NATIVE,
      });

      expect(await nftCollection.ownerOf(0)).to.equal(user1.address);
    });

    it("Should only allow owner to pause", async function () {
      await expect(
        nftCollection.connect(user1).setPaused(true)
      ).to.be.reverted;
    });
  });

  describe("Admin Functions", function () {
    beforeEach(async function () {
      [owner, user1] = await ethers.getSigners();

      const MockERC20 = await ethers.getContractFactory("MockERC20");
      usdc = await MockERC20.deploy("Mock USDC", "USDC", 6);

      const NFTCollection = await ethers.getContractFactory("NFTCollection");
      nftCollection = await NFTCollection.deploy(
        NAME,
        SYMBOL,
        COLLECTION_URI,
        MAX_SUPPLY,
        MINT_PRICE_NATIVE,
        ethers.ZeroAddress
      );
    });

    it("Should update collection URI", async function () {
      const newURI = "ipfs://new-collection-uri";
      await expect(nftCollection.setCollectionURI(newURI))
        .to.emit(nftCollection, "CollectionURIUpdated")
        .withArgs(newURI);

      expect(await nftCollection.collectionURI()).to.equal(newURI);
    });

    it("Should update mint price", async function () {
      const newPrice = ethers.parseEther("0.2");
      await expect(nftCollection.setMintPrice(newPrice))
        .to.emit(nftCollection, "MintPriceUpdated")
        .withArgs(newPrice);

      expect(await nftCollection.mintPrice()).to.equal(newPrice);
    });

    it("Should only allow owner to update settings", async function () {
      await expect(
        nftCollection.connect(user1).setCollectionURI("new-uri")
      ).to.be.reverted;

      await expect(
        nftCollection.connect(user1).setMintPrice(100)
      ).to.be.reverted;
    });

    it("Should withdraw native token balance", async function () {
      // Mint some NFTs
      await nftCollection.connect(user1).mint(user1.address, "ipfs://token-1", {
        value: MINT_PRICE_NATIVE,
      });

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await nftCollection.withdraw();
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should withdraw ERC20 tokens", async function () {
      // Switch to USDC and mint
      await nftCollection.setPaymentToken(usdc.target);
      await nftCollection.setMintPrice(MINT_PRICE_USDC);

      await usdc.mint(user1.address, MINT_PRICE_USDC);
      await usdc.connect(user1).approve(nftCollection.target, MINT_PRICE_USDC);
      await nftCollection.connect(user1).mint(user1.address, "ipfs://token-1");

      // Withdraw USDC
      const balanceBefore = await usdc.balanceOf(owner.address);
      await nftCollection.withdrawERC20(usdc.target);
      const balanceAfter = await usdc.balanceOf(owner.address);

      expect(balanceAfter - balanceBefore).to.equal(MINT_PRICE_USDC);
    });

    it("Should reject withdrawal with no balance", async function () {
      await expect(nftCollection.withdraw()).to.be.revertedWith(
        "No balance to withdraw"
      );
    });
  });

  describe("Free Minting", function () {
    beforeEach(async function () {
      [owner, user1] = await ethers.getSigners();

      const NFTCollection = await ethers.getContractFactory("NFTCollection");
      nftCollection = await NFTCollection.deploy(
        NAME,
        SYMBOL,
        COLLECTION_URI,
        MAX_SUPPLY,
        0, // Free minting
        ethers.ZeroAddress
      );
    });

    it("Should mint for free with native token mode", async function () {
      await nftCollection.connect(user1).mint(user1.address, "ipfs://token-1");
      expect(await nftCollection.ownerOf(0)).to.equal(user1.address);
    });
  });

  describe("Unlimited Supply", function () {
    beforeEach(async function () {
      [owner, user1] = await ethers.getSigners();

      const NFTCollection = await ethers.getContractFactory("NFTCollection");
      nftCollection = await NFTCollection.deploy(
        NAME,
        SYMBOL,
        COLLECTION_URI,
        0, // Unlimited supply
        MINT_PRICE_NATIVE,
        ethers.ZeroAddress
      );
    });

    it("Should allow unlimited minting", async function () {
      // Mint many NFTs (way more than MAX_SUPPLY)
      for (let i = 0; i < 150; i++) {
        await nftCollection.connect(user1).mint(user1.address, `ipfs://token-${i}`, {
          value: MINT_PRICE_NATIVE,
        });
      }

      expect(await nftCollection.totalSupply()).to.equal(150);
    });
  });
});

