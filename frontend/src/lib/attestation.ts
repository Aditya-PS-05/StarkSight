import { hash } from "starknet";

/**
 * Score range buckets:
 * 0 = Danger  (0-39)
 * 1 = Warning (40-59)
 * 2 = Caution (60-79)
 * 3 = Safe    (80-100)
 */
export function getScoreRange(score: number): number {
  if (score >= 80) return 3;
  if (score >= 60) return 2;
  if (score >= 40) return 1;
  return 0;
}

export function getScoreRangeLabel(range: number): string {
  switch (range) {
    case 3: return "Safe (80-100)";
    case 2: return "Caution (60-79)";
    case 1: return "Warning (40-59)";
    case 0: return "Danger (0-39)";
    default: return "Unknown";
  }
}

/**
 * Generate a random nonce for commitment privacy.
 * Stored in localStorage so user can prove exact score later.
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(31); // felt252 is < 252 bits, 31 bytes is safe
  crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a Pedersen commitment:
 *   commitment = H(H(wallet_address, score), nonce)
 *
 * Only the commitment + score_range go on-chain.
 * The actual score and nonce stay with the user.
 */
export function generateCommitment(
  walletAddress: string,
  score: number,
  nonce: string
): string {
  const scoreHex = "0x" + score.toString(16);
  const h1 = hash.computePedersenHash(walletAddress, scoreHex);
  const commitment = hash.computePedersenHash(h1, nonce);
  return commitment;
}

/**
 * Generate a nullifier to prevent duplicate attestations per epoch.
 *   nullifier = H(wallet_address, epoch_day)
 *
 * One attestation allowed per day per wallet.
 */
export function generateNullifier(walletAddress: string): string {
  const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const epochHex = "0x" + epochDay.toString(16);
  return hash.computePedersenHash(walletAddress, epochHex);
}

/**
 * Store attestation secrets locally so user can prove score later.
 */
const STORAGE_KEY = "starksight_attestations";

interface AttestationSecret {
  commitment: string;
  score: number;
  nonce: string;
  scoreRange: number;
  timestamp: number;
  txHash?: string;
}

export function storeAttestationSecret(secret: AttestationSecret): void {
  try {
    const existing = getAttestationSecrets();
    existing.push(secret);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function getAttestationSecrets(): AttestationSecret[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
