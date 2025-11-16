/**
 * Contract Configuration
 * Configuration for custom NFT marketplace contracts on Hyperliquid
 */

// Contract addresses - Update these after deployment
export const CONTRACTS = {
  // NFT Collection contract address (ERC721)
  NFT_COLLECTION: process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS || "",

  // Marketplace contract address
  MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "",

  // USDC token contract address on Hyperliquid
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || "",
};

// Hyperliquid EVM Testnet Configuration
export const HYPERLIQUID_TESTNET = {
  chainId: 998,
  name: "HyperEVM Testnet",
  rpcUrl: "https://api.hyperliquid-testnet.xyz/evm",
  nativeCurrency: {
    name: "HYPE",
    symbol: "HYPE",
    decimals: 18,
  },
  blockExplorer: "https://app.hyperliquid-testnet.xyz/explorer",
};

// Hyperliquid EVM Mainnet Configuration
export const HYPERLIQUID_MAINNET = {
  chainId: 998, // Update when mainnet is launched
  name: "HyperEVM",
  rpcUrl: "https://api.hyperliquid.xyz/evm",
  nativeCurrency: {
    name: "HYPE",
    symbol: "HYPE",
    decimals: 18,
  },
  blockExplorer: "https://app.hyperliquid.xyz/explorer",
};

// Active network (switch to mainnet when ready)
export const ACTIVE_NETWORK = process.env.NEXT_PUBLIC_NETWORK === "mainnet"
  ? HYPERLIQUID_MAINNET
  : HYPERLIQUID_TESTNET;

// Validate contracts are configured
export function validateContracts() {
  const missing = [];
  if (!CONTRACTS.NFT_COLLECTION) missing.push("NFT_COLLECTION");
  if (!CONTRACTS.MARKETPLACE) missing.push("MARKETPLACE");
  if (!CONTRACTS.USDC) missing.push("USDC");

  if (missing.length > 0) {
    console.warn(`Missing contract addresses: ${missing.join(", ")}`);
    return false;
  }
  return true;
}

