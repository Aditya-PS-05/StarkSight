export const STARKNET_CONFIG = {
  rpcUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://api.cartridge.gg/x/starknet/sepolia",
  network: "sepolia" as const,
  explorerUrl: "https://sepolia.starkscan.co",
  voyagerUrl: "https://sepolia.voyager.online",
};

// Well-known token addresses on Starknet Sepolia
export const TOKEN_ADDRESSES: Record<string, string> = {
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  USDC: "0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080",
  USDT: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
  WBTC: "0x12d537dc323c439dc65c976fad242d5610d27cfb5f31689a0a319b8be7f3d56",
  DAI: "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
};

export const TOKEN_DECIMALS: Record<string, number> = {
  ETH: 18,
  STRK: 18,
  USDC: 6,
  USDT: 6,
  WBTC: 8,
  DAI: 18,
};

// Known DeFi protocol addresses on Starknet
export const DEFI_PROTOCOLS: Record<string, { name: string; type: string; url: string }> = {
  vesu: { name: "Vesu", type: "Lending", url: "https://vesu.xyz" },
  ekubo: { name: "Ekubo", type: "DEX/LP", url: "https://ekubo.org" },
  zklend: { name: "zkLend", type: "Lending", url: "https://zklend.com" },
  nostra: { name: "Nostra", type: "Lending", url: "https://nostra.finance" },
};

// Attestation Registry contract
export const ATTESTATION_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_ATTESTATION_REGISTRY || "";

// Tongo confidential token contracts (Sepolia)
export const TONGO_CONTRACTS: Record<string, string> = {
  STRK: "0x0408163b87b1fae7e848e47bce96b3e6a32e427971bba64d95e1a5bb0a9b5b12",
  ETH: "0x02cf0dc1e2ea90e3ba7a944e83c7839efb3e3da48c75975d74f7f7f2ac51c5d3",
  USDC: "0x02caae36c52b4e696aee6e9dcf29a8e581e52c1dbed43ac65183946b556e16e3",
};
