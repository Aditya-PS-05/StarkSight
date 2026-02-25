"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { Shield, Wallet, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <nav className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-accent" />
          <span className="text-lg font-bold tracking-tight">
            Stark<span className="text-accent">Sight</span>
          </span>
          <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent-light">
            AI Guardian
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-card border border-card-border px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-mono">{truncatedAddress}</span>
              </div>
              <button
                onClick={() => disconnect()}
                className="rounded-lg border border-card-border p-2 text-muted transition-colors hover:border-danger hover:text-danger"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowConnectors(!showConnectors)}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-light"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
                <ChevronDown className="h-3 w-3" />
              </button>
              {showConnectors && (
                <div className="absolute right-0 top-12 w-48 rounded-lg border border-card-border bg-card p-2 shadow-xl">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => {
                        connect({ connector });
                        setShowConnectors(false);
                      }}
                      className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent/10"
                    >
                      {connector.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
