"use client";

/**
 * NFT Minting Form Component
 * Allows users to mint NFTs from the platform's collection
 */

import { useState } from "react";
import { useWeb3, useNFTCollection } from "@/lib/contracts/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export function MintNFTForm() {
  const { account: address } = useWeb3();
  const { mintNFTToUser, isMinting } = useNFTCollection();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null as File | null,
    properties: {} as Record<string, string>,
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.image) {
      toast.error("Please upload an image");
      return;
    }

    try {
      const result = await mintNFTToUser(address, {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        properties: formData.properties,
      });

      toast.success("NFT minted successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        image: null,
        properties: {},
      });
      setImagePreview("");
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("Failed to mint NFT. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Mint Your NFT</CardTitle>
        <CardDescription>
          Create a unique NFT from our platform collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">NFT Image *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({ ...formData, image: null });
                      setImagePreview("");
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload image
                    </span>
                  </div>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">NFT Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter NFT name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your NFT"
              rows={4}
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isMinting || !address}
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              "Mint NFT"
            )}
          </Button>

          {!address && (
            <p className="text-sm text-muted-foreground text-center">
              Please connect your wallet to mint NFTs
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

