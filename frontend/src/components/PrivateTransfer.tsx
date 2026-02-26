"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { RpcProvider } from "starknet";
import { Lock, Send, Shield, Eye, EyeOff, ArrowRight, Info, AlertTriangle } from "lucide-react";
import { STARKNET_CONFIG, TONGO_CONTRACTS } from "@/config/starknet";

// Tongo SDK is loaded dynamically at runtime only (WASM modules break SSR)
type TongoAccountType = {
  transfer: (args: { to: string; amount: string; sender: string }) => Promise<{ toCalldata: () => unknown }>;
};
type TongoAccountConstructor = new (key: string, contract: string, provider: unknown) => TongoAccountType;

type TongoToken = "STRK" | "ETH" | "USDC";
type TransferStep = "setup" | "generating" | "signing" | "confirming" | "done" | "error";

interface PrivateTransferProps {
  address: string;
}

export function PrivateTransfer({ address }: PrivateTransferProps) {
  const { account } = useAccount();
  const [token, setToken] = useState<TongoToken>("STRK");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tongoKey, setTongoKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [step, setStep] = useState<TransferStep>("setup");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const handleTransfer = async () => {
    if (!account || !tongoKey || !recipient || !amount) return;

    setStep("generating");
    setError("");

    try {
      // Dynamic import to avoid SSR/WASM issues with Tongo SDK
      const tongoModule = await import(/* webpackIgnore: true */ "@fatsolutions/tongo-sdk");
      const TongoAccount = tongoModule.Account as unknown as TongoAccountConstructor;

      const provider = new RpcProvider({ nodeUrl: STARKNET_CONFIG.rpcUrl });
      const tongoContractAddress = TONGO_CONTRACTS[token];

      if (!tongoContractAddress) {
        throw new Error(`Tongo contract not available for ${token} on Sepolia`);
      }

      const tongoAccount = new TongoAccount(tongoKey, tongoContractAddress, provider);

      setStep("signing");

      const transferOp = await tongoAccount.transfer({
        to: recipient,
        amount,
        sender: address,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = await account.execute([transferOp.toCalldata() as any]);
      setStep("confirming");

      setTxHash(tx.transaction_hash);
      await provider.waitForTransaction(tx.transaction_hash);

      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("setup");
    setAmount("");
    setRecipient("");
    setTxHash("");
    setError("");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Lock className="h-8 w-8 text-accent" />
        <div>
          <h1 className="text-2xl font-bold">Private Transfer</h1>
          <p className="text-sm text-muted">
            Confidential transfers powered by Tongo Protocol (ElGamal encryption)
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
        <h3 className="text-xs font-semibold text-accent mb-2 flex items-center gap-1.5">
          <Shield className="h-3 w-3" />
          How Tongo Privacy Works
        </h3>
        <div className="grid gap-2 text-xs text-muted">
          <p>Tongo wraps ERC20 tokens with <strong className="text-foreground/80">ElGamal encryption</strong> — amounts are encrypted on-chain so only sender and recipient can see them.</p>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="rounded-lg bg-card p-2 text-center">
              <p className="font-medium text-foreground/80">No Trusted Setup</p>
              <p className="text-[10px]">Pure elliptic curve crypto</p>
            </div>
            <div className="rounded-lg bg-card p-2 text-center">
              <p className="font-medium text-foreground/80">Hidden Amounts</p>
              <p className="text-[10px]">Balances encrypted on-chain</p>
            </div>
            <div className="rounded-lg bg-card p-2 text-center">
              <p className="font-medium text-foreground/80">Auditable</p>
              <p className="text-[10px]">Selective disclosure support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Form */}
      <div className="rounded-xl border border-card-border bg-card p-6">
        {step === "done" ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Shield className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-bold text-success">Transfer Complete</h3>
            <p className="text-sm text-muted mt-2">
              Your confidential transfer has been confirmed on-chain.
            </p>
            {txHash && (
              <a
                href={`${STARKNET_CONFIG.explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
              >
                View on Starkscan <ArrowRight className="h-3 w-3" />
              </a>
            )}
            <button
              onClick={reset}
              className="mt-4 block mx-auto rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
            >
              New Transfer
            </button>
          </div>
        ) : step === "error" ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
              <AlertTriangle className="h-8 w-8 text-danger" />
            </div>
            <h3 className="text-lg font-bold text-danger">Transfer Failed</h3>
            <p className="text-sm text-muted mt-2">{error}</p>
            <button
              onClick={reset}
              className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Send className="h-4 w-4 text-accent" />
              Send Confidential Transfer
            </h3>

            {/* Tongo Private Key */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted mb-1">
                Tongo Private Key
                <span className="ml-1 text-[10px] text-muted">(separate from wallet key — for ElGamal encryption)</span>
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={tongoKey}
                  onChange={(e) => setTongoKey(e.target.value)}
                  placeholder="Your Tongo private key..."
                  className="w-full rounded-lg border border-card-border bg-background px-3 py-2 pr-10 text-sm focus:border-accent focus:outline-none"
                  disabled={step !== "setup"}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Token Select */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted mb-1">Token</label>
              <div className="flex gap-2">
                {(["STRK", "ETH", "USDC"] as TongoToken[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setToken(t)}
                    disabled={step !== "setup"}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      token === t
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-card-border text-muted hover:border-accent/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted mb-1">Amount (in Tongo units)</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                disabled={step !== "setup"}
              />
            </div>

            {/* Recipient */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-muted mb-1">
                Recipient Tongo Address
                <span className="ml-1 text-[10px] text-muted">(base58 Tongo public key)</span>
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Um6QEVHZaXkii8hWzayJf6PBWrJCTu..."
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                disabled={step !== "setup"}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleTransfer}
              disabled={step !== "setup" || !tongoKey || !amount || !recipient}
              className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === "setup" && (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" />
                  Send Private Transfer
                </span>
              )}
              {step === "generating" && "Generating ZK proof..."}
              {step === "signing" && "Waiting for wallet signature..."}
              {step === "confirming" && "Confirming on-chain..."}
            </button>

            {/* Privacy note */}
            <p className="mt-3 text-[10px] text-muted text-center">
              Transfer amounts are encrypted with ElGamal encryption. Only sender and recipient can decrypt. The Tongo private key never leaves your browser.
            </p>
          </>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 rounded-lg border border-card-border bg-card p-4">
        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
          <Info className="h-3 w-3 text-muted" />
          About Tongo Protocol
        </h4>
        <ul className="text-xs text-muted space-y-1">
          <li>Tongo uses a separate ElGamal keypair for encryption (not your wallet key)</li>
          <li>Generate a Tongo key at <a href="https://tongo.cash" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">tongo.cash</a></li>
          <li>Recipients must &quot;rollover&quot; pending balances before spending</li>
          <li>Audited by zkSecurity — no trusted setup required</li>
        </ul>
      </div>
    </div>
  );
}
