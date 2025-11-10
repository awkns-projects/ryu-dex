# Custom NFT Marketplace Smart Contracts

Complete smart contract suite for an NFT marketplace with English auction functionality on Hyperliquid.

## 📦 Contracts Overview

### NFTCollection.sol
**ERC721-compliant NFT collection contract** with minting functionality

**Features:**
- Mint individual or batch NFTs
- Configurable mint price
- Optional max supply limit
- Pausable minting
- Collection metadata
- Fully compatible with OpenZeppelin standards

**Key Functions:**
```solidity
// Mint a single NFT
function mint(address to, string memory tokenURI) public payable returns (uint256)

// Batch mint multiple NFTs
function batchMint(address to, string[] memory tokenURIs) public payable returns (uint256[] memory)

// Admin functions
function setMintPrice(uint256 newPrice) public onlyOwner
function setPaused(bool isPaused) public onlyOwner
function withdraw() public onlyOwner
```

### NFTMarketplace.sol
**Marketplace contract** supporting English auctions with ERC20 bidding

**Features:**
- Create English auctions
- Place bids in USDC (or any ERC20)
- Buyout functionality (instant purchase)
- Platform fees
- Automatic auction settlement
- Seller cancellation (if no bids)
- Refund previous bidders

**Key Functions:**
```solidity
// Create an auction
function createAuction(
    address nftContract,
    uint256 tokenId,
    address paymentToken,
    uint256 minBid,
    uint256 buyoutPrice,
    uint256 duration
) external returns (uint256)

// Place a bid
function placeBid(uint256 auctionId, uint256 bidAmount) external

// End auction (after expiry)
function endAuction(uint256 auctionId) external

// Cancel auction (seller, no bids)
function cancelAuction(uint256 auctionId) external

// Query functions
function getAuction(uint256 auctionId) external view returns (Auction memory)
function getAllValidAuctions() external view returns (uint256[] memory)
function isAuctionActive(uint256 auctionId) external view returns (bool)
```

## 🚀 Quick Start

### Prerequisites

```bash
# Install Node.js 18+
node --version

# Install dependencies
cd contracts
npm install
```

### Configuration

1. **Create .env file:**

```bash
cp env.example .env
```

2. **Fill in environment variables:**

```env
# Your private key (NEVER commit this!)
PRIVATE_KEY=0x...

# Network RPC URLs (optional, defaults provided)
HYPERLIQUID_TESTNET_RPC=https://api.hyperliquid-testnet.xyz/evm

# Deployment configuration
NFT_COLLECTION_NAME=My NFT Collection
NFT_COLLECTION_SYMBOL=MNFT
NFT_COLLECTION_URI=
NFT_MAX_SUPPLY=0
NFT_MINT_PRICE=0

MARKETPLACE_PLATFORM_FEE=250
MARKETPLACE_FEE_RECIPIENT=0x_your_address
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Deploy to Testnet

```bash
npm run deploy:testnet
```

### Deploy to Mainnet

```bash
npm run deploy:mainnet
```

### Verify Contracts

```bash
npm run verify:testnet
# or
npm run verify:mainnet
```

## 📖 Detailed Documentation

### NFTCollection Contract

#### Constructor Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| name_ | string | Name of the NFT collection |
| symbol_ | string | Symbol for the collection |
| collectionURI_ | string | URI for collection metadata |
| maxSupply_ | uint256 | Maximum supply (0 for unlimited) |
| mintPrice_ | uint256 | Price to mint in wei |

#### State Variables

```solidity
string public collectionURI;      // Collection metadata URI
uint256 public maxSupply;         // Maximum number of NFTs
uint256 public mintPrice;         // Price to mint one NFT
bool public paused;               // Paused state
```

#### Events

```solidity
event NFTMinted(address indexed minter, uint256 indexed tokenId, string tokenURI);
event CollectionURIUpdated(string newURI);
event MintPriceUpdated(uint256 newPrice);
event PausedStateChanged(bool isPaused);
```

#### Access Control

- **Owner Only**: `setCollectionURI`, `setMintPrice`, `setPaused`, `withdraw`
- **Public**: `mint`, `batchMint`, `totalSupply`

### NFTMarketplace Contract

#### Constructor Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| platformFee_ | uint256 | Fee in basis points (250 = 2.5%) |
| feeRecipient_ | address | Address to receive fees |

#### Auction Struct

```solidity
struct Auction {
    uint256 auctionId;
    address nftContract;
    uint256 tokenId;
    address seller;
    address paymentToken;
    uint256 minBid;
    uint256 buyoutPrice;
    uint256 startTime;
    uint256 endTime;
    address highestBidder;
    uint256 highestBid;
    bool ended;
    bool cancelled;
}
```

#### Events

```solidity
event AuctionCreated(uint256 indexed auctionId, address indexed nftContract, uint256 indexed tokenId, ...);
event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 winningBid);
event AuctionCancelled(uint256 indexed auctionId);
```

#### Auction Flow

1. **Seller creates auction**
   - NFT transferred to marketplace
   - Auction parameters set
   - Auction ID assigned

2. **Bidders place bids**
   - USDC transferred from bidder
   - Previous bidder refunded
   - Highest bid updated

3. **Auction ends** (one of):
   - **Buyout**: Bid meets/exceeds buyout price
   - **Time expiry**: After endTime
   - **Cancellation**: Seller cancels (if no bids)

4. **Settlement**
   - NFT to winner
   - USDC to seller (minus platform fee)
   - Platform fee collected

#### Security Features

- ✅ ReentrancyGuard on all state-changing functions
- ✅ Checks-Effects-Interactions pattern
- ✅ SafeTransfer for all token transfers
- ✅ Input validation
- ✅ Event emission for tracking
- ✅ Owner-only admin functions

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Test Coverage

```bash
npx hardhat coverage
```

### Gas Report

```bash
REPORT_GAS=true npm test
```

### Test Scenarios Covered

**NFTCollection:**
- ✅ Single mint
- ✅ Batch mint
- ✅ Mint price validation
- ✅ Max supply enforcement
- ✅ Pause functionality
- ✅ Owner functions
- ✅ Token URI retrieval

**NFTMarketplace:**
- ✅ Auction creation
- ✅ NFT transfer to marketplace
- ✅ Bidding (valid/invalid)
- ✅ Bid refunds
- ✅ Buyout functionality
- ✅ Auction expiry
- ✅ Settlement
- ✅ Fee calculation
- ✅ Cancellation

## 📝 Usage Examples

### Deploying Contracts

```javascript
// deploy.js
const NFTCollection = await ethers.getContractFactory("NFTCollection");
const nftCollection = await NFTCollection.deploy(
  "My Collection",
  "MYC",
  "ipfs://collection-uri",
  10000,  // max supply
  0       // free minting
);

