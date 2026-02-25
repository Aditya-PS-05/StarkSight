import type {
  PortfolioData,
  RiskAnalysis,
  RiskVector,
  TokenRisk,
  PositionRisk,
  ShieldAction,
} from "@/types";
import { getRiskLabel } from "@/types";

// --- Risk Vector Weights (inspired by ShieldBot + Aegis) ---
const WEIGHTS = {
  tokenDiversity: 0.2,
  concentration: 0.25,
  stablecoinRatio: 0.15,
  btcExposure: 0.15,
  portfolioSize: 0.25,
};

// --- Individual Vector Scorers ---

function scoreTokenDiversity(portfolio: PortfolioData): RiskVector {
  const count = portfolio.tokens.length;
  let score: number;
  let reason: string;

  if (count >= 5) {
    score = 90;
    reason = `Well-diversified with ${count} tokens`;
  } else if (count >= 3) {
    score = 70;
    reason = `Moderate diversification with ${count} tokens`;
  } else if (count >= 2) {
    score = 50;
    reason = `Low diversification — only ${count} tokens`;
  } else {
    score = 25;
    reason = count === 1 ? "Single token — no diversification" : "No tokens found";
  }

  return { name: "Token Diversity", score, label: getRiskLabel(score), reason };
}

function scoreConcentration(portfolio: PortfolioData): RiskVector {
  if (portfolio.tokens.length === 0 || portfolio.totalValueUsd === 0) {
    return { name: "Concentration", score: 50, label: "caution", reason: "No holdings to analyze" };
  }

  const sorted = [...portfolio.tokens].sort((a, b) => b.usdValue - a.usdValue);
  const topPct = (sorted[0].usdValue / portfolio.totalValueUsd) * 100;

  let score: number;
  let reason: string;

  if (topPct > 90) {
    score = 15;
    reason = `${sorted[0].symbol} is ${topPct.toFixed(0)}% of portfolio — extreme concentration risk`;
  } else if (topPct > 70) {
    score = 35;
    reason = `${sorted[0].symbol} is ${topPct.toFixed(0)}% of portfolio — high concentration`;
  } else if (topPct > 50) {
    score = 55;
    reason = `${sorted[0].symbol} is ${topPct.toFixed(0)}% of portfolio — moderate concentration`;
  } else {
    score = 85;
    reason = `Largest position is ${topPct.toFixed(0)}% — well-balanced`;
  }

  return { name: "Concentration", score, label: getRiskLabel(score), reason };
}

function scoreStablecoinRatio(portfolio: PortfolioData): RiskVector {
  const stables = ["USDC", "USDT", "DAI"];
  const stableValue = portfolio.tokens
    .filter((t) => stables.includes(t.symbol))
    .reduce((sum, t) => sum + t.usdValue, 0);
  const ratio = portfolio.totalValueUsd > 0 ? stableValue / portfolio.totalValueUsd : 0;
  const pct = ratio * 100;

  let score: number;
  let reason: string;

  if (pct >= 20 && pct <= 60) {
    score = 90;
    reason = `${pct.toFixed(0)}% in stablecoins — healthy safety buffer`;
  } else if (pct > 60) {
    score = 70;
    reason = `${pct.toFixed(0)}% in stablecoins — very conservative, low growth exposure`;
  } else if (pct >= 5) {
    score = 55;
    reason = `Only ${pct.toFixed(0)}% in stablecoins — limited downside protection`;
  } else {
    score = 30;
    reason = "No stablecoin buffer — fully exposed to market volatility";
  }

  return { name: "Stability Buffer", score, label: getRiskLabel(score), reason };
}

