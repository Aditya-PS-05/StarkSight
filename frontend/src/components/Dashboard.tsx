"use client";

import {
  Shield,
  RefreshCw,
  Coins,
  TrendingUp,
  Bitcoin,
  Brain,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
} from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useRiskAnalysis } from "@/hooks/useRiskAnalysis";
import { formatUsd } from "@/lib/utils";
import { getRiskColor, getRiskBgColor } from "@/types";

interface DashboardProps {
  address: string;
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color =
    label === "safe"
      ? "text-success"
      : label === "caution"
        ? "text-warning"
        : label === "warning"
          ? "text-orange-500"
          : "text-danger";

  const bgColor =
    label === "safe"
      ? "stroke-success"
      : label === "caution"
        ? "stroke-warning"
        : label === "warning"
          ? "stroke-orange-500"
          : "stroke-danger";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-card-border"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={bgColor}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      <div className="absolute text-center">
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
        <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function RiskBar({ name, score, label, reason }: { name: string; score: number; label: string; reason: string }) {
  const color =
    label === "safe"
      ? "bg-success"
      : label === "caution"
        ? "bg-warning"
        : label === "warning"
          ? "bg-orange-500"
          : "bg-danger";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className={getRiskColor(label)}>{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-card-border overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${score}%`, transition: "width 1s ease-in-out" }}
        />
      </div>
      <p className="text-xs text-muted">{reason}</p>
    </div>
  );
}

export function Dashboard({ address }: DashboardProps) {
  const { portfolio, loading, refetch } = usePortfolio(address);
  const { analysis, analyzing, reanalyze } = useRiskAnalysis(portfolio);

  const handleRefresh = () => {
    refetch();
    setTimeout(reanalyze, 1000);
  };

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
          onClick={handleRefresh}
          disabled={loading || analyzing}
          className="flex items-center gap-2 rounded-lg border border-card-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading || analyzing ? "animate-spin" : ""}`} />
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
          <p className="text-xs text-muted mt-1">
            {portfolio ? `${portfolio.tokens.length} tokens` : "—"}
          </p>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted" />
            <h3 className="text-sm font-medium text-muted">StarkSight Score</h3>
          </div>
          {analyzing || loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-card-border" />
          ) : analysis ? (
            <>
              <p className={`text-2xl font-bold ${getRiskColor(analysis.overallLabel)}`}>
                {analysis.overallScore}/100
              </p>
              <p className={`text-xs mt-1 uppercase font-medium ${getRiskColor(analysis.overallLabel)}`}>
                {analysis.overallLabel}
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-muted">--</p>
          )}
        </div>

        <div className="rounded-xl border border-card-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-muted" />
            <h3 className="text-sm font-medium text-muted">Shield Actions</h3>
          </div>
          {analyzing || loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-card-border" />
          ) : analysis ? (
            <>
              <p className="text-2xl font-bold">
                {analysis.shieldActions.filter((a) => a.severity !== "info").length}
              </p>
              <p className="text-xs text-muted mt-1">actions recommended</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-muted">--</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Score + Risk Vectors */}
        <div className="space-y-6">
          {/* Score Gauge */}
          {analysis && (
            <div className="rounded-xl border border-card-border bg-card p-6 flex flex-col items-center">
              <ScoreGauge score={analysis.overallScore} label={analysis.overallLabel} />
              <p className="mt-4 text-sm text-muted text-center">
                Overall portfolio health score
              </p>
            </div>
          )}

          {/* Risk Vectors */}
          {analysis && (
            <div className="rounded-xl border border-card-border bg-card p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                Risk Vectors
              </h3>
              <div className="space-y-4">
                {analysis.vectors.map((v) => (
                  <RiskBar key={v.name} {...v} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Middle Column: AI Summary + Token Holdings */}
        <div className="space-y-6">
          {/* AI Summary */}
          {analysis && (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                AI Risk Assessment
              </h3>
              {analyzing ? (
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-card-border" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-card-border" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-card-border" />
                </div>
              ) : (
                <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {analysis.aiSummary}
                </div>
              )}
            </div>
          )}

          {/* Token Holdings */}
          <div className="rounded-xl border border-card-border bg-card">
            <div className="border-b border-card-border px-6 py-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Coins className="h-4 w-4 text-accent" />
                Token Holdings
              </h3>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-20 animate-pulse rounded bg-card-border" />
                    <div className="h-4 w-24 animate-pulse rounded bg-card-border" />
                  </div>
                ))}
              </div>
            ) : portfolio && portfolio.tokens.length > 0 ? (
              <div className="divide-y divide-card-border">
                {portfolio.tokens.map((token) => {
                  const tokenRisk = analysis?.tokenRisks.find(
                    (t) => t.symbol === token.symbol
                  );
                  return (
                    <div
                      key={token.symbol}
                      className="flex items-center justify-between px-6 py-3 hover:bg-accent/5 transition-colors"
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
                          <p className="text-sm font-medium">{token.symbol}</p>
                          <p className="text-xs text-muted">
                            {token.balanceFormatted.toLocaleString(undefined, {
                              maximumFractionDigits: 4,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatUsd(token.usdValue)}</p>
                        {tokenRisk && (
                          <span className={`text-xs ${getRiskColor(tokenRisk.riskLabel)}`}>
                            {tokenRisk.riskScore}/100
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-muted text-sm">
                No tokens found on Starknet Sepolia
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Shield Actions + Token Risks */}
        <div className="space-y-6">
          {/* Shield Actions */}
          {analysis && (
            <div className="rounded-xl border border-card-border bg-card p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                Shield Actions
              </h3>
              <div className="space-y-3">
                {analysis.shieldActions.map((action) => (
                  <div
                    key={action.id}
                    className={`rounded-lg border p-3 ${getRiskBgColor(
                      action.severity === "critical"
                        ? "danger"
                        : action.severity === "warning"
                          ? "warning"
                          : "safe"
                    )}`}
                  >
                    <div className="flex items-start gap-2">
                      {action.severity === "critical" ? (
                        <AlertTriangle className="h-4 w-4 text-danger mt-0.5 shrink-0" />
                      ) : action.severity === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      ) : (
                        <Info className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs text-muted mt-1">{action.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-Token Risk Details */}
          {analysis && analysis.tokenRisks.length > 0 && (
            <div className="rounded-xl border border-card-border bg-card p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-accent" />
                Token Risk Details
              </h3>
              <div className="space-y-3">
                {analysis.tokenRisks.map((tr) => (
                  <div key={tr.symbol} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tr.symbol}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getRiskBgColor(
                            tr.riskLabel
                          )} ${getRiskColor(tr.riskLabel)}`}
                        >
                          {tr.riskLabel}
                        </span>
                      </div>
                      {tr.reasons.map((r, i) => (
                        <p key={i} className="text-xs text-muted mt-0.5 flex items-start gap-1">
                          <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                          {r}
                        </p>
                      ))}
                    </div>
                    <span className={`text-sm font-mono font-bold ${getRiskColor(tr.riskLabel)}`}>
                      {tr.riskScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-center text-xs text-accent-light">
        Privacy Mode Active — All risk analysis runs client-side. Only anonymized metrics are sent to AI. No wallet data touches any server.
      </div>
    </div>
  );
}
