"use client";

import { useState, useCallback, useEffect } from "react";
import { useSendTransaction } from "@starknet-react/core";
import { ATTESTATION_REGISTRY_ADDRESS } from "@/config/starknet";
import {
  generateCommitment,
  generateNonce,
  generateNullifier,
  getScoreRange,
  storeAttestationSecret,
  getAttestationSecrets,
} from "@/lib/attestation";

interface AttestationState {
  status: "idle" | "generating" | "pending" | "success" | "error";
  txHash?: string;
  error?: string;
}

export function useAttestation(walletAddress: string | undefined) {
  const { sendAsync } = useSendTransaction({ calls: [] });
  const [state, setState] = useState<AttestationState>({ status: "idle" });
  const [history, setHistory] = useState<ReturnType<typeof getAttestationSecrets>>([]);

  // Load attestation history from localStorage
  useEffect(() => {
    setHistory(getAttestationSecrets());
  }, [state.status]);

  const submitAttestation = useCallback(
    async (score: number) => {
      if (!walletAddress || !ATTESTATION_REGISTRY_ADDRESS) {
        setState({
          status: "error",
          error: ATTESTATION_REGISTRY_ADDRESS
            ? "Wallet not connected"
            : "Attestation contract not deployed yet",
        });
        return;
      }

      setState({ status: "generating" });

      try {
        // Step 1: Generate commitment client-side
        const nonce = generateNonce();
        const commitment = generateCommitment(walletAddress, score, nonce);
        const scoreRange = getScoreRange(score);
        const nullifier = generateNullifier(walletAddress);

        setState({ status: "pending" });

        // Step 2: Submit to contract
        const result = await sendAsync([
          {
            contractAddress: ATTESTATION_REGISTRY_ADDRESS,
            entrypoint: "submit_attestation",
            calldata: [commitment, scoreRange.toString(), nullifier],
          },
        ]);

        const txHash = (result as { transaction_hash?: string })?.transaction_hash;

        // Step 3: Store secrets locally
        storeAttestationSecret({
          commitment,
          score,
          nonce,
          scoreRange,
          timestamp: Date.now(),
          txHash: txHash || undefined,
        });

        setState({ status: "success", txHash: txHash || undefined });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Transaction failed";
        setState({ status: "error", error: message });
      }
    },
    [walletAddress, sendAsync]
  );

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return {
    ...state,
    history,
    submitAttestation,
    reset,
    contractDeployed: !!ATTESTATION_REGISTRY_ADDRESS,
  };
}
