"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RpcProvider } from "starknet";
import { STARKNET_CONFIG, TOKEN_ADDRESSES, TOKEN_DECIMALS } from "@/config/starknet";
import { formatTokenBalance } from "@/lib/utils";
import { fetchTokenPrices } from "@/lib/prices";
import type { TokenBalance, PortfolioData, DeFiPosition } from "@/types";

const TOKENS = ["ETH", "STRK", "WBTC", "USDC", "USDT", "DAI"];

async function fetchAllBalances(
  address: string,
  rpcUrl: string
): Promise<Record<string, bigint>> {
  const provider = new RpcProvider({ nodeUrl: rpcUrl });
  const results: Record<string, bigint> = {};

  // Fetch all 6 token balances in parallel
  const promises = TOKENS.map(async (symbol) => {
    try {
      const res = await provider.callContract({
        contractAddress: TOKEN_ADDRESSES[symbol],
        entrypoint: "balance_of",
        calldata: [address],
      });
      // u256 returns [low, high]
      const low = BigInt(res[0] || "0");
      const high = res[1] ? BigInt(res[1]) : 0n;
      results[symbol] = low + (high << 128n);
    } catch {
      results[symbol] = 0n;
    }
  });

  await Promise.all(promises);
  return results;
}

export function usePortfolio(address: string | undefined) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});

  const buildPortfolio = useCallback(
    async (addr: string) => {
      setLoading(true);

      // Fetch balances and prices in parallel
      const [balances, tokenPrices] = await Promise.all([
        fetchAllBalances(addr, STARKNET_CONFIG.rpcUrl),
        fetchTokenPrices(),
      ]);

      setPrices(tokenPrices);

      const tokens: TokenBalance[] = TOKENS.map((symbol) => {
        const raw = balances[symbol] || 0n;
        const decimals = TOKEN_DECIMALS[symbol];
        const balanceFormatted = parseFloat(formatTokenBalance(raw, decimals, 6));
        const usdValue = balanceFormatted * (tokenPrices[symbol] || 0);

        return {
          symbol,
          address: TOKEN_ADDRESSES[symbol],
          balance: raw,
          balanceFormatted,
          usdValue,
          decimals,
        };
      }).filter((t) => t.balance > 0n);

      const totalValueUsd = tokens.reduce((sum, t) => sum + t.usdValue, 0);

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
        address: addr,
        totalValueUsd,
        tokens,
        positions,
        fetchedAt: Date.now(),
      });
      setLoading(false);
    },
    []
  );

  // Auto-fetch on wallet connect
  useEffect(() => {
    if (!address) {
      setPortfolio(null);
      return;
    }
    buildPortfolio(address);
  }, [address, buildPortfolio]);

  const refetch = useCallback(() => {
    if (address) buildPortfolio(address);
  }, [address, buildPortfolio]);

  return { portfolio, loading, refetch, prices };
}
