"use client";

import { useState, useEffect, useCallback } from "react";
import type { PortfolioData, RiskAnalysis } from "@/types";
import { analyzePortfolio } from "@/lib/risk-engine";
import { generateAISummary } from "@/lib/ai-summary";

export function useRiskAnalysis(portfolio: PortfolioData | null) {
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = useCallback(async () => {
    if (!portfolio || portfolio.tokens.length === 0) {
      setAnalysis(null);
      return;
    }

    setAnalyzing(true);

    // Step 1: Heuristic risk scoring (instant)
    const heuristicResult = analyzePortfolio(portfolio);

    // Step 2: AI summary (async, may take 1-3s)
    const aiSummary = await generateAISummary(portfolio, heuristicResult);

    setAnalysis({
      ...heuristicResult,
      aiSummary,
    });

    setAnalyzing(false);
  }, [portfolio]);

  // Auto-analyze when portfolio changes
  useEffect(() => {
    if (portfolio && portfolio.tokens.length > 0) {
      analyze();
    }
  }, [portfolio, analyze]);

  return { analysis, analyzing, reanalyze: analyze };
}
