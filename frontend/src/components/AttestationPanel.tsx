"use client";

import { useState } from "react";
import {
  Shield,
  CheckCircle,
  Loader2,
  ExternalLink,
  History,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useAttestation } from "@/hooks/useAttestation";
import { getScoreRangeLabel } from "@/lib/attestation";
import { STARKNET_CONFIG } from "@/config/starknet";
import { getRiskColor } from "@/types";

interface AttestationPanelProps {
  walletAddress: string | undefined;
  score: number | null;
  scoreLabel: string | null;
}

export function AttestationPanel({ walletAddress, score, scoreLabel }: AttestationPanelProps) {
  const { status, txHash, error, history, submitAttestation, reset, contractDeployed } =
    useAttestation(walletAddress);
  const [showHistory, setShowHistory] = useState(false);

  const handleMint = () => {
    if (score !== null) {
      submitAttestation(score);
    }
  };

  return (
    <div className="rounded-xl border border-card-border bg-card p-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Lock className="h-4 w-4 text-accent" />
        ZK Safety Attestation
      </h3>

      <p className="text-xs text-muted mb-4">
        Mint an on-chain proof that your portfolio was safety-checked — without revealing your
        holdings or exact score. Only the score range (Safe/Caution/Warning/Danger) is public.
      </p>

      {/* Current Score Preview */}
      {score !== null && scoreLabel && (
        <div className="mb-4 rounded-lg bg-accent/5 border border-accent/20 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Score to attest</span>
            <span className={`text-sm font-bold ${getRiskColor(scoreLabel)}`}>{score}/100</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted">Public on-chain</span>
            <span className="text-xs font-medium text-accent-light">
              {getScoreRangeLabel(score >= 80 ? 3 : score >= 60 ? 2 : score >= 40 ? 1 : 0)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted">Exact score</span>
            <span className="text-xs font-medium text-success">Hidden (Pedersen commitment)</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      {status === "idle" && (
        <button
          onClick={handleMint}
          disabled={score === null || !contractDeployed}
          className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!contractDeployed
            ? "Contract Not Deployed Yet"
            : score === null
              ? "Analyze Portfolio First"
              : "Mint Safety Attestation"}
        </button>
      )}

      {status === "generating" && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-accent/10 px-4 py-3 text-sm text-accent-light">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating commitment...
        </div>
      )}

      {status === "pending" && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
          <Loader2 className="h-4 w-4 animate-spin" />
          Confirm in your wallet...
        </div>
      )}

      {status === "success" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            Attestation minted on-chain!
          </div>
          {txHash && (
            <a
              href={`${STARKNET_CONFIG.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-xs text-accent-light hover:underline"
            >
              View on Starkscan <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <button
            onClick={reset}
            className="w-full rounded-lg border border-card-border px-4 py-2 text-xs text-muted hover:border-accent hover:text-accent transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4" />
            {error || "Transaction failed"}
          </div>
          <button
            onClick={reset}
            className="w-full rounded-lg border border-card-border px-4 py-2 text-xs text-muted hover:border-accent hover:text-accent transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Attestation History */}
      {history.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-xs text-muted hover:text-accent-light transition-colors"
          >
            <History className="h-3 w-3" />
            {showHistory ? "Hide" : "Show"} attestation history ({history.length})
          </button>

          {showHistory && (
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {[...history].reverse().map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2 text-xs"
                >
                  <div>
                    <span className="font-medium">
                      {getScoreRangeLabel(item.scoreRange)}
                    </span>
                    <span className="text-muted ml-2">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {item.txHash && (
                    <a
                      href={`${STARKNET_CONFIG.explorerUrl}/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-light hover:underline flex items-center gap-1"
                    >
                      tx <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Privacy explainer */}
      <div className="mt-4 rounded-lg bg-card border border-card-border p-3">
        <p className="text-xs text-muted leading-relaxed">
          <strong className="text-foreground">How it works:</strong> Your exact score is hashed
          with a random nonce into a Pedersen commitment. Only the commitment + score range bucket
          go on-chain. The nonce is stored locally so you can prove your exact score to anyone
          later, if you choose.
        </p>
      </div>
    </div>
  );
}
