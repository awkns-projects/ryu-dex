require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Sepolia Testnet (for testing before Hyperliquid deployment)
    sepolia: {
      url: process.env.SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    // Hyperliquid Testnet
    "hyperliquid-testnet": {
      url: process.env.HYPERLIQUID_TESTNET_RPC || "https://api.hyperliquid-testnet.xyz/evm",
      chainId: 998,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    // Hyperliquid Mainnet
    "hyperliquid-mainnet": {
      url: process.env.HYPERLIQUID_MAINNET_RPC || "https://api.hyperliquid.xyz/evm",
      chainId: parseInt(process.env.HYPERLIQUID_MAINNET_CHAIN_ID || "998"), // Update when mainnet launches
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    // Localhost for testing
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      // Sepolia uses standard Etherscan
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      // Add Hyperliquid explorer API key if available
      hyperliquid: process.env.HYPERLIQUID_EXPLORER_API_KEY || "no-api-key-needed",
    },
    customChains: [
      {
        network: "hyperliquid-testnet",
        chainId: 998,
        urls: {
          apiURL: "https://app.hyperliquid-testnet.xyz/explorer/api",
          browserURL: "https://app.hyperliquid-testnet.xyz/explorer",
        },
      },
      {
        network: "hyperliquid-mainnet",
        chainId: parseInt(process.env.HYPERLIQUID_MAINNET_CHAIN_ID || "998"),
        urls: {
          apiURL: "https://app.hyperliquid.xyz/explorer/api",
          browserURL: "https://app.hyperliquid.xyz/explorer",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

