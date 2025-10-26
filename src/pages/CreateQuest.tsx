// src/pages/CreateQuest.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { Client } from "../contracts/dist";

const CreateQuest = () => {
  const navigate = useNavigate();
  const { address, signTransaction } = useWallet();
  const [selectedType, setSelectedType] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(5);
  const [duration, setDuration] = useState(7);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!address || !signTransaction) return;
    
    setIsCreating(true);
    try {
      const client = new Client({
        contractId: "CDRND7PWAF6UKEEUQR6KRECAZOERIIYHJ6LV7345YTKQ6EXCULVVAJG6",
        networkPassphrase: "Test SDF Network ; September 2015",
        rpcUrl: "https://soroban-testnet.stellar.org",
        publicKey: address,
        signTransaction,
      });
      
      const questTypeEnum = {
        tag: ["JobApplications", "InterviewPrep", "Networking", "SkillBuilding"][selectedType],
        values: undefined
      };
      
      const tx = await client.create_quest({
        user: address,
        quest_type: questTypeEnum,
        daily_target: dailyTarget,
        duration_days: duration,
        grace_days: 1,
      });
      
      const sent = await tx.signAndSend();
      alert(`Quest #${sent.result} created! ✅`);
      
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0E27, #1A1F3A)', color: 'white', padding: '40px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: 'none', border: 'none', color: '#00D9FF', fontSize: '16px', cursor: 'pointer', marginBottom: '20px' }}>
          ← Back
        </button>
        
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '30px' }}>Create Quest 🎯</h1>
        
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '16px', marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>Quest Type</label>
          <select value={selectedType} onChange={(e) => setSelectedType(Number(e.target.value))} style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
            <option value={0}>💼 Job Applications</option>
            <option value={1}>🎤 Interview Prep</option>
            <option value={2}>🤝 Networking</option>
            <option value={3}>📚 Skill Building</option>
          </select>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '16px', marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>
            Daily Target: <span style={{ color: '#00D9FF' }}>{dailyTarget}</span>
          </label>
          <input type="range" min="1" max="10" value={dailyTarget} onChange={(e) => setDailyTarget(Number(e.target.value))} style={{ width: '100%', accentColor: '#00D9FF' }} />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>Duration</label>
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
            <option value={7}>🥉 7 days - $10 stake</option>
            <option value={14}>🥈 14 days - $20 stake</option>
            <option value={30}>🥇 30 days - $50 stake</option>
            <option value={90}>💎 90 days - $100 stake</option>
          </select>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Stake Amount</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            ${[10, 20, 50, 100][[7, 14, 30, 90].indexOf(duration)]} USDC
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={isCreating}
          style={{
            width: '100%',
            padding: '18px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: isCreating ? '#666' : 'linear-gradient(135deg, #00FF94, #00D9FF)',
            color: '#0A0E27',
            border: 'none',
            borderRadius: '12px',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            boxShadow: '0 5px 20px rgba(0, 255, 148, 0.4)'
          }}
        >
          {isCreating ? '⏳ Creating Quest...' : '🚀 Create Quest'}
        </button>
      </div>
    </div>
  );
};

export default CreateQuest;