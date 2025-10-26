// contracts/quest/src/lib.rs
#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Vec, symbol_short
};

// Quest types
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum QuestType {
    JobApplications,
    InterviewPrep,
    Networking,
    SkillBuilding,
}

// Quest status
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum QuestStatus {
    Active,
    Completed,
    Failed,
    Cancelled,
}

// Quest structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct Quest {
    pub id: u64,
    pub user: Address,
    pub quest_type: QuestType,
    pub daily_target: u32,
    pub duration_days: u32,
    pub stake_amount: i128,
    pub grace_days: u32,
    pub start_time: u64,
    pub end_time: u64,
    pub status: QuestStatus,
    pub days_completed: u32,
    pub grace_days_used: u32,
    pub yield_accrued: i128,
}

// Daily log entry
#[contracttype]
#[derive(Clone, Debug)]
pub struct DailyLog {
    pub quest_id: u64,
    pub day: u32,
    pub activities_logged: u32,
    pub timestamp: u64,
    pub verification_hash: String, // For ZK proofs
}

#[contracttype]
pub enum DataKey {
    QuestCounter,
    Quest(u64),
    UserQuests(Address),
    DailyLog(u64, u32), // (quest_id, day)
    CommunityPool,
    YieldPool,
    TokenAddress,
    Admin,
}

#[contract]
pub struct QuestContract;

#[contractimpl]
impl QuestContract {
    