const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
const marketplace = await NFTMarketplace.deploy(
  250,                // 2.5% fee
  feeRecipient.address
);
```

### Minting NFTs

```javascript
const tx = await nftCollection.mint(
  userAddress,
  "ipfs://token-metadata-uri",
  { value: mintPrice }
);
```

### Creating Auction

```javascript
// Approve marketplace
await nftCollection.approve(marketplaceAddress, tokenId);

// Create auction
await marketplace.createAuction(
  nftCollectionAddress,
  tokenId,
  usdcAddress,
  ethers.utils.parseUnits("100", 6),  // min bid: 100 USDC
  ethers.utils.parseUnits("1000", 6), // buyout: 1000 USDC
  7 * 24 * 60 * 60                     // 7 days
);
```

### Placing Bid

```javascript
// Approve USDC
await usdc.approve(marketplaceAddress, bidAmount);

// Place bid
await marketplace.placeBid(
  auctionId,
  ethers.utils.parseUnits("150", 6)  // 150 USDC
);
```

## 🔒 Security Considerations

### Auditing

⚠️ **Important**: These contracts have NOT been professionally audited. Before deploying to mainnet with real value:

1. Get professional audit from reputable firm
2. Run automated security tools (Slither, Mythril)
3. Test extensively on testnet
4. Start with small amounts
5. Have incident response plan

### Known Considerations

1. **Front-running**: Auctions can be front-run (inherent to blockchain)
2. **Gas prices**: Ensure users have enough gas on Hyperliquid
3. **USDC approval**: Users must approve before bidding
4. **NFT approval**: Sellers must approve before listing
5. **Time-based**: Uses block.timestamp (acceptable for auctions)

### Best Practices Implemented

✅ OpenZeppelin contracts for standards
✅ ReentrancyGuard on critical functions
✅ Input validation
✅ Event emission
✅ Access control
✅ Safe math (built-in Solidity 0.8+)
✅ Pull payment pattern (refunds)

## 🛠️ Development

### Project Structure

```
contracts/
├── NFTCollection.sol        # Main NFT contract
├── NFTMarketplace.sol       # Marketplace contract
├── test/
│   ├── MockERC20.sol        # Mock USDC for testing
│   └── NFTMarketplace.test.js
├── scripts/
│   ├── deploy.js            # Deployment script
│   └── verify.js            # Verification script
├── hardhat.config.js        # Hardhat configuration
└── package.json
```

### Adding Custom Functionality

#### Example: Add Direct Listings

```solidity
// Add to NFTMarketplace.sol
struct DirectListing {
    uint256 listingId;
    address nftContract;
    uint256 tokenId;
    address seller;
    address paymentToken;
    uint256 price;
    bool active;
}

mapping(uint256 => DirectListing) public directListings;

function createDirectListing(
    address nftContract,
    uint256 tokenId,
    address paymentToken,
    uint256 price
) external returns (uint256) {
    // Implementation
}

function buyDirectListing(uint256 listingId) external {
    // Implementation
}
```

## 📊 Gas Estimates

| Operation | Estimated Gas | Approx. Cost on Hyperliquid |
|-----------|---------------|----------------------------|
| Mint NFT | ~80,000 | ~0.001 HYPE |
| Create Auction | ~150,000 | ~0.002 HYPE |
| Place Bid | ~100,000 | ~0.001 HYPE |
| End Auction | ~120,000 | ~0.002 HYPE |
| Cancel Auction | ~80,000 | ~0.001 HYPE |

*Note: Hyperliquid has very low gas fees*

## 🔗 Integration

### Frontend Integration

See `/next/lib/contracts/` for frontend integration:

- `config.ts` - Contract addresses and network config
- `provider.tsx` - Web3 provider component
- `hooks/` - React hooks for contract interaction

### Contract Addresses

After deployment, update these in your .env:

```env
NEXT_PUBLIC_NFT_COLLECTION_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
```

## 📚 Additional Resources

- [OpenZeppelin Documentation](https://docs.openzeppelin.com/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hyperliquid Documentation](https://hyperliquid.xyz/docs)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

These contracts are provided as-is. Use at your own risk. Always audit smart contracts before deploying with real funds.

---

**Built with ❤️ using OpenZeppelin and Hardhat**

