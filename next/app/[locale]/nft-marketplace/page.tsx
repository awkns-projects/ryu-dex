/**
 * NFT Marketplace Main Page
 * Browse and bid on active NFT auctions
 */

import { MarketplaceGallery } from "@/components/nft/MarketplaceGallery";
import { WalletConnectButton } from "@/components/nft/WalletConnectButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Store } from "lucide-react";

export default function NFTMarketplacePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Store className="h-8 w-8" />
            NFT Marketplace
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse and bid on exclusive NFTs using USDC on Hyperliquid
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/nft-marketplace/my-nfts">
            <Button variant="outline">My NFTs</Button>
          </Link>
          <Link href="/nft-marketplace/mint">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Mint NFT
            </Button>
          </Link>
          <WalletConnectButton />
        </div>
      </div>

      {/* Marketplace Gallery */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Active Auctions</h2>
        <MarketplaceGallery />
      </div>
    </div>
  );
}

