"use client";

import { Shield, RefreshCw, Coins, TrendingUp, Bitcoin } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatUsd } from "@/lib/utils";

interface DashboardProps {
  address: string;
}

export function Dashboard({ address }: DashboardProps) {
  const { portfolio, loading, refetch } = usePortfolio(address);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-accent" />
          <div>
            <h1 className="text-2xl font-bold">Portfolio Guardian</h1>
            <p className="text-sm text-muted">
              Analyzing {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-card-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-xl border border-card-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-muted" />
            <h3 className="text-sm font-medium text-muted">Portfolio Value</h3>
          </div>
          {loading ? (
            <div className="h-8 w-32 animate-pulse rounded bg-card-border" />
          ) : (
            <p className="text-2xl font-bold">
              {portfolio ? formatUsd(portfolio.totalValueUsd) : "$0.00"}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-card-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted" />
            <h3 className="text-sm font-medium text-muted">StarkSight Score</h3>
          </div>
          {/* Will be filled by Phase 3 AI engine */}
          <p className="text-2xl font-bold text-muted">--</p>
          <p className="text-xs text-muted mt-1">Connect AI to analyze</p>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-muted" />
            <h3 className="text-sm font-medium text-muted">Shield Actions</h3>
          </div>
          {/* Will be filled by Phase 3 AI engine */}
          <p className="text-2xl font-bold text-muted">--</p>
          <p className="text-xs text-muted mt-1">Pending analysis</p>
        </div>
      </div>

      {/* Token Holdings */}
      <div className="rounded-xl border border-card-border bg-card">
        <div className="border-b border-card-border px-6 py-4">
          <h2 className="text-lg font-semibold">Token Holdings</h2>
          <p className="text-xs text-muted mt-1">All data stays in your browser — nothing sent to any server</p>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-card-border" />
                  <div className="h-4 w-20 animate-pulse rounded bg-card-border" />
                </div>
                <div className="h-4 w-24 animate-pulse rounded bg-card-border" />
              </div>
            ))}
          </div>
        ) : portfolio && portfolio.tokens.length > 0 ? (
          <div className="divide-y divide-card-border">
            {portfolio.tokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between px-6 py-4 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold">
                    {token.symbol === "WBTC" ? (
                      <Bitcoin className="h-4 w-4" />
                    ) : (
                      token.symbol.slice(0, 2)
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{token.symbol}</p>
                    <p className="text-xs text-muted">
                      {token.balanceFormatted.toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatUsd(token.usdValue)}</p>
                  {token.symbol === "WBTC" && (
                    <span className="text-xs text-warning">BTC Exposure</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted">
            <Coins className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No tokens found in this wallet on Starknet Sepolia</p>
            <p className="text-xs mt-1">Make sure you have tokens on the Sepolia testnet</p>
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-center text-xs text-accent-light">
        Privacy Mode Active — Portfolio data is fetched via RPC and processed entirely in your browser. No wallet data is sent to any backend.
      </div>
    </div>
  );
}
