"use client";

import { Shield, Brain, Eye, Bitcoin, Lock, Zap } from "lucide-react";
import { useConnect } from "@starknet-react/core";
import { useState } from "react";

const features = [
  {
    icon: Brain,
    title: "AI Risk Analysis",
    description: "Gemini-powered risk engine analyzes your entire portfolio across 5 risk vectors",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "All analysis runs client-side. Your holdings never leave your browser",
  },
  {
    icon: Eye,
    title: "ZK Attestations",
    description: "Mint on-chain proof of safety without revealing what you hold",
  },
  {
    icon: Bitcoin,
    title: "Bitcoin Support",
    description: "WBTC/sBTC position monitoring with BTC-specific risk analysis",
  },
  {
    icon: Shield,
    title: "Shield Actions",
    description: "AI-recommended protective moves to secure your positions",
  },
  {
    icon: Zap,
    title: "Real-Time",
    description: "Live portfolio scanning with instant risk score updates",
  },
];

export function Landing() {
  const { connect, connectors } = useConnect();
  const [showConnectors, setShowConnectors] = useState(false);

  return (
    <div className="flex flex-col items-center px-4 pt-20 pb-32">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm text-accent-light">
          <Shield className="h-4 w-4" />
          Privacy-Preserving AI Portfolio Guardian
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Know Your Risk.
          <br />
          <span className="text-accent">Keep Your Privacy.</span>
        </h1>
        <p className="mb-10 text-lg text-muted max-w-xl mx-auto">
          AI-powered DeFi portfolio analysis on Starknet. Get risk scores, shield recommendations,
          and on-chain safety attestations — all without exposing your holdings.
        </p>

        <div className="relative inline-block">
          <button
            onClick={() => setShowConnectors(!showConnectors)}
            className="rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-accent-light hover:scale-105 active:scale-95"
          >
            Connect Wallet to Start
          </button>
          {showConnectors && (
            <div className="absolute left-1/2 -translate-x-1/2 top-16 w-56 rounded-lg border border-card-border bg-card p-2 shadow-xl">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    connect({ connector });
                    setShowConnectors(false);
                  }}
                  className="w-full rounded-md px-4 py-3 text-left text-sm transition-colors hover:bg-accent/10"
                >
                  {connector.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-xl border border-card-border bg-card p-6 transition-all hover:border-accent/30 hover:bg-accent/5"
          >
            <feature.icon className="mb-4 h-8 w-8 text-accent transition-transform group-hover:scale-110" />
            <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Trust Banner */}
      <div className="mt-20 text-center text-sm text-muted">
        <p>Built on Starknet Sepolia | Zero data leaves your browser | ZK-attested on-chain</p>
      </div>
    </div>
  );
}
