"use client";

import { useState, useEffect, useCallback } from "react";
import { useReadContract } from "@starknet-react/core";
import { TOKEN_ADDRESSES, TOKEN_DECIMALS } from "@/config/starknet";
import { ERC20_BALANCE_ABI } from "@/lib/abi";
import { toU256BigInt, formatTokenBalance } from "@/lib/utils";
import { fetchTokenPrices } from "@/lib/prices";
import type { TokenBalance, PortfolioData, DeFiPosition } from "@/types";

const TOKENS = ["ETH", "STRK", "WBTC", "USDC", "USDT", "DAI"];

function useTokenBalance(symbol: string, address: string | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: TOKEN_ADDRESSES[symbol] as `0x${string}`,
    abi: ERC20_BALANCE_ABI,
    functionName: "balance_of",
    args: address ? [address] : undefined,
    watch: true,
    enabled: !!address,
  });

  return { data, isLoading, refetch };
}

export function usePortfolio(address: string | undefined) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});

  // Read all token balances
  const ethBalance = useTokenBalance("ETH", address);
  const strkBalance = useTokenBalance("STRK", address);
  const wbtcBalance = useTokenBalance("WBTC", address);
  const usdcBalance = useTokenBalance("USDC", address);
  const usdtBalance = useTokenBalance("USDT", address);
  const daiBalance = useTokenBalance("DAI", address);

  const balanceResults = [
    { symbol: "ETH", ...ethBalance },
    { symbol: "STRK", ...strkBalance },
    { symbol: "WBTC", ...wbtcBalance },
    { symbol: "USDC", ...usdcBalance },
    { symbol: "USDT", ...usdtBalance },
    { symbol: "DAI", ...daiBalance },
  ];

  // Fetch prices
  useEffect(() => {
    fetchTokenPrices().then(setPrices);
    const interval = setInterval(() => {
      fetchTokenPrices().then(setPrices);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Build portfolio when balances + prices ready
  useEffect(() => {
    if (!address) return;
    const anyLoading = balanceResults.some((b) => b.isLoading);
    if (anyLoading || Object.keys(prices).length === 0) {
      setLoading(true);
      return;
    }

    const tokens: TokenBalance[] = balanceResults
      .map((b) => {
        const raw = toU256BigInt(b.data);
        const decimals = TOKEN_DECIMALS[b.symbol];
        const balanceFormatted = parseFloat(formatTokenBalance(raw, decimals, 6));
        const usdValue = balanceFormatted * (prices[b.symbol] || 0);

        return {
          symbol: b.symbol,
          address: TOKEN_ADDRESSES[b.symbol],
          balance: raw,
          balanceFormatted,
          usdValue,
          decimals,
        };
      })
      .filter((t) => t.balance > 0n);

    const totalValueUsd = tokens.reduce((sum, t) => sum + t.usdValue, 0);

    // DeFi positions - detected from token context
    // For hackathon MVP: we detect WBTC holdings as "BTC exposure"
    const positions: DeFiPosition[] = [];

    const wbtcToken = tokens.find((t) => t.symbol === "WBTC");
    if (wbtcToken && wbtcToken.balance > 0n) {
      positions.push({
        protocol: "Wallet",
        type: "staking",
        token: "WBTC",
        amount: wbtcToken.balanceFormatted,
        usdValue: wbtcToken.usdValue,
        details: { source: "WBTC holding - Bitcoin exposure on Starknet" },
      });
    }

    setPortfolio({
      address,
      totalValueUsd,
      tokens,
      positions,
      fetchedAt: Date.now(),
    });
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address,
    ethBalance.data,
    strkBalance.data,
    wbtcBalance.data,
    usdcBalance.data,
    usdtBalance.data,
    daiBalance.data,
    prices,
  ]);

  const refetch = useCallback(() => {
    balanceResults.forEach((b) => b.refetch());
    fetchTokenPrices().then(setPrices);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { portfolio, loading, refetch, prices };
}
