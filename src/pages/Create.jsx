import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFactory } from '../hooks/useFactory';
import { ChevronLeft, Info, PlusCircle, AlertTriangle } from 'lucide-react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';

export const Create = ({ signer }) => {
  const navigate = useNavigate();
  const { createCampaign, loading } = useFactory(signer);
  
  const [question, setQuestion] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [duration, setDuration] = useState(3600); // 1 hour
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!question || !targetPrice) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const txHash = await createCampaign(question, BigInt(targetPrice), duration);
      // After success, we should ideally get the campaign address from events, 
      // but for now, we'll just go back to markets to see it in the list.
      navigate('/markets');
    } catch (err) {
      setError(err.reason || err.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 600, margin: '4rem auto' }}
    >
      <Link to="/markets" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ChevronLeft size={16} /> Cancel and return
      </Link>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <PlusCircle size={28} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.75rem' }}>Create New Market</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Market Question</label>
            <input 
              type="text" 
              placeholder="e.g. Will BTC be above $100,000?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ padding: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Target Price (USD)</label>
            <input 
              type="number" 
              placeholder="100000"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              style={{ padding: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Duration</label>
            <select 
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '1rem',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value={300}>5 Minutes</option>
              <option value={3600}>1 Hour</option>
              <option value={86400}>24 Hours</option>
              <option value={604800}>7 Days</option>
            </select>
          </div>

          <div style={{ background: 'rgba(124, 58, 237, 0.05)', padding: '1rem', borderRadius: 12, marginBottom: '2rem', display: 'flex', gap: '0.8rem' }}>
            <Info size={20} color="var(--accent-primary)" />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Market creation fee is 10% (FeeBP: 1000). The oracle will resolve this market once the duration expires.
            </p>
          </div>

          {error && (
            <div style={{ marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '0.8rem', borderRadius: 8, color: '#ef4444', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', background: 'var(--accent-primary)', color: 'white', padding: '1rem', fontSize: '1.1rem' }}
          >
            {loading ? "Creating..." : "Launch Market"}
          </button>
        </form>
      </div>
      
      <style>{`
        input {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border);
            border-radius: 12px;
            color: white;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
        }
        input:focus { border-color: var(--accent-primary); }
      `}</style>
    </motion.div>
  );
};
