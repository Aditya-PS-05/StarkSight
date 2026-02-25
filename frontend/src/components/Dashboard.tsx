"use client";

import { Shield } from "lucide-react";

interface DashboardProps {
  address: string;
}

export function Dashboard({ address }: DashboardProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-8 w-8 text-accent" />
        <div>
          <h1 className="text-2xl font-bold">Portfolio Guardian</h1>
          <p className="text-sm text-muted">
            Analyzing {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
      </div>

      {/* Placeholder — will be built in Phase 2-6 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-card-border bg-card p-6">
          <h3 className="mb-2 text-sm font-medium text-muted">Portfolio Value</h3>
          <div className="h-8 w-32 animate-pulse rounded bg-card-border" />
        </div>
        <div className="rounded-xl border border-card-border bg-card p-6">
          <h3 className="mb-2 text-sm font-medium text-muted">StarkSight Score</h3>
          <div className="h-8 w-20 animate-pulse rounded bg-card-border" />
        </div>
        <div className="rounded-xl border border-card-border bg-card p-6">
          <h3 className="mb-2 text-sm font-medium text-muted">Shield Actions</h3>
          <div className="h-8 w-16 animate-pulse rounded bg-card-border" />
        </div>
      </div>
    </div>
  );
}
