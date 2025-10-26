// contracts/verification/src/lib.rs
#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Bytes, Env, String, Vec
};

// Verification methods
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VerificationMethod {
    ZKEmail,          // ZK Email proof for job application confirmations
    LinkedInOracle,   // Oracle verification for LinkedIn posts
    Manual,           // Manual submission with proof
}

// Verification status
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VerificationStatus {
    Pending,
    Verified,
    Rejected,
    Expired,
}

// Verification proof
#[contracttype]
#[derive(Clone, Debug)]
pub struct VerificationProof {
    pub id: u64,
    pub quest_id: u64,
    pub user: Address,
    pub method: VerificationMethod,
    pub proof_hash: Bytes,           // Hash of the proof data
    pub verification_data: String,   // Metadata (company, position, etc.)
    pub timestamp: u64,
    pub status: VerificationStatus,
    pub verifier: Option<Address>,   // Oracle address that verified
}

// Oracle registration
#[contracttype]
#[derive(Clone, Debug)]
pub struct Oracle {
    pub address: Address,
    pub endpoint: String,
    pub reputation: u32,
    pub verifications_count: u64,
    pub is_active: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    QuestContract,
    ProofCounter,
    Proof(u64),
    UserProofs(Address),
    QuestProofs(u64),
    Oracle(Address),
    OracleList,
    ZKVerifier,  // Address of ZK email verifier contract
}

#[contract]
pub struct VerificationContract;

#[contractimpl]
impl VerificationContract {
    
