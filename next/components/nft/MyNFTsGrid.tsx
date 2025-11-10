"use client";

/**
 * My NFTs Grid Component
 * Displays user's owned NFTs with option to list them
 */

import { useState, useEffect } from "react";
import { useWeb3, useNFTCollection } from "@/lib/contracts/hooks";
import { ListNFTForm } from "./ListNFTForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Tag } from "lucide-react";

export function MyNFTsGrid() {
  const { account: address } = useWeb3();
  const { getOwnedNFTs, isLoadingNFTs } = useNFTCollection();
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const [myNFTs, setMyNFTs] = useState<any[]>([]);

  // Load NFTs owned by the current user
  useEffect(() => {
    if (address) {
      getOwnedNFTs(address).then(setMyNFTs);
    }
  }, [address, getOwnedNFTs]);

  if (!address) {
    return (
      <Card className="py-20">
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-muted-foreground">
              Please connect your wallet to view your NFTs
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingNFTs) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (myNFTs.length === 0) {
    return (
      <Card className="py-20">
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold">No NFTs Yet</h3>
              <p className="text-muted-foreground">
                Mint your first NFT to get started
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {myNFTs.map((nft) => (
          <Card key={nft.tokenId} className="overflow-hidden">
            <div className="aspect-square relative overflow-hidden">
              <img
                src={nft.metadata.image || "/placeholder-nft.png"}
                alt={nft.metadata.name || "NFT"}
                className="object-cover w-full h-full"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">
                {nft.metadata.name || `NFT #${nft.tokenId}`}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {nft.metadata.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setSelectedNFT(nft.tokenId)}
                className="w-full"
                variant="outline"
              >
                <Tag className="mr-2 h-4 w-4" />
                List for Auction
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List NFT Dialog */}
      <Dialog open={!!selectedNFT} onOpenChange={() => setSelectedNFT(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>List NFT for Auction</DialogTitle>
            <DialogDescription>
              Set your auction parameters and list your NFT on the marketplace
            </DialogDescription>
          </DialogHeader>
          {selectedNFT && (
            <ListNFTForm
              tokenId={selectedNFT}
              onSuccess={() => setSelectedNFT(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

