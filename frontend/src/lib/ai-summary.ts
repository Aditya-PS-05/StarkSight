import type { RiskAnalysis, PortfolioData } from "@/types";

const SYSTEM_PROMPT = `You are StarkSight, an AI DeFi portfolio guardian. You analyze Starknet portfolios and provide concise, actionable risk assessments.

RULES:
- Be direct and specific. No fluff.
- Use 2-4 short paragraphs max.
- Mention specific tokens and their risk factors.
- End with 1-2 actionable recommendations.
- Never reveal exact wallet addresses or balances in your response (privacy first).
- Use risk terminology: safe, caution, warning, danger.
- Reference the StarkSight Score and what it means.

You receive ONLY aggregated portfolio metrics — never raw addresses or full balances. This preserves user privacy.`;

function buildAnalysisPrompt(
  portfolio: PortfolioData,
  analysis: Omit<RiskAnalysis, "aiSummary">
): string {
  const tokenSummary = portfolio.tokens
    .map((t) => {
      const pct = portfolio.totalValueUsd > 0
        ? ((t.usdValue / portfolio.totalValueUsd) * 100).toFixed(1)
        : "0";
      return `${t.symbol}: ${pct}% of portfolio`;
    })
    .join(", ");

  const vectorSummary = analysis.vectors
    .map((v) => `${v.name}: ${v.score}/100 (${v.label}) — ${v.reason}`)
    .join("\n");

  const tokenRiskSummary = analysis.tokenRisks
    .map((t) => `${t.symbol}: ${t.riskScore}/100 (${t.riskLabel}) — ${t.reasons.join("; ")}`)
    .join("\n");

  const actionSummary = analysis.shieldActions
    .map((a) => `[${a.severity}] ${a.title}: ${a.description}`)
    .join("\n");

  return `Analyze this Starknet portfolio:

PORTFOLIO METRICS (privacy-safe aggregates only):
- Total tokens: ${portfolio.tokens.length}
- Token allocation: ${tokenSummary}
- Has BTC exposure: ${portfolio.tokens.some((t) => t.symbol === "WBTC") ? "Yes (WBTC)" : "No"}
- Has stablecoins: ${portfolio.tokens.some((t) => ["USDC", "USDT", "DAI"].includes(t.symbol)) ? "Yes" : "No"}

RISK VECTORS:
${vectorSummary}

OVERALL STARKSIGHT SCORE: ${analysis.overallScore}/100 (${analysis.overallLabel})

TOKEN RISKS:
${tokenRiskSummary}

RECOMMENDED SHIELD ACTIONS:
${actionSummary}

Provide a concise risk assessment summary (2-4 short paragraphs). Be specific about risks and recommendations.`;
}

// Models to try in order (each has separate quota)
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

async function callGeminiREST(apiKey: string, model: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 400, temperature: 0.3 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini ${model}: ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export type AISummaryResult = { text: string; source: "gemini" | "local" };

export async function generateAISummary(
  portfolio: PortfolioData,
  analysis: Omit<RiskAnalysis, "aiSummary">
): Promise<AISummaryResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return { text: generateFallbackSummary(analysis), source: "local" };
  }

  const prompt = SYSTEM_PROMPT + "\n\n" + buildAnalysisPrompt(portfolio, analysis);

  // Try each model until one works
  for (const model of MODELS) {
    try {
      const text = await callGeminiREST(apiKey, model, prompt);
      if (text) return { text, source: "gemini" };
    } catch {
      // Try next model
    }
  }

  // All models rate-limited — use local fallback
  return { text: generateFallbackSummary(analysis), source: "local" };
}

function generateFallbackSummary(
  analysis: Omit<RiskAnalysis, "aiSummary">
): string {
  const { overallScore, overallLabel, vectors, shieldActions } = analysis;

  const weakest = [...vectors].sort((a, b) => a.score - b.score)[0];
  const strongest = [...vectors].sort((a, b) => b.score - a.score)[0];

  let summary = `Your StarkSight Score is **${overallScore}/100** (${overallLabel.toUpperCase()}). `;

  if (overallLabel === "safe") {
    summary += "Your portfolio shows a healthy risk profile across all vectors.";
  } else if (overallLabel === "caution") {
    summary += "Some areas need attention but no critical risks detected.";
  } else if (overallLabel === "warning") {
    summary += "Multiple risk factors flagged — consider rebalancing.";
  } else {
    summary += "Significant risks detected — immediate action recommended.";
  }

  summary += `\n\nStrongest area: **${strongest.name}** (${strongest.score}/100) — ${strongest.reason}. `;
  summary += `Weakest area: **${weakest.name}** (${weakest.score}/100) — ${weakest.reason}.`;

  if (shieldActions.length > 0 && shieldActions[0].title !== "Portfolio looks healthy") {
    summary += `\n\nTop recommendation: ${shieldActions[0].title} — ${shieldActions[0].description}`;
  }

  return summary;
}
