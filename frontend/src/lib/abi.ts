// Minimal ERC-20 ABI for balance reads (OpenZeppelin Cairo 2 style)
export const ERC20_BALANCE_ABI = [
  {
    type: "function" as const,
    name: "balance_of",
    inputs: [
      {
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    outputs: [{ type: "core::integer::u256" }],
    state_mutability: "view" as const,
  },
] as const;

// Attestation Registry ABI (matches our Cairo contract)
export const ATTESTATION_REGISTRY_ABI = [
  {
    type: "function" as const,
    name: "submit_attestation",
    inputs: [
      { name: "commitment", type: "core::felt252" },
      { name: "score_range", type: "core::integer::u8" },
      { name: "nullifier", type: "core::felt252" },
    ],
    outputs: [],
    state_mutability: "external" as const,
  },
  {
    type: "function" as const,
    name: "get_attestation_count",
    inputs: [
      {
        name: "wallet",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    outputs: [{ type: "core::integer::u32" }],
    state_mutability: "view" as const,
  },
  {
    type: "function" as const,
    name: "get_attestation",
    inputs: [
      {
        name: "wallet",
        type: "core::starknet::contract_address::ContractAddress",
      },
      { name: "index", type: "core::integer::u32" },
    ],
    outputs: [
      {
        type: "(core::felt252, core::integer::u8, core::integer::u64, core::integer::u64)",
      },
    ],
    state_mutability: "view" as const,
  },
  {
    type: "function" as const,
    name: "is_nullifier_used",
    inputs: [{ name: "nullifier", type: "core::felt252" }],
    outputs: [{ type: "core::bool" }],
    state_mutability: "view" as const,
  },
] as const;
