"use client";

/**
 * Marketplace Gallery Component
 * Displays all active auction listings in the marketplace
 */

import { useMarketplace } from "@/lib/contracts/hooks";
import { AuctionBidCard } from "./AuctionBidCard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ShoppingBag } from "lucide-react";

export function MarketplaceGallery() {
  const { listings, isLoadingListings } = useMarketplace();

  if (isLoadingListings) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <Card className="py-20">
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No Active Auctions</h3>
              <p className="text-muted-foreground">
                Check back later for new NFT auctions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <AuctionBidCard
          key={listing.id}
          listing={listing}
          nftMetadata={{
            name: listing.asset?.name || `NFT #${listing.tokenId}`,
            description: listing.asset?.description || "",
            image: listing.asset?.image || "",
          }}
        />
      ))}
    </div>
  );
}

