# StarkSight — AI-Powered Private Portfolio Guardian

**Re{define} Hackathon | Privacy + Bitcoin + Wildcard Tracks**

StarkSight is a privacy-preserving AI portfolio guardian built on Starknet. It analyzes your DeFi portfolio across 6 risk vectors using AI, generates actionable shield recommendations, and lets you mint ZK safety attestations on-chain — all without exposing your holdings.

## The Problem

DeFi users have no way to prove their portfolio is safe without revealing what they hold. Existing portfolio tools send your wallet data to centralized backends, creating privacy and security risks. There's also no standardized way to assess wrapped BTC bridge risk on L2s.

## The Solution

StarkSight runs entirely client-side. Your wallet data never leaves your browser. The AI engine (Gemini 2.0 Flash) receives only anonymized percentage allocations — never addresses or raw balances. When you're ready, you can mint a Pedersen commitment on-chain that proves your safety score falls within a range (Safe/Caution/Warning/Danger) without revealing the exact number or your holdings.

## How It Works

1. **Connect** — Link your ArgentX or Braavos wallet
2. **Analyze** — AI scans all token balances (ETH, STRK, WBTC, USDC, USDT, DAI), computes 6 risk vectors, and generates a composite StarkSight Score (0-100)
3. **Shield** — Review AI-recommended protective actions (diversify, rebalance, monitor bridge health)
4. **Attest** — Mint a ZK safety attestation on Starknet. Only `commitment = H(H(wallet, score), nonce)` and the score range bucket go on-chain

## Risk Vectors

| Vector | Weight | What It Measures |
|--------|--------|-----------------|
| Token Diversity | 15% | Number and variety of token holdings |
| Concentration | 20% | Single-asset dominance risk |
| Stability Buffer | 15% | Stablecoin allocation for downside protection |
| BTC Exposure | 15% | Bitcoin store-of-value diversification |
| BTC Bridge Risk | 15% | WBTC bridge dependency and depeg risk |
| Portfolio Size | 20% | Absolute size impact on fees and resilience |

## Privacy Architecture

- **Client-Side Only**: Wallet data, balances, risk calculations
- **Anonymized to AI**: Only percentage allocations sent to Gemini — no addresses, no amounts
- **On-Chain**: Pedersen commitment + score range bucket only. Nullifier prevents duplicate daily attestations

## Bitcoin Integration

- WBTC balance detection and BTC-denominated portfolio tracking
- Dedicated BTC Bridge Risk vector analyzing wrapped BTC bridge dependency
- Bridge-specific shield actions (depeg monitoring, exposure reduction)
- BTC price feed alongside USD values

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Wallet | starknet-react v5, ArgentX, Braavos |
| AI Engine | Google Gemini 2.0 Flash |
| Smart Contract | Cairo 2.15, Scarb |
| Cryptography | Pedersen hash (starknet.js, STARK-native) |
| Blockchain | Starknet Sepolia |

## Smart Contract

**AttestationRegistry** — Stores privacy-preserving safety attestations:
- `submit_attestation(commitment, score_range, nullifier)` — mint attestation
- `get_attestation(wallet, index)` — read attestation
- `get_attestation_count(wallet)` — reputation building
- `is_nullifier_used(nullifier)` — replay protection

## Quick Start

```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env.local
# Add your NEXT_PUBLIC_GEMINI_API_KEY
npm run dev
```

## Project Structure

```
StarkSight/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/           # Pages and layout
│   │   ├── components/    # Navbar, Landing, Dashboard, AttestationPanel
│   │   ├── hooks/         # usePortfolio, useRiskAnalysis, useAttestation
│   │   ├── lib/           # risk-engine, ai-summary, attestation, prices, abi, utils
│   │   ├── config/        # Starknet config, token addresses
│   │   ├── context/       # StarknetProvider
│   │   └── types/         # TypeScript interfaces
│   └── package.json
├── contracts/         # Cairo smart contracts
│   ├── src/
│   │   ├── lib.cairo
│   │   └── attestation_registry.cairo
│   └── Scarb.toml
└── README.md
```

## Links

- **Live Demo**: _deployed on Vercel_
- **Contract**: _deployed on Starknet Sepolia_
- **Video Demo**: _3-minute walkthrough_

## License

MIT
