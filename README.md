# 💪 TryBud

**Commitment staking for job seekers on Stellar blockchain**

Put your money where your hustle is. Stake crypto on your job search goals, hit your targets to earn rewards, or lose your stake to the community pool.

Built for Hack-O-Ween Hackathon @ Harvard/MIT

---

## 🎯 Concept

TryBud uses commitment contracts to help job seekers stay accountable:
1. **Create a Quest** - Set daily targets (applications, networking, etc.)
2. **Stake USDC** - Lock funds in smart contract as commitment
3. **Log Activities** - Prove your progress via blockchain transactions
4. **Earn Rewards** - Complete quest → Get stake + yield + community bonus
5. **NFT Badges** - Collect achievement badges for completed quests


<video width="720" controls>
  <source src="https://raw.githubusercontent.com/kaustubh1504/trybud/main/public/demo.mov" type="video/quicktime">
  Your browser does not support the video tag.
</video>

---

## ✅ What's Implemented (Working Demo)

### Smart Contracts (Deployed on Stellar Testnet)
- ✅ **Quest Contract** - Create quests, log activities, track progress, distribute rewards
- ✅ **Verification Contract** - Support for ZK proofs, LinkedIn oracle, manual verification
- ✅ **Badge NFT Contract** - Mint achievement badges, track collections
- ✅ **Yield Strategy Contract** - Framework for DeFi yield generation

**Contract Addresses (Testnet):**
```
Quest:        CDRND7PWAF6UKEEUQR6KRECAZOERIIYHJ6LV7345YTKQ6EXCULVVAJG6
Verification: CCKAPFUJKTY5EKWJIG5AKWASFOTZCJZUXHJVO73THPUGZNROQXCLP3GJ
Badge:        CBKINLELVYMKLD5GKBA5ANHOUWOAVXEW3AMHX762Z33GY6WLZTAHEYWT
Yield:        CCW6NNSBEGJBS456GR62RWRD7TZ5VZUOVMGKDYAZH6RNDZWI2IEUC4YC
```

### Frontend (React + TypeScript + Stellar SDK)
- ✅ **Landing Page** - Hero, features, how it works
- ✅ **Dashboard** - Real-time quest data from blockchain
- ✅ **Create Quest** - Working smart contract integration
- ✅ **Log Activity** - Blockchain transactions via Freighter wallet
- ✅ **Wallet Integration** - Freighter wallet connection
- ✅ **Protected Routes** - Authentication flow
- ✅ **Animated UI** - BuddyCharacter with level-up animations

### Core Features Working
- ✅ Quest creation with different durations (7, 14, 30, 90 days)
- ✅ Daily activity logging on blockchain
- ✅ Progress tracking with grace days
- ✅ Community pool for redistributing failed stakes
- ✅ Quest status management (Active, Completed, Failed)
- ✅ Real-time data fetching from Stellar testnet

---

## 🚧 Not Yet Implemented (Planned Features)

### Backend Services
- ❌ Email auto-parsing (AI-powered job application confirmation parsing)
- ❌ ZK Email proof generation
- ❌ LinkedIn Oracle service
- ❌ DeFi protocol integration (Stellar DEX, Blend lending)

### Frontend Features
- ❌ Quest detail page with activity logs
- ❌ Badge showcase gallery
- ❌ Leaderboards
- ❌ Social sharing
- ❌ Analytics dashboard
- ❌ Mobile responsive design

### Smart Contract Integration
- ❌ Real USDC transfers (currently mocked for demo)
- ❌ Actual DeFi yield generation (framework exists)
- ❌ Badge minting on quest completion
- ❌ Oracle verification endpoints

---

## 🚀 Quick Start

### Prerequisites
- Node.js v22+
- Rust & Cargo
- Stellar CLI
- Freighter Wallet (browser extension)

### Installation

```bash
# Clone repo
git clone https://github.com/yourusername/trybud.git
cd trybud

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

### Testing Smart Contracts

```bash
# Build contracts
cd contracts/quest && stellar contract build && cd ../..

# Deploy to testnet
stellar contract deploy --wasm target/wasm32v1-none/release/quest_contract.wasm --source alice --network testnet

# Initialize contract
stellar contract invoke --id <CONTRACT_ID> --source alice --network testnet \
  -- initialize \
  --admin <YOUR_ADDRESS> \
  --token CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA
