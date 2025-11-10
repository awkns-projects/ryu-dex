"use client";

/**
 * Hook for interacting with the NFT Collection contract
 */

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../provider";
import { CONTRACTS } from "../config";
import NFTCollectionABI from "../abis/NFTCollection.json";

export function useNFTCollection() {
  const { signer, account, provider } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

  useEffect(() => {
    if (signer && CONTRACTS.NFT_COLLECTION) {
      const nftContract = new ethers.Contract(
        CONTRACTS.NFT_COLLECTION,
        NFTCollectionABI,
        signer
      );
      setContract(nftContract);
    }
  }, [signer]);

  const mintNFTToUser = async (
    to: string,
    metadata: {
      name: string;
      description: string;
      image: File | string;
      properties?: Record<string, any>;
    }
  ) => {
    if (!contract) {
      throw new Error("Contract not initialized");
    }

    setIsMinting(true);
    try {
      // In a real implementation, you would upload metadata to IPFS
      // For now, we'll create a simple JSON string
      const tokenURI = JSON.stringify({
        name: metadata.name,
        description: metadata.description,
        image: typeof metadata.image === "string" ? metadata.image : "",
        attributes: metadata.properties || {},
      });

      // Get mint price and payment method
      const mintPrice = await contract.mintPrice();
      const useERC20 = await contract.useERC20Payment();
      const paymentToken = await contract.paymentToken();

      // If using ERC20 (USDC) for minting, approve first
      if (useERC20 && mintPrice.gt(0)) {
        const { ethers } = await import("ethers");
        const ERC20ABI = (await import("../abis/ERC20.json")).default;
        const tokenContract = new ethers.Contract(paymentToken, ERC20ABI, signer);

        // Check allowance
        const allowance = await tokenContract.allowance(to, contract.address);
        if (allowance.lt(mintPrice)) {
          const approveTx = await tokenContract.approve(contract.address, ethers.constants.MaxUint256);
          await approveTx.wait();
        }

        // Mint with ERC20 (no value sent)
        const tx = await contract.mint(to, tokenURI);
        const receipt = await tx.wait();

        const event = receipt.events?.find((e: any) => e.event === "NFTMinted");
        const tokenId = event?.args?.tokenId;
        return { tokenId: tokenId?.toString() };
      } else {
        // Mint with native token (HYPE)
        const tx = await contract.mint(to, tokenURI, {
          value: mintPrice,
        });

        const receipt = await tx.wait();

        const event = receipt.events?.find((e: any) => e.event === "NFTMinted");
        const tokenId = event?.args?.tokenId;
        return { tokenId: tokenId?.toString() };
      }
    } finally {
      setIsMinting(false);
    }
  };

  const getOwnedNFTs = async (owner: string) => {
    if (!contract || !provider) {
      return [];
    }

    setIsLoadingNFTs(true);
    try {
      const balance = await contract.balanceOf(owner);
      const totalSupply = await contract.totalSupply();

      const ownedNFTs = [];

      // This is a simple implementation - for production, use events or a subgraph
      for (let i = 0; i < totalSupply.toNumber(); i++) {
        try {
          const tokenOwner = await contract.ownerOf(i);
          if (tokenOwner.toLowerCase() === owner.toLowerCase()) {
            const tokenURI = await contract.tokenURI(i);
            let metadata;

            try {
              metadata = JSON.parse(tokenURI);
            } catch {
              metadata = { name: `NFT #${i}`, description: "", image: "" };
            }

            ownedNFTs.push({
              tokenId: i.toString(),
              owner: tokenOwner,
              metadata,
            });
          }
        } catch (error) {
          // Token might not exist or other error
          continue;
        }
      }

      return ownedNFTs;
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  const approveMarketplace = async (tokenId: string) => {
    if (!contract) {
      throw new Error("Contract not initialized");
    }

    const tx = await contract.approve(CONTRACTS.MARKETPLACE, tokenId);
    await tx.wait();
  };

  const setApprovalForAll = async (approved: boolean) => {
    if (!contract) {
      throw new Error("Contract not initialized");
    }

    const tx = await contract.setApprovalForAll(CONTRACTS.MARKETPLACE, approved);
    await tx.wait();
  };

  return {
    contract,
    mintNFTToUser,
    getOwnedNFTs,
    approveMarketplace,
    setApprovalForAll,
    isMinting,
    isLoadingNFTs,
  };
}

