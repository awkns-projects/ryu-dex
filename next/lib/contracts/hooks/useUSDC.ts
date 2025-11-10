"use client";

/**
 * Hook for interacting with USDC token contract
 */

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../provider";
import { CONTRACTS } from "../config";
import ERC20ABI from "../abis/ERC20.json";

export function useUSDC() {
  const { signer, account, provider } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    if (signer && CONTRACTS.USDC) {
      const usdcContract = new ethers.Contract(
        CONTRACTS.USDC,
        ERC20ABI,
        signer
      );
      setContract(usdcContract);
    }
  }, [signer]);

  // Load balance when contract or account changes
  useEffect(() => {
    if (!contract || !account) return;

    const loadBalance = async () => {
      setIsLoadingBalance(true);
      try {
        const bal = await contract.balanceOf(account);
        const formattedBalance = ethers.utils.formatUnits(bal, 6); // USDC has 6 decimals
        setBalance(formattedBalance);
      } catch (error) {
        console.error("Error loading USDC balance:", error);
        setBalance("0");
      } finally {
        setIsLoadingBalance(false);
      }
    };

    loadBalance();
    
    // Reload balance every 10 seconds
    const interval = setInterval(loadBalance, 10000);
    return () => clearInterval(interval);
  }, [contract, account]);

  const approveMarketplace = async (amount: string) => {
    if (!contract) {
      throw new Error("USDC contract not initialized");
    }

    const amountWei = ethers.utils.parseUnits(amount, 6);

    const tx = await contract.approve(CONTRACTS.MARKETPLACE, amountWei);
    await tx.wait();

    return { success: true };
  };

  const getAllowance = async () => {
    if (!contract || !account) {
      return "0";
    }

    const allowance = await contract.allowance(account, CONTRACTS.MARKETPLACE);
    return ethers.utils.formatUnits(allowance, 6);
  };

  const hasAllowance = async (amount: string) => {
    const allowance = await getAllowance();
    return parseFloat(allowance) >= parseFloat(amount);
  };

  return {
    contract,
    balance: {
      value: balance,
      displayValue: balance,
      symbol: "USDC",
    },
    isLoadingBalance,
    approveMarketplace,
    getAllowance,
    hasAllowance,
  };
}

