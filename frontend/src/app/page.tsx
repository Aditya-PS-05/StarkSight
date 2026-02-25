"use client";

import { useAccount } from "@starknet-react/core";
import { Navbar } from "@/components/Navbar";
import { Landing } from "@/components/Landing";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{isConnected && address ? <Dashboard address={address} /> : <Landing />}</main>
    </div>
  );
}
