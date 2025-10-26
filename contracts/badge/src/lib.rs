// contracts/badge/src/lib.rs
#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Vec
};

// Badge tiers
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BadgeTier {
    Bronze,    // 7-day quest
    Silver,    // 14-day quest
    Gold,      // 30-day quest
    Platinum,  // 90-day quest
}

// Achievement types
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AchievementType {
    QuestCompletion(BadgeTier),
    PerfectAttendance,       // 0 missed days
    Overachiever,            // Exceeded target every day
    SpeedDemon,              // Logged before noon every day
    Streak10,                // 10-day streak
    Streak30,                // 30-day streak
    Applications100,         // 100 total applications
    MultiQuest5,            // 5 quests completed
}

// Badge metadata
#[contracttype]
#[derive(Clone, Debug)]
pub struct Badge {
    pub id: u64,
    pub owner: Address,
    pub achievement_type: AchievementType,
    pub quest_id: Option<u64>,
    pub minted_at: u64,
    pub metadata_uri: String,
    pub rarity_score: u32,
}

// User badge collection
#[contracttype]
#[derive(Clone, Debug)]
pub struct BadgeCollection {
    pub owner: Address,
    pub badges: Vec<u64>,
    pub total_score: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    QuestContract,
    BadgeCounter,
    Badge(u64),
    UserBadges(Address),
    BadgeOwner(u64),
    AchievementBadge(Address, AchievementType), // Check if user has specific achievement
}

#[contract]
pub struct BadgeContract;

#[contractimpl]
impl BadgeContract {
    
