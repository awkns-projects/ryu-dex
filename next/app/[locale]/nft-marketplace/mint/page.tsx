/**
 * NFT Minting Page
 * Allows users to create new NFTs from the platform collection
 */

import { MintNFTForm } from "@/components/nft/MintNFTForm";
import { WalletConnectButton } from "@/components/nft/WalletConnectButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function MintNFTPage() {
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
            <Sparkles className="h-8 w-8" />
            Mint Your NFT
          </h1>
          <p className="text-muted-foreground mt-2">
            Create a unique NFT from our exclusive collection
          </p>
        </div>
        <WalletConnectButton />
      </div>

      {/* Minting Form */}
      <div className="py-8">
        <MintNFTForm />
      </div>

      {/* Info Section */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-muted p-6 rounded-lg space-y-4">
          <h3 className="font-semibold text-lg">How It Works</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Connect your wallet to the Hyperliquid network</li>
            <li>Upload your artwork and provide NFT details</li>
            <li>Mint your NFT to the blockchain</li>
            <li>Your NFT will appear in "My NFTs"</li>
            <li>List your NFT for auction to start earning USDC</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

