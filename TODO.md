# StarkSight — AI-Powered Private Portfolio Guardian

## Project Overview
AI-powered DeFi portfolio guardian on Starknet. Analyzes positions client-side (privacy-preserving),
generates risk scores, posts ZK attestations on-chain, and recommends protective actions.
Targets all 3 tracks: Privacy + Bitcoin + Wildcard.

---

## Completed Phases

### PHASE 1: Project Setup & Infrastructure ✅
- [x] Initialize Next.js 16 project with TypeScript + Tailwind CSS 4
- [x] Set up project structure (app router, components, lib, hooks, types)
- [x] Install Starknet dependencies (starknet.js v9, starknet-react v5)
- [x] Install AI dependencies (Google Gemini SDK)
- [x] Install crypto dependencies (starknet.js Pedersen hash)
- [x] Set up environment variables (.env.local)
- [x] Configure Starknet Sepolia RPC (Cartridge)
- [x] Set up Scarb project for Cairo smart contracts

### PHASE 2: Wallet Connection & Portfolio Fetching ✅
- [x] Implement wallet connection (ArgentX + Braavos via starknet-react)
- [x] Build wallet connect button component with status indicator
- [x] Fetch token balances (ETH, STRK, WBTC, USDC, USDT, DAI) — parallel RPC calls
- [x] Fetch USD prices from CoinGecko with 1-min cache + fallback
- [x] Build portfolio data model (types for positions, balances)
- [x] ALL data stays client-side — no backend calls with wallet data

### PHASE 3: AI Risk Analysis Engine ✅
- [x] 6-vector risk scoring model (0-100 scale)
- [x] Build risk analyzer module (deterministic, client-side)
- [x] Integrate Gemini AI for natural language summaries (anonymized metrics only)
- [x] Multi-model fallback (2.0-flash → 2.0-flash-lite → 1.5-flash → local)
- [x] Compute composite StarkSight Score (weighted average)
- [x] Generate per-token risk breakdown
- [x] Generate Shield Actions

### PHASE 4: Cairo Smart Contract ✅
- [x] AttestationRegistry contract (submit, get, count, nullifier check)
- [x] Privacy model: Pedersen commitment + score range bucket
- [x] Compiled with Scarb (Cairo 2.15.0)
- [x] Deployed to Starknet Sepolia: `0x067a56cef31591e68a37b2b7a79a647ac798e25c5aaab417fb5e58901f723217`
- [x] All functions verified via starkli

### PHASE 5: ZK Attestation Flow ✅
- [x] Attestation generation (commitment + nullifier + score range)
- [x] Frontend → contract submission via useSendTransaction
- [x] Local nonce storage in localStorage
- [x] Attestation history display
- [x] Tx link to Starkscan

### PHASE 6: Frontend UI / Dashboard ✅
- [x] Landing page with track badges, hero, features, privacy architecture
- [x] Dashboard with score gauge, risk vectors, AI summary, token holdings
- [x] Shield actions panel
- [x] Attestation section with mint button
- [x] Trust indicators (AI source badge, methodology panel, privacy footer)
- [x] Dark mode default

### PHASE 7: Bitcoin Integration ✅
- [x] WBTC balance detection
- [x] BTC-denominated portfolio value
- [x] BTC Bridge Risk vector (15% weight)
- [x] BTC Exposure vector (15% weight)

### PHASE 8: Polish ✅
- [x] Markdown rendering for AI summary
- [x] Open methodology panel with vector weights
- [x] Trust footer (client-side, open methodology, ZK proofs)
- [x] README.md for hackathon submission

---

## PHASE 10: FINAL PUSH — Win the Hackathon 🏆

### HIGH IMPACT (do these first)

#### 10.1 Deploy Frontend to Vercel
- [ ] Deploy to Vercel with live URL
- [ ] Set environment variables (RPC URL, contract address, Gemini API key)
- [ ] Test full flow on deployed version
- [ ] Many projects won't have a live demo — this is a massive edge

