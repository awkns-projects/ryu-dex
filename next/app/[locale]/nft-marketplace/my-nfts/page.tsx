/**
 * My NFTs Page
 * Displays user's owned NFTs and allows listing them for auction
 */

import { MyNFTsGrid } from "@/components/nft/MyNFTsGrid";
import { WalletConnectButton } from "@/components/nft/WalletConnectButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";

export default function MyNFTsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/nft-marketplace">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Wallet className="h-8 w-8" />
            My NFTs
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage your NFT collection
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/nft-marketplace/mint">
            <Button variant="outline">Mint New NFT</Button>
          </Link>
          <WalletConnectButton />
        </div>
      </div>

      {/* NFTs Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Your Collection</h2>
        <MyNFTsGrid />
      </div>
    </div>
  );
}