function scoreBtcExposure(portfolio: PortfolioData): RiskVector {
  const btcTokens = ["WBTC"];
  const btcValue = portfolio.tokens
    .filter((t) => btcTokens.includes(t.symbol))
    .reduce((sum, t) => sum + t.usdValue, 0);
  const hasBtc = btcValue > 0;
  const btcPct = portfolio.totalValueUsd > 0 ? (btcValue / portfolio.totalValueUsd) * 100 : 0;

  let score: number;
  let reason: string;

  if (hasBtc && btcPct <= 40) {
    score = 85;
    reason = `${btcPct.toFixed(0)}% BTC exposure via WBTC — solid store-of-value anchor`;
  } else if (hasBtc && btcPct <= 70) {
    score = 65;
    reason = `${btcPct.toFixed(0)}% BTC exposure — high but BTC is lower-risk crypto`;
  } else if (hasBtc) {
    score = 45;
    reason = `${btcPct.toFixed(0)}% BTC — heavy concentration in single asset`;
  } else {
    score = 60;
    reason = "No BTC exposure — missing store-of-value diversification";
  }

  return { name: "BTC Exposure", score, label: getRiskLabel(score), reason };
}

function scorePortfolioSize(portfolio: PortfolioData): RiskVector {
  const val = portfolio.totalValueUsd;

  let score: number;
  let reason: string;

  if (val >= 10000) {
    score = 85;
    reason = "Substantial portfolio — established position";
  } else if (val >= 1000) {
    score = 70;
    reason = "Moderate portfolio size";
  } else if (val >= 100) {
    score = 55;
    reason = "Small portfolio — limited buffer for gas and losses";
  } else if (val > 0) {
    score = 35;
    reason = "Micro portfolio — high relative impact from fees and slippage";
  } else {
    score = 20;
    reason = "Empty portfolio";
  }

  return { name: "Portfolio Size", score, label: getRiskLabel(score), reason };
}

// --- Token-Level Risk ---

function analyzeTokenRisks(portfolio: PortfolioData): TokenRisk[] {
  return portfolio.tokens.map((token) => {
    const reasons: string[] = [];
    let score = 80; // Start optimistic

    // Stablecoins are safe
    if (["USDC", "USDT", "DAI"].includes(token.symbol)) {
      return {
        symbol: token.symbol,
        riskScore: 90,
        riskLabel: "safe" as const,
        reasons: ["Stablecoin — pegged to USD"],
      };
    }

    // ETH/STRK are well-established
    if (token.symbol === "ETH") {
      return {
        symbol: token.symbol,
        riskScore: 85,
        riskLabel: "safe" as const,
        reasons: ["Blue-chip asset — high liquidity and market cap"],
      };
    }

    if (token.symbol === "STRK") {
      score = 70;
      reasons.push("Native Starknet token — moderate volatility expected");
    }

    if (token.symbol === "WBTC") {
      score = 75;
      reasons.push("Wrapped Bitcoin — bridge/depeg risk exists but BTC fundamentals strong");
      if (token.usdValue > 50000) {
        score -= 5;
        reasons.push("Large WBTC position — consider bridge risk concentration");
      }
    }

    // Concentration penalty
    if (portfolio.totalValueUsd > 0) {
      const pct = (token.usdValue / portfolio.totalValueUsd) * 100;
      if (pct > 80) {
        score -= 20;
        reasons.push(`${pct.toFixed(0)}% of total portfolio — extreme concentration`);
      } else if (pct > 50) {
        score -= 10;
        reasons.push(`${pct.toFixed(0)}% of total portfolio — high concentration`);
      }
    }

    score = Math.max(0, Math.min(100, score));
    return {
      symbol: token.symbol,
      riskScore: score,
      riskLabel: getRiskLabel(score),
      reasons: reasons.length > 0 ? reasons : ["Standard risk profile"],
    };
  });
}

// --- Shield Actions ---

