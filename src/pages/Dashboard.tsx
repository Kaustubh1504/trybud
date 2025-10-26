// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BuddyCharacter from '../components/BuddyCharacter';
import { useWallet } from '../hooks/useWallet';
import { Client } from '../contracts/dist';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { address, signTransaction } = useWallet();
  
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingActivity, setLoggingActivity] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<any[]>([]);
  const [mockPoints, setMockPoints] = useState(0);
  const [totalStaked] = useState(200);
  const [yieldEarned, setYieldEarned] = useState(0);

  const points = quests.reduce((sum, q) => sum + (q.days_completed * 50), 0) + mockPoints;
  const activityCount = quests.reduce((sum, q) => sum + q.days_completed, 0);
  const nextLevelScore = 3500;
  const progressPercent = (points / nextLevelScore) * 100;
  const pointsToGo = nextLevelScore - points;

  const loadQuests = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const client = new Client({
        contractId: "CDRND7PWAF6UKEEUQR6KRECAZOERIIYHJ6LV7345YTKQ6EXCULVVAJG6",
        networkPassphrase: "Test SDF Network ; September 2015",
        rpcUrl: "https://soroban-testnet.stellar.org",
        publicKey: address,
      });
      
      const ids = await client.get_user_quests({ user: address });
      const questDetails = await Promise.all(
        ids.result.map(async (id: any) => {
          try {
            const questTx = await client.get_quest({ quest_id: id });
            return questTx.result;
          } catch {
            return null;
          }
        })
      );
      
      const active = questDetails.filter(q => q && (q.status?.tag === "Active" || q.status === 0));
      setQuests(active);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuests();
  }, [address]);

  const handleLogActivity = async (questId: any) => {
    if (!address || !signTransaction) return;
    setLoggingActivity(questId);
    try {
      const client = new Client({
        contractId: "CDRND7PWAF6UKEEUQR6KRECAZOERIIYHJ6LV7345YTKQ6EXCULVVAJG6",
        networkPassphrase: "Test SDF Network ; September 2015",
        rpcUrl: "https://soroban-testnet.stellar.org",
        publicKey: address,
        signTransaction,
      });
      
      const proofHash = "proof_" + Date.now();
      const tx = await client.log_activity({
        quest_id: questId,
        activities_count: 5,
        verification_hash: proofHash
      });
      
      await tx.signAndSend();
      const coords = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      triggerSuccessAnimation(50, coords);
      await loadQuests();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoggingActivity(null);
    }
  };

  const handleMockPoints = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMockPoints(p => p + 100);
    setYieldEarned(y => y + 1);
    const rect = e.currentTarget.getBoundingClientRect();
    const coords = { x: rect.left + rect.width / 2, y: rect.top };
    triggerSuccessAnimation(100, coords);
  };

  const triggerSuccessAnimation = (pointsValue: number, clickCoords: { x: number; y: number }) => {
    const newFloatingPoint = {
      id: Date.now(),
      points: pointsValue,
      x: clickCoords.x,
      y: clickCoords.y
    };

    setFloatingPoints(prev => [...prev, newFloatingPoint]);
    setTimeout(() => {
      setFloatingPoints(prev => prev.filter(p => p.id !== newFloatingPoint.id));
    }, 2000);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const formattedActivities = quests.flatMap(q => 
    Array.from({ length: q.days_completed }, (_, i) => ({
      id: q.id.toString() + "-day" + i,
      points: 50,
      time: new Date(Date.now() - i * 86400000).toLocaleDateString(),
      color: '#00D9FF',
    }))
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0E27', color: 'white' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <div style={{ fontSize: '64px' }}>⏳</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0E27', color: 'white', padding: '20px', fontFamily: "'Poppins', sans-serif", position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0, 217, 255, 0.15), transparent)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255, 0, 110, 0.15), transparent)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}></div>
      
      <AnimatePresence>
        {showConfetti && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
            {[...Array(80)].map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ x: window.innerWidth / 2, y: window.innerHeight / 2, rotate: 0, opacity: 1 }} 
                animate={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 100, rotate: Math.random() * 720, opacity: 0 }} 
                transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }} 
                style={{ position: 'absolute', width: '8px', height: '8px', background: ['#00D9FF', '#FF006E', '#BB00FF', '#00FF94', '#FFD700'][Math.floor(Math.random() * 5)], borderRadius: '50%' }} 
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {floatingPoints.map(point => (
        <motion.div 
          key={point.id} 
          initial={{ x: point.x, y: point.y, opacity: 1, scale: 1 }} 
          animate={{ y: point.y - 150, opacity: 0, scale: 1.5 }} 
          transition={{ duration: 1.5 }} 
          style={{ position: 'fixed', color: '#FFD700', fontSize: '24px', fontWeight: 'bold', pointerEvents: 'none', zIndex: 9998, textShadow: '0 0 10px #FFD700' }}
        >
          +{point.points} pts 🎉
        </motion.div>
      ))}

      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #FF006E, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Welcome Back! 👋</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '8px 0 0 0' }}>Turn rejections into victories</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button onClick={handleMockPoints} whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.98 }} style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#0A0E27', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '50px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 5px 20px rgba(255, 215, 0, 0.4)' }}>
              ⭐ +100 Pts
            </motion.button>
            <motion.button onClick={() => navigate('/quest/create')} whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.98 }} style={{ background: 'linear-gradient(135deg, #00FF94, #00D9FF)', color: '#0A0E27', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '50px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 5px 20px rgba(0, 255, 148, 0.4)' }}>
              ⚡ Create Quest
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr 380px', gap: '20px', height: 'calc(100vh - 250px)', position: 'relative', zIndex: 1 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(26, 31, 58, 0.9)', padding: '20px', borderRadius: '16px', border: '2px solid rgba(255, 215, 0, 0.4)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '36px' }}>⭐</div>
              <motion.div key={points} initial={{ scale: 1.3 }} animate={{ scale: 1 }} style={{ fontSize: '28px', fontWeight: 700, color: '#FFD700', margin: '8px 0 4px' }}>
                {points.toLocaleString()}
              </motion.div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Points</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(26, 31, 58, 0.9)', padding: '20px', borderRadius: '16px', border: '2px solid rgba(0, 217, 255, 0.4)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '36px' }}>🎯</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#00D9FF', margin: '8px 0 4px' }}>{activityCount}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Activities</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(26, 31, 58, 0.9)', padding: '20px', borderRadius: '16px', border: '2px solid rgba(255, 0, 110, 0.4)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '36px' }}>💰</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#00FF94', margin: '8px 0 4px' }}>${totalStaked}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Staked</div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(26, 31, 58, 0.9)', padding: '20px', borderRadius: '16px', border: '2px solid rgba(0, 255, 148, 0.4)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '36px' }}>📈</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#00FF94', margin: '8px 0 4px' }}>${yieldEarned.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Yield</div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={{ background: 'rgba(26, 31, 58, 0.9)', borderRadius: '16px', border: '2px solid rgba(0, 217, 255, 0.3)', padding: '20px', flex: 1, backdropFilter: 'blur(10px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', background: 'linear-gradient(135deg, #00D9FF, #BB00FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📊 Recent Activity</h2>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {formattedActivities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>No activity yet</div>
              ) : (
                formattedActivities.slice(0, 10).reverse().map((activity: any, index: number) => (
                  <motion.div 
                    key={activity.id} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.05 * index }} 
                    whileHover={{ x: 5 }} 
                    style={{ padding: '12px', borderLeft: '3px solid #00D9FF', marginBottom: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>🎯 Activity Logged</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{activity.time}</div>
                      </div>
                      <div style={{ color: '#00D9FF', fontWeight: 700, fontSize: '14px' }}>+{activity.points}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <BuddyCharacter points={points} size="large" />
          </motion.div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ background: 'rgba(26, 31, 58, 0.9)', borderRadius: '16px', border: '2px solid rgba(255, 0, 110, 0.3)', padding: '20px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', background: 'linear-gradient(135deg, #FF006E, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚡ Your Quests</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {quests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
                  <p>No active quests</p>
                </div>
              ) : (
                quests.map((q: any) => (
                  <motion.div key={q.id.toString()} whileHover={{ scale: 1.02, y: -2 }} style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 0, 110, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>Quest #{q.id.toString()}</div>
                      <div style={{ fontSize: '12px', background: '#00FF94', color: '#0A0E27', padding: '4px 10px', borderRadius: '10px', fontWeight: 700 }}>
                        ${(Number(q.stake_amount) / 10000000).toFixed(0)}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>{q.quest_type?.tag || "Job Applications"}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                      {q.days_completed}/{q.duration_days} days • {q.daily_target}/day
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      onClick={() => handleLogActivity(q.id)} 
                      disabled={loggingActivity === q.id} 
                      style={{ width: '100%', padding: '10px', background: loggingActivity === q.id ? '#666' : 'linear-gradient(135deg, #FF006E, #FF6B35)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: loggingActivity === q.id ? 'not-allowed' : 'pointer' }}
                    >
                      {loggingActivity === q.id ? '⏳ Logging...' : '📝 Log Activity'}
                    </motion.button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={{ background: 'rgba(26, 31, 58, 0.9)', borderRadius: '16px', border: '2px solid rgba(187, 0, 255, 0.3)', padding: '20px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', background: 'linear-gradient(135deg, #BB00FF, #FF006E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🎮 Daily Quest</h2>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px' }}>
              <div style={{ background: 'linear-gradient(135deg, #FF006E, #BB00FF)', padding: '6px 14px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 700, marginBottom: '12px', display: 'inline-block' }}>🔥 DAY 7</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Network Ninja</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Connect with 10 people on LinkedIn</p>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '10px', marginBottom: '8px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1, delay: 0.5 }} style={{ background: 'linear-gradient(90deg, #00D9FF, #00FF94)', height: '100%', borderRadius: '8px' }}></motion.div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>6 / 10</span>
                <span style={{ color: '#FFD700', fontWeight: 700 }}>+200 🏅</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: '20px', background: 'rgba(26, 31, 58, 0.9)', padding: '20px', borderRadius: '16px', border: '2px solid rgba(0, 217, 255, 0.3)', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Next: Business Pro</span>
          <span style={{ fontWeight: 700 }}>{points} / {nextLevelScore}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '20px', position: 'relative', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ background: 'linear-gradient(90deg, #00D9FF, #FF006E)', height: '100%', borderRadius: '10px', position: 'relative' }}>
            <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}></motion.div>
          </motion.div>
        </div>
        <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
          {pointsToGo > 0 ? `${pointsToGo} pts to go! 💪` : "Level Up! 🎉"}
        </div>
      </motion.div>

      <style>{`
        .screen-shake {
          animation: shake 0.5s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;