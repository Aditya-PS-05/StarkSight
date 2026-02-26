"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { Shield, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Landing } from "@/components/Landing";
import { Dashboard } from "@/components/Dashboard";
import { PrivateTransfer } from "@/components/PrivateTransfer";

type Tab = "guardian" | "transfer";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("guardian");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {isConnected && address ? (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-card-border">
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab("guardian")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "guardian"
                        ? "border-accent text-accent"
                        : "border-transparent text-muted hover:text-foreground"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Portfolio Guardian
                  </button>
                  <button
                    onClick={() => setActiveTab("transfer")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "transfer"
                        ? "border-accent text-accent"
                        : "border-transparent text-muted hover:text-foreground"
                    }`}
                  >
                    <Lock className="h-4 w-4" />
                    Private Transfer
                    <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                      Tongo
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "guardian" ? (
              <Dashboard address={address} />
            ) : (
              <PrivateTransfer address={address} />
            )}
          </>
        ) : (
          <Landing />
        )}
      </main>
    </div>
  );
}
