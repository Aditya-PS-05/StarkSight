// Price fetching from CoinGecko (free, no API key needed)

const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  STRK: "starknet",
  WBTC: "wrapped-bitcoin",
  BTC: "bitcoin",
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
};

let priceCache: { prices: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_TTL = 60_000; // 1 minute

export async function fetchTokenPrices(): Promise<Record<string, number>> {
  if (priceCache && Date.now() - priceCache.fetchedAt < CACHE_TTL) {
    return priceCache.prices;
  }

  const ids = Object.values(COINGECKO_IDS).join(",");
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    );
    const data = await res.json();

    const prices: Record<string, number> = {};
    for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
      prices[symbol] = data[geckoId]?.usd ?? 0;
    }

    priceCache = { prices, fetchedAt: Date.now() };
    return prices;
  } catch {
    return {
      ETH: 2800,
      STRK: 0.5,
      WBTC: 95000,
      BTC: 95000,
      USDC: 1,
      USDT: 1,
      DAI: 1,
    };
  }
}

/** Convert USD value to BTC equivalent */
export function usdToBtc(usdValue: number, btcPrice: number): number {
  if (btcPrice <= 0) return 0;
  return usdValue / btcPrice;
}

/** Format BTC amount (8 decimal places max) */
export function formatBtc(btc: number): string {
  if (btc === 0) return "0";
  if (btc < 0.00001) return btc.toExponential(2);
  return btc.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}
