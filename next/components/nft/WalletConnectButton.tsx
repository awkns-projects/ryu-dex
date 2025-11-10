"use client";

/**
 * Wallet Connect Button Component
 * Allows users to connect their wallet
 */

import { useWeb3 } from "@/lib/contracts/hooks";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";

export function WalletConnectButton() {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWeb3();

  if (isConnected && account) {
    return (
      <Button variant="outline" onClick={disconnectWallet}>
        <Wallet className="mr-2 h-4 w-4" />
        {account.slice(0, 6)}...{account.slice(-4)}
      </Button>
    );
  }

  return (
    <Button onClick={connectWallet} disabled={isConnecting}>
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}

