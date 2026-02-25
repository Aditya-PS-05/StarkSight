/**
 * Defensive u256 parser — handles all ways starknet-react can return a u256:
 * - bigint directly
 * - {low, high} struct
 * - [low, high] array
 * - number or string
 */
export function toU256BigInt(value: unknown): bigint {
  if (value === null || value === undefined) return 0n;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") return BigInt(value);
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    if ("low" in v && "high" in v) {
      return BigInt(v.low as string | bigint) + (BigInt(v.high as string | bigint) << 128n);
    }
    if (Array.isArray(value) && value.length >= 1) {
      const low = BigInt(value[0]);
      const high = value.length > 1 ? BigInt(value[1]) : 0n;
      return low + (high << 128n);
    }
  }
  try {
    return BigInt(String(value));
  } catch {
    return 0n;
  }
}

/**
 * Format a raw token balance (bigint) to human-readable string.
 * e.g. 1500000000000000000n with 18 decimals => "1.5"
 */
export function formatTokenBalance(raw: bigint, decimals: number, maxDecimals: number = 4): string {
  if (raw === 0n) return "0";
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  if (frac === 0n) return whole.toString();
  const fracStr = frac
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  return `${whole}.${fracStr.slice(0, maxDecimals)}`;
}

/**
 * Truncate an address for display: 0x1234...abcd
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format USD value with commas and 2 decimal places.
 */
export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