    /// Initialize contract
    pub fn initialize(
        env: Env,
        admin: Address,
        quest_contract: Address,
        zk_verifier: Address
    ) {
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::QuestContract, &quest_contract);
        env.storage().instance().set(&DataKey::ZKVerifier, &zk_verifier);
        env.storage().instance().set(&DataKey::ProofCounter, &0u64);
        env.storage().instance().set(&DataKey::OracleList, &Vec::<Address>::new(&env));
    }
    
    /// Register an oracle
    pub fn register_oracle(
        env: Env,
        oracle_address: Address,
        endpoint: String,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let oracle = Oracle {
            address: oracle_address.clone(),
            endpoint,
            reputation: 100,
            verifications_count: 0,
            is_active: true,
        };
        
        env.storage().persistent().set(&DataKey::Oracle(oracle_address.clone()), &oracle);
        
        let mut oracle_list: Vec<Address> = env.storage()
            .instance()
            .get(&DataKey::OracleList)
            .unwrap_or(Vec::new(&env));
        oracle_list.push_back(oracle_address);
        env.storage().instance().set(&DataKey::OracleList, &oracle_list);
    }
    
    /// Submit verification proof (ZK Email)
    pub fn submit_zk_proof(
        env: Env,
        quest_id: u64,
        user: Address,
        proof_hash: Bytes,
        verification_data: String,
    ) -> u64 {
        user.require_auth();
        
        // Verify the ZK proof (simplified - in production call ZK verifier contract)
        let _zk_verifier: Address = env.storage().instance().get(&DataKey::ZKVerifier).unwrap();
        // let is_valid = Self::verify_zk_proof(&env, &zk_verifier, &proof_hash);
        // assert!(is_valid, "Invalid ZK proof");
        
        let proof_id = Self::create_proof(
            &env,
            quest_id,
            user,
            VerificationMethod::ZKEmail,
            proof_hash,
            verification_data,
            VerificationStatus::Verified,  // Auto-verify ZK proofs
            None,
        );
        
        proof_id
    }
    
    /// Request LinkedIn verification via oracle
    pub fn request_linkedin_verification(
        env: Env,
        quest_id: u64,
        user: Address,
        linkedin_post_url: String,
    ) -> u64 {
        user.require_auth();
        
        // Create pending verification
        let proof_hash = Bytes::new(&env);  // Will be filled by oracle
        let proof_id = Self::create_proof(
            &env,
            quest_id,
            user,
            VerificationMethod::LinkedInOracle,
            proof_hash,
            linkedin_post_url,
            VerificationStatus::Pending,
            None,
        );
        
        proof_id
    }
    
    /// Oracle verifies LinkedIn post
    pub fn verify_linkedin_post(
        env: Env,
        proof_id: u64,
        oracle: Address,
        is_valid: bool,
        proof_data: Bytes,
    ) {
        oracle.require_auth();
        
        // Verify oracle is registered and active
        let mut oracle_info: Oracle = env.storage()
            .persistent()
            .get(&DataKey::Oracle(oracle.clone()))
            .expect("Oracle not registered");
        
        assert!(oracle_info.is_active, "Oracle is not active");
        
        let mut proof: VerificationProof = env.storage()
            .persistent()
            .get(&DataKey::Proof(proof_id))
            .unwrap_or_else(|| panic!("Proof {} not found", proof_id));
        
        assert!(proof.status == VerificationStatus::Pending, "Proof already processed");
        assert!(proof.method == VerificationMethod::LinkedInOracle, "Wrong verification method");
        
        // Update proof
        proof.status = if is_valid {
            VerificationStatus::Verified
        } else {
            VerificationStatus::Rejected
        };
        proof.proof_hash = proof_data;
        proof.verifier = Some(oracle.clone());
        
        env.storage().persistent().set(&DataKey::Proof(proof_id), &proof);
        
        // Update oracle stats
        oracle_info.verifications_count += 1;
        if is_valid {
            oracle_info.reputation += 1;
        }
        env.storage().persistent().set(&DataKey::Oracle(oracle), &oracle_info);
        
        // If verified, can trigger quest activity logging
        if is_valid {
            Self::notify_quest_contract(&env, proof.quest_id, proof.user);
        }
    }
    
    /// Submit manual verification
    pub fn submit_manual_proof(
        env: Env,
        quest_id: u64,
        user: Address,
        proof_hash: Bytes,
        verification_data: String,
    ) -> u64 {
        user.require_auth();
        
        let proof_id = Self::create_proof(
            &env,
            quest_id,
            user,
            VerificationMethod::Manual,
            proof_hash,
            verification_data,
            VerificationStatus::Pending,
            None,
        );
        
        proof_id
    }
    
    /// Admin approves manual proof
    pub fn approve_manual_proof(env: Env, proof_id: u64, approve: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut proof: VerificationProof = env.storage()
            .persistent()
            .get(&DataKey::Proof(proof_id))
            .unwrap_or_else(|| panic!("Proof {} not found", proof_id));
        
        assert!(proof.method == VerificationMethod::Manual, "Not a manual proof");
        assert!(proof.status == VerificationStatus::Pending, "Already processed");
        
        proof.status = if approve {
            VerificationStatus::Verified
        } else {
            VerificationStatus::Rejected
        };
        proof.verifier = Some(admin);
        
        env.storage().persistent().set(&DataKey::Proof(proof_id), &proof);
        
        if approve {
            Self::notify_quest_contract(&env, proof.quest_id, proof.user);
        }
    }
    
    /// Get proof details
    pub fn get_proof(env: Env, proof_id: u64) -> Option<VerificationProof> {
        env.storage()
            .persistent()
            .get(&DataKey::Proof(proof_id))
    }
    
    /// Get user's proofs
    pub fn get_user_proofs(env: Env, user: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::UserProofs(user))
            .unwrap_or(Vec::new(&env))
    }
    
    /// Get quest proofs
    pub fn get_quest_proofs(env: Env, quest_id: u64) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::QuestProofs(quest_id))
            .unwrap_or(Vec::new(&env))
    }
    
    /// Get oracle info
    pub fn get_oracle(env: Env, oracle: Address) -> Oracle {
        env.storage()
            .persistent()
            .get(&DataKey::Oracle(oracle))
            .expect("Oracle not found")
    }
    
    // Helper: Create proof
    fn create_proof(
        env: &Env,
        quest_id: u64,
        user: Address,
        method: VerificationMethod,
        proof_hash: Bytes,
        verification_data: String,
        status: VerificationStatus,
        verifier: Option<Address>,
    ) -> u64 {
        let proof_id: u64 = env.storage().instance().get(&DataKey::ProofCounter).unwrap_or(0);
        let new_proof_id = proof_id + 1;
        env.storage().instance().set(&DataKey::ProofCounter, &new_proof_id);
        
        let proof = VerificationProof {
            id: new_proof_id,
            quest_id,
            user: user.clone(),
            method,
            proof_hash,
            verification_data,
            timestamp: env.ledger().timestamp(),
            status,
            verifier,
        };
        
        env.storage().persistent().set(&DataKey::Proof(new_proof_id), &proof);
        
        // Add to user proofs
        let mut user_proofs: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::UserProofs(user.clone()))
            .unwrap_or(Vec::new(env));
        user_proofs.push_back(new_proof_id);
        env.storage().persistent().set(&DataKey::UserProofs(user), &user_proofs);
        
        // Add to quest proofs
        let mut quest_proofs: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::QuestProofs(quest_id))
            .unwrap_or(Vec::new(env));
        quest_proofs.push_back(new_proof_id);
        env.storage().persistent().set(&DataKey::QuestProofs(quest_id), &quest_proofs);
        
        new_proof_id
    }
    
    // Helper: Notify quest contract of verified activity
    fn notify_quest_contract(env: &Env, _quest_id: u64, _user: Address) {
        // In production, this would call quest_contract.log_activity()
        // For now, this is a placeholder for the integration point
        let _quest_contract: Address = env.storage().instance().get(&DataKey::QuestContract).unwrap();
        // quest_contract_client.log_activity(quest_id, 1, proof_hash);
    }
}