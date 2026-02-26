use starknet::ContractAddress;
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address};
use starksight::attestation_registry::{
    IAttestationRegistryDispatcher, IAttestationRegistryDispatcherTrait,
};

fn deploy_attestation_registry() -> (IAttestationRegistryDispatcher, ContractAddress) {
    let contract = declare("AttestationRegistry").unwrap().contract_class();
    let constructor_calldata = array![];
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    let dispatcher = IAttestationRegistryDispatcher { contract_address };
    (dispatcher, contract_address)
}

fn caller() -> ContractAddress {
    let addr: felt252 = 'caller';
    addr.try_into().unwrap()
}

#[test]
fn test_get_attestation_count_starts_at_zero() {
    let (dispatcher, _) = deploy_attestation_registry();
    let wallet: ContractAddress = 'some_wallet'.try_into().unwrap();
    let count = dispatcher.get_attestation_count(wallet);
    assert!(count == 0, "attestation count should start at 0");
}

#[test]
fn test_submit_attestation_happy_path() {
    let (dispatcher, contract_address) = deploy_attestation_registry();
    let user = caller();

    start_cheat_caller_address(contract_address, user);

    // Count should start at 0
    assert!(dispatcher.get_attestation_count(user) == 0, "count should be 0 initially");

    // Submit first attestation
    dispatcher.submit_attestation(
        commitment: 0x1234,
        score_range: 3,
        nullifier: 0xaaa,
    );
    assert!(dispatcher.get_attestation_count(user) == 1, "count should be 1 after first submit");

    // Submit second attestation with different nullifier
    dispatcher.submit_attestation(
        commitment: 0x5678,
        score_range: 1,
        nullifier: 0xbbb,
    );
    assert!(dispatcher.get_attestation_count(user) == 2, "count should be 2 after second submit");

    // Verify nullifiers are marked as used
    assert!(dispatcher.is_nullifier_used(0xaaa), "nullifier 0xaaa should be used");
    assert!(dispatcher.is_nullifier_used(0xbbb), "nullifier 0xbbb should be used");
    assert!(!dispatcher.is_nullifier_used(0xccc), "nullifier 0xccc should not be used");
}

#[test]
fn test_get_attestation_returns_correct_data() {
    let (dispatcher, contract_address) = deploy_attestation_registry();
    let user = caller();

    start_cheat_caller_address(contract_address, user);

    let commitment: felt252 = 0xdeadbeef;
    let score_range: u8 = 2; // caution

    dispatcher.submit_attestation(
        commitment: commitment,
        score_range: score_range,
        nullifier: 0x111,
    );

    let attestation = dispatcher.get_attestation(user, 0);

    assert!(attestation.commitment == commitment, "commitment mismatch");
    assert!(attestation.score_range == score_range, "score_range mismatch");
    // timestamp and block_number are set by the blockchain context;
    // in the test environment they will be default values, but we
    // verify the struct is returned correctly.
}

#[test]
#[should_panic(expected: 'Nullifier already used')]
fn test_nullifier_replay_prevention() {
    let (dispatcher, contract_address) = deploy_attestation_registry();
    let user = caller();

    start_cheat_caller_address(contract_address, user);

    let nullifier: felt252 = 0xdeadbeef;

    // First submission should succeed
    dispatcher.submit_attestation(
        commitment: 0x1111,
        score_range: 0,
        nullifier: nullifier,
    );

    // Second submission with the same nullifier should panic
    dispatcher.submit_attestation(
        commitment: 0x2222,
        score_range: 1,
        nullifier: nullifier,
    );
}

#[test]
#[should_panic(expected: 'Invalid score range')]
fn test_invalid_score_range_rejected() {
    let (dispatcher, contract_address) = deploy_attestation_registry();
    let user = caller();

    start_cheat_caller_address(contract_address, user);

    // score_range = 4 is invalid (must be 0..=3)
    dispatcher.submit_attestation(
        commitment: 0xabcd,
        score_range: 4,
        nullifier: 0xfff,
    );
}