    /// Initialize contract
    pub fn initialize(env: Env, admin: Address, quest_contract: Address) {
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::QuestContract, &quest_contract);
        env.storage().instance().set(&DataKey::BadgeCounter, &0u64);
    }
    
    /// Mint quest completion badge
    pub fn mint_quest_badge(
        env: Env,
        owner: Address,
        quest_id: u64,
        duration_days: u32,
        is_perfect: bool,
        is_overachiever: bool,
    ) -> Vec<u64> {
        // For testing: allow admin to mint badges
        // In production, only quest contract should call this
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut minted_badges = Vec::new(&env);
        
        // Determine tier based on duration
        let tier = match duration_days {
            7 => BadgeTier::Bronze,
            14 => BadgeTier::Silver,
            30 => BadgeTier::Gold,
            90 => BadgeTier::Platinum,
            _ => panic!("Invalid duration"),
        };
        
        // Mint base quest completion badge
        let achievement = AchievementType::QuestCompletion(tier);
        let badge_id = Self::mint_badge(
            &env,
            owner.clone(),
            achievement,
            Some(quest_id),
            Self::get_metadata_uri(&env, &AchievementType::QuestCompletion(BadgeTier::Bronze)),
            Self::calculate_rarity(duration_days, false, false),
        );
        minted_badges.push_back(badge_id);
        
        // Mint perfect attendance badge if applicable
        if is_perfect {
            let perfect_badge = Self::mint_badge(
                &env,
                owner.clone(),
                AchievementType::PerfectAttendance,
                Some(quest_id),
                Self::get_metadata_uri(&env, &AchievementType::PerfectAttendance),
                50,
            );
            minted_badges.push_back(perfect_badge);
        }
        
        // Mint overachiever badge if applicable
        if is_overachiever {
            let over_badge = Self::mint_badge(
                &env,
                owner.clone(),
                AchievementType::Overachiever,
                Some(quest_id),
                Self::get_metadata_uri(&env, &AchievementType::Overachiever),
                40,
            );
            minted_badges.push_back(over_badge);
        }
        
        // Check for milestone achievements
        Self::check_and_mint_milestones(&env, owner.clone(), &mut minted_badges);
        
        minted_badges
    }
    
    /// Mint streak achievement badge
    pub fn mint_streak_badge(env: Env, owner: Address, streak_days: u32) -> u64 {
        // For testing: allow admin to mint badges
        // In production, only quest contract should call this
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let achievement = if streak_days >= 30 {
            AchievementType::Streak30
        } else {
            AchievementType::Streak10
        };
        
        // Check if already has this achievement
        if Self::has_achievement(env.clone(), owner.clone(), achievement.clone()) {
            panic!("Already has this achievement");
        }
        
        Self::mint_badge(
            &env,
            owner,
            achievement.clone(),
            None,
            Self::get_metadata_uri(&env, &achievement),
            streak_days,
        )
    }
    
    /// Get badge details
    pub fn get_badge(env: Env, badge_id: u64) -> Option<Badge> {
        env.storage()
            .persistent()
            .get(&DataKey::Badge(badge_id))
    }
    
    /// Get user's badges
    pub fn get_user_badges(env: Env, user: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::UserBadges(user))
            .unwrap_or(Vec::new(&env))
    }
    
    /// Get badge collection with stats
    pub fn get_badge_collection(env: Env, user: Address) -> BadgeCollection {
        let badge_ids: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::UserBadges(user.clone()))
            .unwrap_or(Vec::new(&env));
        
        let mut total_score = 0u32;
        for i in 0..badge_ids.len() {
            let badge_id = badge_ids.get(i).unwrap();
            if let Some(badge) = env.storage().persistent().get::<DataKey, Badge>(&DataKey::Badge(badge_id)) {
                total_score += badge.rarity_score;
            }
        }
        
        BadgeCollection {
            owner: user,
            badges: badge_ids,
            total_score,
        }
    }
    
    /// Check if user has specific achievement
    pub fn has_achievement(env: Env, user: Address, achievement: AchievementType) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::AchievementBadge(user, achievement))
            .unwrap_or(false)
    }
    
    /// Transfer badge (optional - makes it tradeable)
    pub fn transfer(env: Env, badge_id: u64, from: Address, to: Address) {
        from.require_auth();
        
        let mut badge: Badge = env.storage()
            .persistent()
            .get(&DataKey::Badge(badge_id))
            .unwrap_or_else(|| panic!("Badge {} not found", badge_id));
        
        assert!(badge.owner == from, "Not the owner");
        
        // Update badge owner
        badge.owner = to.clone();
        env.storage().persistent().set(&DataKey::Badge(badge_id), &badge);
        env.storage().persistent().set(&DataKey::BadgeOwner(badge_id), &to);
        
        // Update user collections
        let from_badges: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::UserBadges(from.clone()))
            .unwrap_or(Vec::new(&env));
        
        // Remove from sender
        let mut new_from_badges = Vec::new(&env);
        for i in 0..from_badges.len() {
            let id = from_badges.get(i).unwrap();
            if id != badge_id {
                new_from_badges.push_back(id);
            }
        }
        env.storage().persistent().set(&DataKey::UserBadges(from), &new_from_badges);
        
        // Add to receiver
        let mut to_badges: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::UserBadges(to.clone()))
            .unwrap_or(Vec::new(&env));
        to_badges.push_back(badge_id);
        env.storage().persistent().set(&DataKey::UserBadges(to), &to_badges);
    }
    
    // Helper: Mint a badge
    fn mint_badge(
        env: &Env,
        owner: Address,
        achievement_type: AchievementType,
        quest_id: Option<u64>,
        metadata_uri: String,
        rarity_score: u32,
    ) -> u64 {
        let badge_id: u64 = env.storage().instance().get(&DataKey::BadgeCounter).unwrap_or(0);
        let new_badge_id = badge_id + 1;
        env.storage().instance().set(&DataKey::BadgeCounter, &new_badge_id);
        
        let badge = Badge {
            id: new_badge_id,
            owner: owner.clone(),
            achievement_type: achievement_type.clone(),
            quest_id,
            minted_at: env.ledger().timestamp(),
            metadata_uri,
            rarity_score,
        };
        
        env.storage().persistent().set(&DataKey::Badge(new_badge_id), &badge);
        env.storage().persistent().set(&DataKey::BadgeOwner(new_badge_id), &owner);
        
        // Track achievement
        env.storage().persistent().set(
            &DataKey::AchievementBadge(owner.clone(), achievement_type),
            &true
        );
        
        // Add to user's collection
        let mut user_badges: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::UserBadges(owner.clone()))
            .unwrap_or(Vec::new(env));
        user_badges.push_back(new_badge_id);
        env.storage().persistent().set(&DataKey::UserBadges(owner), &user_badges);
        
        new_badge_id
    }
    
    // Helper: Check and mint milestone achievements
    fn check_and_mint_milestones(env: &Env, owner: Address, minted_badges: &mut Vec<u64>) {
        let user_badges: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::UserBadges(owner.clone()))
            .unwrap_or(Vec::new(env));
        
        let badge_count = user_badges.len();
        
        // 5 quests milestone
        if badge_count >= 5 && !Self::has_achievement(env.clone(), owner.clone(), AchievementType::MultiQuest5) {
            let milestone_badge = Self::mint_badge(
                env,
                owner.clone(),
                AchievementType::MultiQuest5,
                None,
                Self::get_metadata_uri(env, &AchievementType::MultiQuest5),
                75,
            );
            minted_badges.push_back(milestone_badge);
        }
    }
    
    // Helper: Calculate rarity score
    fn calculate_rarity(duration: u32, perfect: bool, overachiever: bool) -> u32 {
        let mut score = duration; // Base score from duration
        if perfect {
            score += 20;
        }
        if overachiever {
            score += 15;
        }
        score
    }
    
    // Helper: Get metadata URI
    fn get_metadata_uri(env: &Env, _achievement: &AchievementType) -> String {
        // In production, this would point to IPFS or hosted metadata
        String::from_str(env, "ipfs://badges/")
    }
}