function generateShieldActions(
  portfolio: PortfolioData,
  vectors: RiskVector[],
  tokenRisks: TokenRisk[]
): ShieldAction[] {
  const actions: ShieldAction[] = [];
  let id = 0;

  // Concentration check
  const concVector = vectors.find((v) => v.name === "Concentration");
  if (concVector && concVector.score < 40) {
    const top = [...portfolio.tokens].sort((a, b) => b.usdValue - a.usdValue)[0];
    actions.push({
      id: `shield-${id++}`,
      severity: "warning",
      title: `Reduce ${top?.symbol || "top"} concentration`,
      description: `Your largest position makes up most of your portfolio. Consider diversifying to reduce single-asset risk.`,
      actionType: "diversify",
    });
  }

  // Stablecoin buffer
  const stabVector = vectors.find((v) => v.name === "Stability Buffer");
  if (stabVector && stabVector.score < 40) {
    actions.push({
      id: `shield-${id++}`,
      severity: "warning",
      title: "Add stablecoin buffer",
      description: "Consider allocating 15-25% to stablecoins (USDC/USDT) for downside protection during market volatility.",
      actionType: "rebalance",
    });
  }

  // BTC diversification
  const btcVector = vectors.find((v) => v.name === "BTC Exposure");
  if (btcVector && btcVector.score < 50 && !portfolio.tokens.some((t) => t.symbol === "WBTC")) {
    actions.push({
      id: `shield-${id++}`,
      severity: "info",
      title: "Consider BTC exposure",
      description: "Adding WBTC to your portfolio could provide store-of-value diversification and reduce correlation risk.",
      actionType: "diversify",
    });
  }

  // WBTC bridge risk
  const wbtcRisk = tokenRisks.find((t) => t.symbol === "WBTC");
  if (wbtcRisk && wbtcRisk.riskScore < 60) {
    actions.push({
      id: `shield-${id++}`,
      severity: "warning",
      title: "Monitor WBTC bridge health",
      description: "Your WBTC position carries bridge risk. Monitor the wrapped BTC peg and bridge reserves regularly.",
      actionType: "monitor",
    });
  }

  // Small portfolio warning
  const sizeVector = vectors.find((v) => v.name === "Portfolio Size");
  if (sizeVector && sizeVector.score < 40) {
    actions.push({
      id: `shield-${id++}`,
      severity: "info",
      title: "Consider transaction costs",
      description: "With a smaller portfolio, gas fees can significantly impact returns. Batch transactions when possible.",
      actionType: "monitor",
    });
  }

  // If everything looks good
  if (actions.length === 0) {
    actions.push({
      id: `shield-${id++}`,
      severity: "info",
      title: "Portfolio looks healthy",
      description: "No immediate risks detected. Continue monitoring and consider periodic rebalancing.",
      actionType: "monitor",
    });
  }

  return actions;
}

// --- Main Analysis Function ---

export function analyzePortfolio(portfolio: PortfolioData): Omit<RiskAnalysis, "aiSummary"> {
  const vectors: RiskVector[] = [
    scoreTokenDiversity(portfolio),
    scoreConcentration(portfolio),
    scoreStablecoinRatio(portfolio),
    scoreBtcExposure(portfolio),
    scorePortfolioSize(portfolio),
  ];

  // Weighted composite score
  const weightKeys = Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[];
  const overallScore = Math.round(
    vectors.reduce((sum, v, i) => sum + v.score * WEIGHTS[weightKeys[i]], 0)
  );

  const tokenRisks = analyzeTokenRisks(portfolio);
  const positionRisks: PositionRisk[] = portfolio.positions.map((p) => ({
    protocol: p.protocol,
    type: p.type,
    riskScore: 70,
    riskLabel: "caution" as const,
    reasons: ["DeFi position — inherent smart contract risk"],
  }));

  const shieldActions = generateShieldActions(portfolio, vectors, tokenRisks);

  return {
    overallScore,
    overallLabel: getRiskLabel(overallScore),
    vectors,
    tokenRisks,
    positionRisks,
    shieldActions,
    timestamp: Date.now(),
  };
}
