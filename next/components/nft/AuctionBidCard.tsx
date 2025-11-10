"use client";

/**
 * Auction Bid Card Component
 * Displays auction details and allows users to place bids
 */

import { useState } from "react";
import { useWeb3, useMarketplace, useUSDC } from "@/lib/contracts/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Gavel, Clock, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuctionBidCardProps {
  listing: any; // Type from thirdweb SDK
  nftMetadata?: {
    name: string;
    description: string;
    image: string;
  };
}

export function AuctionBidCard({ listing, nftMetadata }: AuctionBidCardProps) {
  const { account: address } = useWeb3();
  const { placeBid, isMakingBid } = useMarketplace();
  const { balance, approveMarketplace, hasAllowance } = useUSDC();

  const [bidAmount, setBidAmount] = useState("");

  const isActive = new Date(listing.endTimeInSeconds * 1000) > new Date();
  const timeRemaining = isActive
    ? formatDistanceToNow(new Date(listing.endTimeInSeconds * 1000), {
      addSuffix: true,
    })
    : "Auction ended";

  const handlePlaceBid = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    // Check if bid is higher than current minimum
    const minimumNextBid = listing.minimumBidAmount || listing.buyoutBidAmount;
    if (parseFloat(bidAmount) < parseFloat(minimumNextBid)) {
      toast.error(`Bid must be at least ${minimumNextBid} USDC`);
      return;
    }

    try {
      // Check if approval is needed
      const hasApproval = await hasAllowance(bidAmount);
      
      if (!hasApproval) {
        // First, approve the marketplace to spend USDC
        toast.info("Approving USDC...");
        await approveMarketplace(bidAmount);
      }

      // Then place the bid
      toast.info("Placing bid...");
      await placeBid(listing.id, bidAmount);

      toast.success("Bid placed successfully!");
      setBidAmount("");
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Failed to place bid. Please try again.");
    }
  };

  return (
    <Card className="w-full">
      {/* NFT Image */}
      {nftMetadata?.image && (
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <img
            src={nftMetadata.image}
            alt={nftMetadata.name}
            className="object-cover w-full h-full"
          />
          {!isActive && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg">
                Auction Ended
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{nftMetadata?.name || `NFT #${listing.tokenId}`}</CardTitle>
            <CardDescription>{nftMetadata?.description}</CardDescription>
          </div>
          {isActive && (
            <Badge variant="default" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Live
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Auction Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Bid</span>
            <span className="text-lg font-bold">
              {listing.minimumBidAmount || "0"} USDC
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Buyout Price</span>
            <span className="text-md font-semibold">
              {listing.buyoutBidAmount} USDC
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Time Remaining
            </span>
            <span className="text-sm font-medium">{timeRemaining}</span>
          </div>
        </div>

        {/* Bidding Section */}
        {isActive && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor={`bid-${listing.id}`}>Your Bid (USDC)</Label>
              <Input
                id={`bid-${listing.id}`}
                type="number"
                step="0.01"
                min="0"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Min: ${listing.minimumBidAmount || listing.buyoutBidAmount}`}
              />
              {balance && (
                <p className="text-xs text-muted-foreground">
                  Your balance: {balance.displayValue} USDC
                </p>
              )}
            </div>

            <Button
              onClick={handlePlaceBid}
              className="w-full"
              disabled={isMakingBid || !address || !isActive}
            >
              {isMakingBid ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Bid...
                </>
              ) : (
                <>
                  <Gavel className="mr-2 h-4 w-4" />
                  Place Bid
                </>
              )}
            </Button>

            {!address && (
              <p className="text-sm text-muted-foreground text-center">
                Connect wallet to place bids
              </p>
            )}
          </div>
        )}

        {/* Winner Display (if auction ended) */}
        {!isActive && listing.winnerAddress && (
          <div className="bg-muted p-4 rounded-lg flex items-center gap-3">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Winner</p>
              <p className="text-xs text-muted-foreground font-mono">
                {listing.winnerAddress.slice(0, 6)}...{listing.winnerAddress.slice(-4)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

