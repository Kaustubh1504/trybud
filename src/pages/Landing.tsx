// src/pages/Landing.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { connectWallet } from "../util/wallet";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useWallet();

  React.useEffect(() => {
    if (address) {
      navigate("/dashboard");
    }
  }, [address, navigate]);

  const handleConnect = async () => {
    await connectWallet();
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Hero Section */}
      <div style={{ padding: '80px 20px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '72px', animation: 'bounce 2s infinite' }}>💪</div>
            <h1 style={{ 
              fontSize: '64px', 
              fontWeight: 800, 
              background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              TryBud
            </h1>
          </div>
          
          <h2 style={{ fontSize: '40px', fontWeight: 700, margin: '24px 0 16px' }}>
            Put Your Money Where Your Hustle Is
          </h2>
          
          <p style={{ 
            fontSize: '20px', 
            color: 'rgba(255, 255, 255, 0.9)', 
            maxWidth: '700px', 
            margin: '0 auto 48px',
            lineHeight: 1.6
          }}>
            Stake crypto on your job search goals. Hit your targets, earn rewards. 
            Miss them, fuel the community pool. Real accountability, real results.
          </p>

          <div style={{ margin: '48px 0' }}>
            <button
              onClick={handleConnect}
              style={{
                padding: '20px 60px',
                fontSize: '20px',
                fontWeight: 700,
                borderRadius: '50px',
                background: 'white',
                color: '#667eea',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
              }}
            >
              ⚡ Start Your Quest
            </button>
            <p style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
              Connect your Stellar wallet to begin
            </p>
          </div>

          {/* Stats Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            gap: '32px', 
            margin: '60px auto 0',
            maxWidth: '800px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: '#ffd93d', marginBottom: '8px' }}>
                87%
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                Job seekers lose momentum
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: '#ffd93d', marginBottom: '8px' }}>
                $0.001
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                Transaction fee
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: '#ffd93d', marginBottom: '8px' }}>
                5%
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                APY on stakes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ background: 'white', color: '#333', padding: '80px 20px' }}>
        <h3 style={{ 
          textAlign: 'center', 
          fontSize: '40px', 
          fontWeight: 700, 
          marginBottom: '60px',
          color: '#667eea'
        }}>
          How It Works
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '32px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '20px',
            transition: 'all 0.3s'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
            <h4 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#667eea' }}>
              Set Your Goal
            </h4>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Choose your quest: job applications, networking, or skill building. 
              Set your daily target and duration.
            </p>
          </div>

          <div style={{ 
            textAlign: 'center', 
            padding: '32px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '20px',
            transition: 'all 0.3s'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💰</div>
            <h4 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#667eea' }}>
              Stake USDC
            </h4>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Lock your stake in a smart contract. Your funds earn yield while 
              you work toward your goal.
            </p>
          </div>

          <div style={{ 
            textAlign: 'center', 
            padding: '32px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '20px',
            transition: 'all 0.3s'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h4 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#667eea' }}>
              Prove Progress
            </h4>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Log activities via email auto-parse, LinkedIn posts, or manual entry. 
              ZK proofs verify authenticity.
            </p>
          </div>

          <div style={{ 
            textAlign: 'center', 
            padding: '32px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '20px',
            transition: 'all 0.3s'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏆</div>
            <h4 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#667eea' }}>
              Win Big
            </h4>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Complete your quest to get your stake + yield + bonus from the 
              community pool. Earn NFT badges!
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '32px',
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {[
          { icon: '🛡️', title: 'Blockchain Verified', desc: 'Immutable proof of every action. No cheating, complete transparency.' },
          { icon: '📈', title: 'Earn While You Stake', desc: 'Your locked funds generate 5% APY through Stellar DeFi protocols.' },
          { icon: '📧', title: 'Auto-Log via Email', desc: 'Forward application confirmations - AI parses and logs automatically.' },
          { icon: '🏅', title: 'Collectible NFT Badges', desc: 'Earn exclusive achievement badges. Show off your dedication.' },
          { icon: '👥', title: 'Community Rewards', desc: 'Failed stakes go to successful questers. Win together.' },
          { icon: '⚡', title: 'Lightning Fast', desc: 'Built on Stellar. Sub-second transactions, fraction of a cent fees.' },
        ].map((feature, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{feature.icon}</div>
            <h4 style={{ margin: '16px 0 12px', fontSize: '20px', fontWeight: 700 }}>
              {feature.title}
            </h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, fontSize: '15px' }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Why Section */}
      <div style={{ background: '#1a1a2e', padding: '80px 20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '40px', fontWeight: 700, marginBottom: '60px', color: 'white' }}>
          Why TryBud?
        </h3>
        
        <div style={{ maxWidth: '700px', margin: '0 auto 48px', textAlign: 'left' }}>
          {[
            { text: 'Real consequences - Financial stakes create genuine motivation' },
            { text: 'Zero friction - 5 seconds to log vs 30 seconds manual' },
            { text: 'Community support - Compete on leaderboards, celebrate wins' },
            { text: 'Privacy first - You control your data, minimal on-chain' }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
              <div style={{ color: '#4ecdc4', fontSize: '24px', marginTop: '4px' }}>✓</div>
              <p style={{ fontSize: '18px', margin: 0 }}>
                <strong>{item.text.split(' - ')[0]}</strong> - {item.text.split(' - ')[1]}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={handleConnect}
          style={{
            padding: '20px 60px',
            fontSize: '20px',
            fontWeight: 700,
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(78, 205, 196, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Get Started Now
        </button>
      </div>
    </div>
  );
};

export default Landing;