#### 10.2 Record 3-Minute Video Demo
- [ ] Show landing page → connect wallet → portfolio loads
- [ ] Show risk analysis with score gauge + vectors + weights
- [ ] Click "View Methodology" to show open/transparent scoring
- [ ] Show AI Risk Assessment with source badge (Gemini AI / Local)
- [ ] Scroll through Shield Actions + Token Risk Details
- [ ] Mint a ZK Safety Attestation on-chain
- [ ] Show tx confirmed on Starkscan
- [ ] Highlight privacy: "No wallet data leaves your browser"
- [ ] Highlight Bitcoin: BTC-denominated value + bridge risk vector
- [ ] End with trust footer: client-side + open methodology + ZK proofs

#### 10.3 Reframe the Narrative (README + Submission)
- [ ] Lead with: "Client-side deterministic risk scoring engine" (not "AI-powered")
- [ ] Position AI as optional enhancement, not core dependency
- [ ] Emphasize: deterministic + verifiable + privacy-preserving
- [ ] Highlight uniqueness: no other project combines risk analysis + ZK attestations
- [ ] Mention all 3 tracks explicitly in submission description

### MEDIUM IMPACT (if time permits)

#### 10.4 Verify Contract on Starkscan
- [ ] Submit contract source for verification on Starkscan/Voyager
- [ ] Judges can verify the on-chain code matches the repo

#### 10.5 Add Basic Error States
- [ ] Distinguish "no tokens found" vs "failed to load" in dashboard
- [ ] Show friendly message when wallet has no Sepolia tokens
- [ ] Add error boundary component for unexpected crashes

#### 10.6 Improve Mobile Responsiveness
- [ ] Test dashboard on mobile viewport
- [ ] Fix any overflow/layout issues on small screens
- [ ] Landing page mobile polish

### NICE-TO-HAVE (only if extra time)

#### 10.7 Add Tongo SDK Integration
- [ ] Even a basic privacy transfer demo would signal alignment with hackathon sponsors
- [ ] Many winners will use Tongo — not having it is a gap
- [ ] Could add a "Private Transfer" tab next to Portfolio Guardian

#### 10.8 Add Contract Tests
- [ ] Write snforge tests for attestation_registry.cairo
- [ ] submit_attestation happy path
- [ ] Nullifier replay prevention
- [ ] Invalid score_range rejection
- [ ] Judges may check for tests

#### 10.9 GitHub Polish
- [ ] Create public repo
- [ ] Clean commit history
- [ ] Add LICENSE (MIT)
- [ ] Add architecture diagram to README

---

## Competitive Position

**Rank estimate: Top 5-8 out of 21 projects**

### Who will likely beat us:
| Project | Why |
|---------|-----|
| Obelysk | Dark pool + shielded swaps + 37 contracts. Most ambitious. |
| ShadowSwap | Encrypted DEX solving MEV. Uses Tongo SDK. |
| Cloak | Multi-platform (web + extension + mobile). Venmo-like UX. |
| Hush | Polished privacy payments with stealth addresses. |

### Our advantages:
- **Only AI project** in the entire hackathon
- **Only risk analysis tool** — unique niche, no competition
- **Targets all 3 tracks** (most target 1-2)
- **BTC bridge risk** analysis — nobody else does this
- **ZK attestation model** — novel on-chain reputation
- **Working live demo** (if deployed to Vercel)

### Path to top 3:
1. Live Vercel deployment (many projects won't have this)
2. Polished 3-min video showing full flow
3. Reframe narrative: privacy-first deterministic engine > AI dependency
4. Wildcard track is least competitive — best chance to win there

---

## Tech Stack (Actual)
| Layer          | Technology                                     |
|----------------|-------------------------------------------------|
| Frontend       | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Wallet         | starknet-react v5, ArgentX, Braavos             |
| Smart Contract | Cairo 2.15.0, Scarb 2.15.2                      |
| AI Engine      | Google Gemini 2.0 Flash (REST API, multi-model) |
| Blockchain     | Starknet Sepolia                                 |
| Crypto         | Pedersen hash (starknet.js native)               |
| Deploy         | Vercel (frontend), Starknet Sepolia (contract)   |
| RPC            | Cartridge (frontend), Alchemy (deployment)       |
