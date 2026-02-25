// StarkSight Attestation Registry
// Stores privacy-preserving safety attestations on-chain.
// Only a Pedersen commitment + score range bucket is stored.
// The actual score and portfolio details never touch the chain.

use starknet::ContractAddress;

#[derive(Drop, Serde, starknet::Store)]
pub struct Attestation {
    pub commitment: felt252,
    pub score_range: u8, // 0=danger, 1=warning, 2=caution, 3=safe
    pub timestamp: u64,
    pub block_number: u64,
}

#[starknet::interface]
pub trait IAttestationRegistry<TContractState> {
    fn submit_attestation(
        ref self: TContractState,
        commitment: felt252,
        score_range: u8,
        nullifier: felt252,
    );
    fn get_attestation(self: @TContractState, wallet: ContractAddress, index: u32) -> Attestation;
    fn get_attestation_count(self: @TContractState, wallet: ContractAddress) -> u32;
    fn is_nullifier_used(self: @TContractState, nullifier: felt252) -> bool;
}

#[starknet::contract]
pub mod AttestationRegistry {
    use starknet::{ContractAddress, get_caller_address, get_block_info};
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePathEntry};
    use super::{Attestation, IAttestationRegistry};

    #[storage]
    struct Storage {
        attestation_count: Map<ContractAddress, u32>,
        attestations: Map<(ContractAddress, u32), Attestation>,
        nullifiers: Map<felt252, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AttestationSubmitted: AttestationSubmitted,
    }

    #[derive(Drop, starknet::Event)]
    struct AttestationSubmitted {
        #[key]
        wallet: ContractAddress,
        commitment: felt252,
        score_range: u8,
        timestamp: u64,
    }

    #[abi(embed_v0)]
    impl AttestationRegistryImpl of IAttestationRegistry<ContractState> {
        fn submit_attestation(
            ref self: ContractState,
            commitment: felt252,
            score_range: u8,
            nullifier: felt252,
        ) {
            assert(score_range <= 3, 'Invalid score range');
            assert(!self.nullifiers.read(nullifier), 'Nullifier already used');

            let caller = get_caller_address();
            let block_info = get_block_info().unbox();
            let timestamp = block_info.block_timestamp;
            let block_number = block_info.block_number;

            let count = self.attestation_count.read(caller);

            let attestation = Attestation {
                commitment,
                score_range,
                timestamp,
                block_number,
            };

            self.attestations.write((caller, count), attestation);
            self.attestation_count.write(caller, count + 1);
            self.nullifiers.write(nullifier, true);

            self.emit(AttestationSubmitted {
                wallet: caller,
                commitment,
                score_range,
                timestamp,
            });
        }

        fn get_attestation(self: @ContractState, wallet: ContractAddress, index: u32) -> Attestation {
            let count = self.attestation_count.read(wallet);
            assert(index < count, 'Index out of bounds');
            self.attestations.read((wallet, index))
        }

        fn get_attestation_count(self: @ContractState, wallet: ContractAddress) -> u32 {
            self.attestation_count.read(wallet)
        }

        fn is_nullifier_used(self: @ContractState, nullifier: felt252) -> bool {
            self.nullifiers.read(nullifier)
        }
    }
}
