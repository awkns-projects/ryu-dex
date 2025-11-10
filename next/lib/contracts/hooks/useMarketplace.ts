"use client";

/**
 * Hook for interacting with the Marketplace contract
 * Supports auctions and bidding
 */

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../provider";
import { CONTRACTS } from "../config";
import MarketplaceABI from "../abis/NFTMarketplace.json";

export function useMarketplace() {
  const { signer, provider } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [isMakingBid, setIsMakingBid] = useState(false);
  const [isCancellingListing, setIsCancellingListing] = useState(false);

  useEffect(() => {
    if (signer && CONTRACTS.MARKETPLACE) {
      const marketplaceContract = new ethers.Contract(
        CONTRACTS.MARKETPLACE,
        MarketplaceABI,
        signer
      );
      setContract(marketplaceContract);
    }
  }, [signer]);

  // Load all valid auctions
  useEffect(() => {
    if (!contract) return;

    const loadListings = async () => {
      setIsLoadingListings(true);
      try {
        const validAuctionIds = await contract.getAllValidAuctions();
        
        const auctionPromises = validAuctionIds.map(async (id: ethers.BigNumber) => {
          const auction = await contract.getAuction(id);
          return {
            id: id.toString(),
            auctionId: auction.auctionId.toString(),
            nftContract: auction.nftContract,
            tokenId: auction.tokenId.toString(),
            seller: auction.seller,
            paymentToken: auction.paymentToken,
            minBid: ethers.utils.formatUnits(auction.minBid, 6), // USDC has 6 decimals
            buyoutPrice: ethers.utils.formatUnits(auction.buyoutPrice, 6),
            startTime: new Date(auction.startTime.toNumber() * 1000),
            endTime: new Date(auction.endTime.toNumber() * 1000),
            endTimeInSeconds: auction.endTime.toNumber(),
            highestBidder: auction.highestBidder,
            highestBid: ethers.utils.formatUnits(auction.highestBid, 6),
            ended: auction.ended,
            cancelled: auction.cancelled,
            minimumBidAmount: ethers.utils.formatUnits(auction.minBid, 6),
            buyoutBidAmount: ethers.utils.formatUnits(auction.buyoutPrice, 6),
          };
        });

        const auctions = await Promise.all(auctionPromises);
        setListings(auctions);
      } catch (error) {
        console.error("Error loading listings:", error);
        setListings([]);
      } finally {
        setIsLoadingListings(false);
      }
    };

    loadListings();
    
    // Reload listings every 30 seconds
    const interval = setInterval(loadListings, 30000);
    return () => clearInterval(interval);
  }, [contract]);

  const createAuction = async (params: {
    assetContractAddress: string;
    tokenId: string;
    buyoutBidAmount: string;
    minimumBidAmount: string;
    startTimestamp: Date;
    endTimestamp: Date;
    currencyContractAddress?: string;
    quantity?: string;
  }) => {
    if (!contract) {
      throw new Error("Marketplace contract not initialized");
    }

    setIsCreatingListing(true);
    try {
      const duration = Math.floor(
        (params.endTimestamp.getTime() - params.startTimestamp.getTime()) / 1000
      );

      const minBid = ethers.utils.parseUnits(params.minimumBidAmount, 6);
      const buyoutPrice = ethers.utils.parseUnits(params.buyoutBidAmount, 6);

      const tx = await contract.createAuction(
        params.assetContractAddress,
        params.tokenId,
        params.currencyContractAddress || CONTRACTS.USDC,
        minBid,
        buyoutPrice,
        duration
      );

      const receipt = await tx.wait();
      
      // Get auction ID from event
      const event = receipt.events?.find((e: any) => e.event === "AuctionCreated");
      const auctionId = event?.args?.auctionId;

      return { auctionId: auctionId?.toString() };
    } finally {
      setIsCreatingListing(false);
    }
  };

  const placeBid = async (listingId: string, bidAmount: string) => {
    if (!contract) {
      throw new Error("Marketplace contract not initialized");
    }

    setIsMakingBid(true);
    try {
      const bidAmountWei = ethers.utils.parseUnits(bidAmount, 6);

      const tx = await contract.placeBid(listingId, bidAmountWei);
      await tx.wait();

      return { success: true };
    } finally {
      setIsMakingBid(false);
    }
  };

  const cancelAuction = async (listingId: string) => {
    if (!contract) {
      throw new Error("Marketplace contract not initialized");
    }

    setIsCancellingListing(true);
    try {
      const tx = await contract.cancelAuction(listingId);
      await tx.wait();

      return { success: true };
    } finally {
      setIsCancellingListing(false);
    }
  };

  const endAuction = async (listingId: string) => {
    if (!contract) {
      throw new Error("Marketplace contract not initialized");
    }

    const tx = await contract.endAuction(listingId);
    await tx.wait();

    return { success: true };
  };

  return {
    contract,
    listings,
    isLoadingListings,
    createAuction,
    isCreatingListing,
    placeBid,
    isMakingBid,
    cancelAuction,
    isCancellingListing,
    endAuction,
  };
}

