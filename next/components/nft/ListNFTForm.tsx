"use client";

/**
 * NFT Listing Form Component
 * Allows users to list their NFTs for auction on the marketplace
 */

import { useState } from "react";
import { useWeb3, useMarketplace } from "@/lib/contracts/hooks";
import { CONTRACTS } from "@/lib/contracts/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Calendar } from "lucide-react";
import { addDays, format } from "date-fns";

interface ListNFTFormProps {
  tokenId: string;
  onSuccess?: () => void;
}

export function ListNFTForm({ tokenId, onSuccess }: ListNFTFormProps) {
  const { account: address } = useWeb3();
  const { createAuction, isCreatingListing } = useMarketplace();

  const [formData, setFormData] = useState({
    minimumBid: "",
    buyoutPrice: "",
    durationDays: "7",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const startDate = new Date();
      const endDate = addDays(startDate, parseInt(formData.durationDays));

      // Create auction listing
      const result = await createAuction({
        assetContractAddress: CONTRACTS.NFT_COLLECTION,
        tokenId: tokenId,
        minimumBidAmount: formData.minimumBid,
        buyoutBidAmount: formData.buyoutPrice,
        startTimestamp: startDate,
        endTimestamp: endDate,
      });

      toast.success("NFT listed for auction successfully!");

      // Reset form
      setFormData({
        minimumBid: "",
        buyoutPrice: "",
        durationDays: "7",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error listing NFT:", error);
      toast.error("Failed to list NFT. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>List NFT for Auction</CardTitle>
        <CardDescription>
          Set your auction parameters. Bids will be made in USDC.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Minimum Bid */}
          <div className="space-y-2">
            <Label htmlFor="minimumBid">Minimum Bid (USDC) *</Label>
            <Input
              id="minimumBid"
              type="number"
              step="0.01"
              min="0"
              value={formData.minimumBid}
              onChange={(e) =>
                setFormData({ ...formData, minimumBid: e.target.value })
              }
              placeholder="0.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              Starting price for the auction
            </p>
          </div>

          {/* Buyout Price */}
          <div className="space-y-2">
            <Label htmlFor="buyoutPrice">Buyout Price (USDC) *</Label>
            <Input
              id="buyoutPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.buyoutPrice}
              onChange={(e) =>
                setFormData({ ...formData, buyoutPrice: e.target.value })
              }
              placeholder="0.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              Instant purchase price to end the auction immediately
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Auction Duration (Days) *</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="30"
              value={formData.durationDays}
              onChange={(e) =>
                setFormData({ ...formData, durationDays: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Auction ends on:{" "}
              {format(addDays(new Date(), parseInt(formData.durationDays)), "PPP")}
            </p>
          </div>

          {/* Price Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Auction Summary</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starting Bid:</span>
                <span className="font-medium">{formData.minimumBid || "0"} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buyout Price:</span>
                <span className="font-medium">{formData.buyoutPrice || "0"} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{formData.durationDays} days</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isCreatingListing || !address}
          >
            {isCreatingListing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Listing...
              </>
            ) : (
              "List for Auction"
            )}
          </Button>

          {!address && (
            <p className="text-sm text-muted-foreground text-center">
              Please connect your wallet to list NFTs
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

