"use client";

import { Shield, Brain, Eye, Bitcoin, Lock, Zap, ArrowRight } from "lucide-react";
import { useConnect } from "@starknet-react/core";
import { useState } from "react";

const features = [
  {
    icon: Brain,
    title: "AI Risk Analysis",
    description: "Gemini-powered risk engine analyzes your entire portfolio across 6 risk vectors in real-time",
    track: null,
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "All analysis runs client-side. Your holdings never leave your browser. Zero backend.",
    track: "privacy",
  },
  {
    icon: Eye,
    title: "ZK Attestations",
    description: "Mint Pedersen commitment proofs on-chain. Prove safety without revealing holdings.",
    track: "privacy",
  },
  {
    icon: Bitcoin,
    title: "Bitcoin Guardian",
    description: "WBTC bridge risk analysis, depeg monitoring, BTC-denominated portfolio tracking",
    track: "bitcoin",
  },
  {
    icon: Shield,
    title: "Shield Actions",
    description: "AI-recommended protective moves: rebalance, diversify, monitor bridge health",
    track: null,
  },
  {
    icon: Zap,
    title: "Starknet Native",
    description: "Built on Starknet with STARK-friendly Pedersen hashing. Quantum-safe by design.",
    track: "privacy",
  },
];

const trackColors: Record<string, string> = {
  privacy: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  bitcoin: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export function Landing() {
  const { connect, connectors } = useConnect();
  const [showConnectors, setShowConnectors] = useState(false);

  return (
    <div className="flex flex-col items-center px-4 pt-16 pb-32">
      {/* Track Badges */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
          Privacy Track
        </span>
        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
          Bitcoin Track
        </span>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-light">
          Wildcard Track
        </span>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm text-accent-light">
          <Shield className="h-4 w-4" />
          AI-Powered Private Portfolio Guardian on Starknet
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Know Your Risk.
          <br />
          <span className="text-accent">Keep Your Privacy.</span>
        </h1>
        <p className="mb-10 text-lg text-muted max-w-xl mx-auto">
          AI-powered DeFi portfolio analysis on Starknet. Get risk scores across 6 vectors,
          BTC bridge risk monitoring, shield recommendations, and ZK safety attestations —
          all without exposing your holdings.
        </p>

        <div className="relative inline-block">
          <button
            onClick={() => setShowConnectors(!showConnectors)}
            className="flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-accent-light hover:scale-105 active:scale-95"
          >
            Connect Wallet to Start
            <ArrowRight className="h-5 w-5" />
          </button>
          {showConnectors && (
            <div className="absolute left-1/2 -translate-x-1/2 top-16 w-56 rounded-lg border border-card-border bg-card p-2 shadow-xl z-10">
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

      {/* How it Works */}
      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center text-sm font-semibold text-muted uppercase tracking-widest mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Connect", desc: "Link your Starknet wallet (ArgentX or Braavos)" },
            { step: "2", title: "Analyze", desc: "AI scans tokens, DeFi positions, and BTC exposure client-side" },
            { step: "3", title: "Attest", desc: "Mint a ZK proof of your safety score on-chain" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white font-bold">
                {s.step}
              </div>
              <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
              <p className="text-xs text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-xl border border-card-border bg-card p-6 transition-all hover:border-accent/30 hover:bg-accent/5"
          >
            <div className="flex items-start justify-between mb-4">
              <feature.icon className="h-8 w-8 text-accent transition-transform group-hover:scale-110" />
              {feature.track && (
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${trackColors[feature.track]}`}>
                  {feature.track}
                </span>
              )}
            </div>
            <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Privacy Architecture */}
      <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-card-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4 text-center">Privacy Architecture</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
          <div className="rounded-lg bg-success/5 border border-success/20 p-3">
            <p className="font-semibold text-success mb-1">Client-Side Only</p>
            <p className="text-muted">Wallet data, balances, AI analysis</p>
          </div>
          <div className="rounded-lg bg-warning/5 border border-warning/20 p-3">
            <p className="font-semibold text-warning mb-1">Anonymized to AI</p>
            <p className="text-muted">Only % allocations, no addresses</p>
          </div>
          <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
            <p className="font-semibold text-accent-light mb-1">On-Chain</p>
            <p className="text-muted">Pedersen commitment + score range only</p>
          </div>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="mt-16 text-center text-sm text-muted">
        <p>Built on Starknet Sepolia | Zero data leaves your browser | ZK-attested on-chain | STARK-friendly Pedersen hashing</p>
      </div>
    </div>
  );
}
