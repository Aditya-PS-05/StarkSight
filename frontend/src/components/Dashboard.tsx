"use client";

import { useState } from "react";
import {
  Shield,
  RefreshCw,
  Coins,
  TrendingUp,
  Bitcoin,
  Brain,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronDown,
  Lock,
  Cpu,
  Eye,
} from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useRiskAnalysis } from "@/hooks/useRiskAnalysis";
import { formatUsd } from "@/lib/utils";
import { getRiskColor, getRiskBgColor } from "@/types";
import { AttestationPanel } from "@/components/AttestationPanel";
import { usdToBtc, formatBtc } from "@/lib/prices";

interface DashboardProps {
  address: string;
}

const METHODOLOGY = [
  { name: "Token Diversity", weight: 15, desc: "Number of distinct tokens held" },
  { name: "Concentration", weight: 20, desc: "Largest single-token allocation %" },
  { name: "Stability Buffer", weight: 15, desc: "Stablecoin allocation ratio" },
  { name: "BTC Exposure", weight: 15, desc: "Bitcoin store-of-value presence" },
  { name: "BTC Bridge Risk", weight: 15, desc: "WBTC bridge dependency level" },
  { name: "Portfolio Size", weight: 20, desc: "Total portfolio value tier" },
];

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

function RiskBar({ name, score, label, reason, weight }: { name: string; score: number; label: string; reason: string; weight?: number }) {
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
        <span className="font-medium">
          {name}
          {weight !== undefined && (
            <span className="text-xs text-muted ml-1">({weight}%)</span>
          )}
        </span>
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
  const { portfolio, loading, refetch, prices } = usePortfolio(address);
  const { analysis, analyzing, reanalyze, aiSource } = useRiskAnalysis(portfolio);
  const [showMethodology, setShowMethodology] = useState(false);

  const btcPrice = prices.BTC || prices.WBTC || 95000;
  const portfolioBtcValue = portfolio ? usdToBtc(portfolio.totalValueUsd, btcPrice) : 0;

  const handleRefresh = () => {
    refetch();
    setTimeout(reanalyze, 1000);
  };

  const vectorWeights = [15, 20, 15, 15, 15, 20];

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
            <>
              <p className="text-2xl font-bold">
                {portfolio ? formatUsd(portfolio.totalValueUsd) : "$0.00"}
              </p>
              {portfolio && portfolio.totalValueUsd > 0 && (
                <p className="text-xs text-warning mt-1 flex items-center gap-1">
                  <Bitcoin className="h-3 w-3" />
                  {formatBtc(portfolioBtcValue)} BTC
                </p>
              )}
            </>
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
                Weighted composite of 6 risk vectors
              </p>
              <button
                onClick={() => setShowMethodology(!showMethodology)}
                className="mt-2 flex items-center gap-1 text-xs text-accent hover:text-accent-light transition-colors"
              >
                <Eye className="h-3 w-3" />
                {showMethodology ? "Hide" : "View"} Methodology
                <ChevronDown className={`h-3 w-3 transition-transform ${showMethodology ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}

          {/* Methodology Panel */}
          {showMethodology && (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
              <h4 className="text-xs font-semibold text-accent mb-3 flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                Open Scoring Methodology
              </h4>
              <p className="text-xs text-muted mb-3">
                Score = weighted sum of 6 deterministic risk vectors. Same inputs always produce the same score. No hidden factors.
              </p>
              <div className="space-y-2">
                {METHODOLOGY.map((m) => (
                  <div key={m.name} className="flex items-center justify-between text-xs">
                    <span className="text-foreground/80">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted">{m.desc}</span>
                      <span className="font-mono text-accent font-bold">{m.weight}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-card-border">
                <p className="text-xs text-muted">
                  All scoring runs client-side in your browser. Scores are deterministic and verifiable — identical portfolios always produce identical scores.
                </p>
              </div>
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
                {analysis.vectors.map((v, i) => (
                  <RiskBar key={v.name} {...v} weight={vectorWeights[i]} />
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Brain className="h-4 w-4 text-accent" />
                  AI Risk Assessment
                </h3>
                {!analyzing && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    aiSource === "gemini"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-accent/10 text-accent border border-accent/20"
                  }`}>
                    {aiSource === "gemini" ? (
                      <>
                        <Cpu className="h-2.5 w-2.5" />
                        Gemini AI
                      </>
                    ) : (
                      <>
                        <Lock className="h-2.5 w-2.5" />
                        Local Analysis
                      </>
                    )}
                  </span>
                )}
              </div>
              {analyzing ? (
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-card-border" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-card-border" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-card-border" />
                </div>
              ) : (
                <>
                  <div
                    className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: analysis.aiSummary
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br />"),
                    }}
                  />
                  <p className="mt-3 text-[10px] text-muted border-t border-card-border pt-2">
                    {aiSource === "gemini"
                      ? "AI receives only anonymized metrics (% allocations, risk scores) — never wallet addresses or exact balances."
                      : "Analysis generated locally in your browser using deterministic heuristics. No data sent externally."}
                  </p>
                </>
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

          {/* ZK Attestation */}
          <AttestationPanel
            walletAddress={address}
            score={analysis?.overallScore ?? null}
            scoreLabel={analysis?.overallLabel ?? null}
          />

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

      {/* Trust & Privacy Footer */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-center">
          <Lock className="h-4 w-4 text-accent mx-auto mb-1" />
          <p className="text-xs font-medium text-accent">Client-Side Analysis</p>
          <p className="text-[10px] text-muted">All scoring runs in your browser</p>
        </div>
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-center">
          <Eye className="h-4 w-4 text-accent mx-auto mb-1" />
          <p className="text-xs font-medium text-accent">Open Methodology</p>
          <p className="text-[10px] text-muted">Deterministic, verifiable scoring</p>
        </div>
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-center">
          <Shield className="h-4 w-4 text-accent mx-auto mb-1" />
          <p className="text-xs font-medium text-accent">ZK Attestations</p>
          <p className="text-[10px] text-muted">Scores proven on-chain via Pedersen</p>
        </div>
      </div>
    </div>
  );
}