```

---

## 🎮 How to Demo

1. **Connect Wallet** - Use Freighter on Testnet
2. **Create Quest**:
   - Select "Job Applications"
   - Daily Target: 5 activities
   - Duration: 7 days
   - Creates real blockchain transaction
3. **View Dashboard** - See your active quest from blockchain
4. **Log Activity** - Click "Log Activity" → Signs transaction → Updates on-chain
5. **Mock Points** - Click "⭐ +100 Pts" to demo character leveling

---

## 🏗️ Architecture

### Smart Contracts (Rust + Soroban)
```
Quest Contract
├─ create_quest() - Lock stake, create commitment
├─ log_activity() - Record daily progress
├─ complete_quest() - Distribute rewards/penalties
└─ get_quest() - Fetch quest data

Verification Contract
├─ submit_zk_proof() - ZK email verification
├─ verify_linkedin_post() - Oracle verification
└─ approve_manual_proof() - Admin approval

Badge Contract
├─ mint_quest_badge() - Award NFTs
└─ get_badge_collection() - User's badges

Yield Contract
├─ deposit() - Invest stakes in DeFi
└─ withdraw() - Return stake + yield
```

### Frontend (React + Vite)
```
src/
├── components/
│   ├── game/BuddyCharacter.tsx - Animated character
│   └── ProtectedRoute.tsx - Auth wrapper
├── contracts/
│   └── dist/ - Auto-generated TypeScript bindings
├── pages/
│   ├── Landing.tsx - Hero page
│   ├── Dashboard.tsx - Quest overview (blockchain data)
│   └── CreateQuest.tsx - Quest creation (smart contract call)
└── hooks/
    └── useWallet.ts - Freighter integration
```

---

## 🔧 Tech Stack

**Blockchain:**
- Stellar Soroban (Smart contracts)
- Rust (Contract language)
- Stellar SDK (TypeScript bindings)

**Frontend:**
- React + TypeScript
- Vite (Build tool)
- Framer Motion (Animations)
- Freighter Wallet Kit

**Infrastructure:**
- Stellar Testnet (Deployment)
- Vercel (Frontend hosting)

---

## 📊 Key Metrics

**Smart Contract Performance:**
- Transaction Fee: **$0.001** (vs $15+ on Ethereum)
- Quest Creation: **~5 seconds**
- Activity Logging: **~3 seconds**
- Contract Size: All under 64KB

**Demo Stats:**
- 4 Smart Contracts Deployed ✅
- 3 Working Pages ✅
- Real Blockchain Integration ✅
- Sub-second Transactions ✅

---

## 🎯 Hackathon Focus

Built MVP in 24 hours focusing on:
1. ✅ Core smart contract logic (commitment staking)
2. ✅ Working frontend with real blockchain calls
3. ✅ Beautiful UI with animations
4. ✅ End-to-end demo flow

**Trade-offs Made:**
- Mocked USDC transfers (no trustline setup for testnet)
- DeFi yield framework only (not connected to live protocols)
- Verification contracts deployed but services not built
- Focus on core loop over peripheral features

---

## 🚀 Future Roadmap

### Phase 1 (Post-Hackathon)
- Enable real USDC transfers
- Integrate with Stellar DeFi (Blend, StellarX)
- Build email parsing backend
- Complete badge minting flow

### Phase 2
- ZK Email proof service
- LinkedIn Oracle verification
- Mobile app (React Native)
- Leaderboards & social features

### Phase 3
- Multi-chain support
- Enterprise partnerships
- AI coaching assistant
- Browser extension

---

## 🏆 Why Stellar?

- **Low Fees**: $0.001 per transaction (makes micro-stakes viable)
- **Fast**: 3-5 second finality
- **Built-in DeFi**: Native DEX, lending protocols
- **Path Payments**: Optimized yield routing
- **Developer-Friendly**: Soroban SDK, excellent docs

---

## 📝 License

Apache License 2.0

---

## 🙏 Acknowledgments

- Stellar Foundation for Soroban
- Scaffold Stellar for dev toolkit
- Hack-O-Ween organizers
- Freighter Wallet team

---

## 🔗 Links

- **Demo**: [Coming soon - Vercel deployment]
- **Contracts**: [Stellar Expert - Testnet]
- **GitHub**: [Your repo URL]

---

**Built with 💪 on Stellar**
