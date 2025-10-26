#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map};

const USERS_KEY: &str = "USERS";

#[contracttype]
#[derive(Clone)]
pub struct Player {
    pub points: u32,
    pub rejections: u32,
    pub connections: u32,
    pub events: u32,
}

impl Player {
    pub fn level(&self) -> u32 {
        (self.points / 100) + 1
    }
}

#[contract]
pub struct JobQuestGame;

#[contractimpl]
impl JobQuestGame {
    /// Register new player
    pub fn register(env: Env, player: Address) -> Player {
        player.require_auth();
        
        let key = soroban_sdk::symbol_short!("USERS");
        let mut users: Map<Address, Player> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Map::new(&env));
        
        if users.contains_key(player.clone()) {
            panic!("Already registered!");
        }
        
        let new_player = Player {
            points: 0,
            rejections: 0,
            connections: 0,
            events: 0,
        };
        
        users.set(player, new_player.clone());
        env.storage().persistent().set(&key, &users);
        
        new_player
    }
    
    /// Log a rejection - earn 10 points!
    pub fn rejection(env: Env, player: Address) -> Player {
        player.require_auth();
        
        let key = soroban_sdk::symbol_short!("USERS");
        let mut users: Map<Address, Player> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap();
        
        let mut stats = users.get(player.clone()).unwrap();
        stats.points += 10;
        stats.rejections += 1;
        
        users.set(player, stats.clone());
        env.storage().persistent().set(&key, &users);
        
        stats
    }
    
    /// Add LinkedIn connections - earn 5 points each!
    pub fn connections(env: Env, player: Address, count: u32) -> Player {
        player.require_auth();
        
        let key = soroban_sdk::symbol_short!("USERS");
        let mut users: Map<Address, Player> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap();
        
        let mut stats = users.get(player.clone()).unwrap();
        stats.points += count * 5;
        stats.connections += count;
        
        users.set(player, stats.clone());
        env.storage().persistent().set(&key, &users);
        
        stats
    }
    
    /// Attended an event - earn 50 points!
    pub fn event(env: Env, player: Address) -> Player {
        player.require_auth();
        
        let key = soroban_sdk::symbol_short!("USERS");
        let mut users: Map<Address, Player> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap();
        
        let mut stats = users.get(player.clone()).unwrap();
        stats.points += 50;
        stats.events += 1;
        
        users.set(player, stats.clone());
        env.storage().persistent().set(&key, &users);
        
        stats
    }
    
    /// Get player stats
    pub fn stats(env: Env, player: Address) -> Player {
        let key = soroban_sdk::symbol_short!("USERS");
        let users: Map<Address, Player> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap();
        
        users.get(player).unwrap()
    }
}
