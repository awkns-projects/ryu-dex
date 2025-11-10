#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all contract tests and generates a report
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=".repeat(80));
console.log("🧪 RUNNING COMPLETE CONTRACT TEST SUITE");
console.log("=".repeat(80));
console.log("");

const startTime = Date.now();

try {
  console.log("📦 Running NFTCollection Tests...\n");
  execSync("npx hardhat test test/NFTCollection.test.js", {
    stdio: "inherit",
  });

  console.log("\n" + "=".repeat(80));
  console.log("📦 Running NFTMarketplace Tests...\n");
  execSync("npx hardhat test test/NFTMarketplace.test.js", {
    stdio: "inherit",
  });

  console.log("\n" + "=".repeat(80));
  console.log("📦 Running Integration Tests...\n");
  execSync("npx hardhat test test/Integration.test.js", {
    stdio: "inherit",
  });

  console.log("\n" + "=".repeat(80));
  console.log("📦 Running Position NFT Tests (AI Trader Use Case)...\n");
  execSync("npx hardhat test test/PositionNFT.test.js", {
    stdio: "inherit",
  });

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log("\n" + "=".repeat(80));
  console.log("✅ ALL TESTS PASSED!");
  console.log("=".repeat(80));
  console.log(`⏱️  Total Duration: ${duration}s`);
  console.log("");
  console.log("📊 Test Coverage:");
  console.log("  ✅ NFTCollection - All minting scenarios");
  console.log("  ✅ NFTMarketplace - Auctions & fixed price listings");
  console.log("  ✅ Integration - End-to-end workflows");
  console.log("  ✅ Position NFTs - AI trader use case");
  console.log("  ✅ USDC minting - Payment token handling");
  console.log("  ✅ Fixed price sales - Direct listings");
  console.log("  ✅ Auction bidding - Competition scenarios");
  console.log("");
  console.log("🎉 Your contracts are ready for deployment!");
  console.log("=".repeat(80));

  process.exit(0);
} catch (error) {
  console.error("\n" + "=".repeat(80));
  console.error("❌ TESTS FAILED");
  console.error("=".repeat(80));
  console.error("\nPlease fix the errors above before deploying.");
  process.exit(1);
}

