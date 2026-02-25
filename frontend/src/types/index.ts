export interface TokenBalance {
  symbol: string;
  address: string;
  balance: bigint;
  balanceFormatted: number;
  usdValue: number;
  decimals: number;
}

export interface DeFiPosition {
  protocol: string;
  type: "lending" | "borrowing" | "lp" | "staking";
  token: string;
  amount: number;
  usdValue: number;
  apy?: number;
  healthFactor?: number;
  details?: Record<string, unknown>;
}

export interface RiskVector {
  name: string;
  score: number; // 0-100, higher = safer
  label: "safe" | "caution" | "warning" | "danger";
  reason: string;
}

export interface RiskAnalysis {
  overallScore: number; // 0-100
  overallLabel: "safe" | "caution" | "warning" | "danger";
  vectors: RiskVector[];
  tokenRisks: TokenRisk[];
  positionRisks: PositionRisk[];
  aiSummary: string;
  shieldActions: ShieldAction[];
  timestamp: number;
}

export interface TokenRisk {
  symbol: string;
  riskScore: number;
  riskLabel: "safe" | "caution" | "warning" | "danger";
  reasons: string[];
}

export interface PositionRisk {
  protocol: string;
  type: string;
  riskScore: number;
  riskLabel: "safe" | "caution" | "warning" | "danger";
  reasons: string[];
}

export interface ShieldAction {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  actionType: "rebalance" | "exit" | "add-collateral" | "diversify" | "monitor";
}

export interface Attestation {
  commitment: string;
  scoreRange: string;
  timestamp: number;
  blockNumber: number;
  txHash?: string;
}

export interface PortfolioData {
  address: string;
  totalValueUsd: number;
  tokens: TokenBalance[];
  positions: DeFiPosition[];
  fetchedAt: number;
}

export function getRiskLabel(score: number): "safe" | "caution" | "warning" | "danger" {
  if (score >= 80) return "safe";
  if (score >= 60) return "caution";
  if (score >= 40) return "warning";
  return "danger";
}

export function getRiskColor(label: string): string {
  switch (label) {
    case "safe": return "text-success";
    case "caution": return "text-warning";
    case "warning": return "text-orange-500";
    case "danger": return "text-danger";
    default: return "text-muted";
  }
}

export function getRiskBgColor(label: string): string {
  switch (label) {
    case "safe": return "bg-success/10 border-success/20";
    case "caution": return "bg-warning/10 border-warning/20";
    case "warning": return "bg-orange-500/10 border-orange-500/20";
    case "danger": return "bg-danger/10 border-danger/20";
    default: return "bg-card border-card-border";
  }
}