    /// Initialize contract with USDC token address and admin
    pub fn initialize(env: Env, admin: Address, token: Address) {
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenAddress, &token);
        env.storage().instance().set(&DataKey::QuestCounter, &0u64);
        env.storage().instance().set(&DataKey::CommunityPool, &0i128);
        env.storage().instance().set(&DataKey::YieldPool, &0i128);
    }
    
    /// Create a new quest
    pub fn create_quest(
        env: Env,
        user: Address,
        quest_type: QuestType,
        daily_target: u32,
        duration_days: u32,
        grace_days: u32,
    ) -> u64 {
        user.require_auth();
        
        // Validate inputs
        assert!(daily_target >= 1 && daily_target <= 10, "Invalid daily target");
        assert!(
            duration_days == 7 || duration_days == 14 || duration_days == 30 || duration_days == 90,
            "Invalid duration"
        );
        assert!(grace_days <= 3, "Max 3 grace days allowed");
        
        // Calculate stake amount (increases with duration)
        let stake_amount = Self::calculate_stake(duration_days);
        
        // Transfer stake from user to contract
        // NOTE: For testing without real USDC, this is commented out
        // Uncomment for production with real tokens
        // let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
        // let token_client = token::Client::new(&env, &token_address);
        // token_client.transfer(&user, &env.current_contract_address(), &stake_amount);
        
        // Increment quest counter
        let quest_id: u64 = env.storage().instance().get(&DataKey::QuestCounter).unwrap_or(0);
        let new_quest_id = quest_id + 1;
        env.storage().instance().set(&DataKey::QuestCounter, &new_quest_id);
        
        // Create quest
        let current_time = env.ledger().timestamp();
        let end_time = current_time + (duration_days as u64 * 86400);
        
        let quest = Quest {
            id: new_quest_id,
            user: user.clone(),
            quest_type,
            daily_target,
            duration_days,
            stake_amount,
            grace_days,
            start_time: current_time,
            end_time,
            status: QuestStatus::Active,
            days_completed: 0,
            grace_days_used: 0,
            yield_accrued: 0,
        };
        
        // Store quest
        env.storage().persistent().set(&DataKey::Quest(new_quest_id), &quest);
        
        // Add to user's quest list
        let mut user_quests: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::UserQuests(user.clone()))
            .unwrap_or(Vec::new(&env));
        user_quests.push_back(new_quest_id);
        env.storage().persistent().set(&DataKey::UserQuests(user), &user_quests);
        
        // Move stake to yield pool for yield generation
        let mut yield_pool: i128 = env.storage().instance().get(&DataKey::YieldPool).unwrap_or(0);
        yield_pool += stake_amount;
        env.storage().instance().set(&DataKey::YieldPool, &yield_pool);
        
        new_quest_id
    }
    
    /// Log daily activity (manual or via oracle)
    pub fn log_activity(
        env: Env,
        quest_id: u64,
        activities_count: u32,
        verification_hash: String,
    ) -> bool {
        let mut quest: Quest = env.storage()
            .persistent()
            .get(&DataKey::Quest(quest_id))
            .expect("Quest not found");
        
        quest.user.require_auth();
        
        assert!(quest.status == QuestStatus::Active, "Quest not active");
        
        let current_time = env.ledger().timestamp();
        let days_elapsed = ((current_time - quest.start_time) / 86400) as u32;
        
        assert!(days_elapsed < quest.duration_days, "Quest expired");
        
        // Check if already logged today
        let log_key = DataKey::DailyLog(quest_id, days_elapsed);
        if env.storage().persistent().has(&log_key) {
            panic!("Already logged for today");
        }
        
        // Create daily log
        let log = DailyLog {
            quest_id,
            day: days_elapsed,
            activities_logged: activities_count,
            timestamp: current_time,
            verification_hash,
        };
        
        env.storage().persistent().set(&log_key, &log);
        
        // Update quest progress
        if activities_count >= quest.daily_target {
            quest.days_completed += 1;
        }
        
        env.storage().persistent().set(&DataKey::Quest(quest_id), &quest);
        
        activities_count >= quest.daily_target
    }
    
    /// Complete quest and distribute rewards
    pub fn complete_quest(env: Env, quest_id: u64) {
        let mut quest: Quest = env.storage()
            .persistent()
            .get(&DataKey::Quest(quest_id))
            .expect("Quest not found");
        
        assert!(quest.status == QuestStatus::Active, "Quest not active");
        
        let current_time = env.ledger().timestamp();
        assert!(current_time >= quest.end_time, "Quest not finished yet");
        
        // Calculate missed days
        let total_required = quest.duration_days;
        let missed_days = total_required - quest.days_completed;
        
        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        
        // Check if quest succeeded
        if missed_days <= quest.grace_days {
            // SUCCESS: Return stake + yield + bonus from community pool
            quest.status = QuestStatus::Completed;
            
            // Calculate yield share (proportional to stake and duration)
            let yield_share = Self::calculate_yield_share(&env, &quest);
            quest.yield_accrued = yield_share;
            
            // Calculate bonus from community pool (share of failed stakes)
            let community_pool: i128 = env.storage().instance().get(&DataKey::CommunityPool).unwrap_or(0);
            let bonus = if community_pool > 0 {
                // Get 1% of community pool per completed quest
                community_pool / 100
            } else {
                0
            };
            
            let total_reward = quest.stake_amount + yield_share + bonus;
            
            // Update pools
            let mut yield_pool: i128 = env.storage().instance().get(&DataKey::YieldPool).unwrap_or(0);
            yield_pool -= quest.stake_amount + yield_share;
            env.storage().instance().set(&DataKey::YieldPool, &yield_pool);
            
            if bonus > 0 {
                let new_community_pool = community_pool - bonus;
                env.storage().instance().set(&DataKey::CommunityPool, &new_community_pool);
            }
            
            // Transfer rewards (commented for testing)
            // token_client.transfer(&env.current_contract_address(), &quest.user, &total_reward);
            
        } else {
            // FAILED: Stake goes to community pool
            quest.status = QuestStatus::Failed;
            
            let mut yield_pool: i128 = env.storage().instance().get(&DataKey::YieldPool).unwrap_or(0);
            yield_pool -= quest.stake_amount;
            env.storage().instance().set(&DataKey::YieldPool, &yield_pool);
            
            let mut community_pool: i128 = env.storage().instance().get(&DataKey::CommunityPool).unwrap_or(0);
            community_pool += quest.stake_amount;
            env.storage().instance().set(&DataKey::CommunityPool, &community_pool);
        }
        
        env.storage().persistent().set(&DataKey::Quest(quest_id), &quest);
    }
    
    /// Get quest details
    pub fn get_quest(env: Env, quest_id: u64) -> Quest {
        env.storage()
            .persistent()
            .get(&DataKey::Quest(quest_id))
            .expect("Quest not found")
    }
    
    /// Get user's quests
    pub fn get_user_quests(env: Env, user: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::UserQuests(user))
            .unwrap_or(Vec::new(&env))
    }
    
    /// Get daily log
    pub fn get_daily_log(env: Env, quest_id: u64, day: u32) -> Option<DailyLog> {
        env.storage()
            .persistent()
            .get(&DataKey::DailyLog(quest_id, day))
    }
    
    /// Get community pool stats
    pub fn get_pool_stats(env: Env) -> (i128, i128) {
        let community_pool: i128 = env.storage().instance().get(&DataKey::CommunityPool).unwrap_or(0);
        let yield_pool: i128 = env.storage().instance().get(&DataKey::YieldPool).unwrap_or(0);
        (community_pool, yield_pool)
    }
    
    // Helper: Calculate stake amount based on duration
    fn calculate_stake(duration_days: u32) -> i128 {
        match duration_days {
            7 => 10_000_000,   // $10 USDC (7 decimals)
            14 => 20_000_000,  // $20 USDC
            30 => 50_000_000,  // $50 USDC
            90 => 100_000_000, // $100 USDC
            _ => panic!("Invalid duration"),
        }
    }
    
    // Helper: Calculate yield share (simplified - in production integrate with DeFi protocol)
    fn calculate_yield_share(env: &Env, quest: &Quest) -> i128 {
        let yield_pool: i128 = env.storage().instance().get(&DataKey::YieldPool).unwrap_or(0);
        
        // Simple yield calculation: 5% APY prorated for quest duration
        // In production, this would query actual DeFi protocol returns
        let annual_rate = 5; // 5% APY
        let daily_rate = annual_rate * 100 / 365; // Basis points per day
        let days = quest.duration_days as i128;
        
        (quest.stake_amount * daily_rate * days) / 10000
    }
}