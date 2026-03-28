import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Users } from 'lucide-react';
import { ethers } from 'ethers';
import { useCampaign } from '../hooks/useCampaign';
import { OddsBar } from './OddsBar';
import { CountdownTimer } from './CountdownTimer';
import { motion } from 'framer-motion';

export const MarketCard = ({ address, signer }) => {
  const navigate = useNavigate();
  const { data, loading } = useCampaign(address, signer);

  if (loading || !data.question) return <div className="glass-card" style={{ height: 260, opacity: 0.5 }}>Loading...</div>;

  const totalPool = ethers.formatUnits(data.yesPool + data.noPool, 6);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card" 
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className={`status-badge status-${data.state}`}>{data.state}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          <Clock size={14} />
          <CountdownTimer expiry={data.lockTime} />
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', lineHeight: 1.4, height: '3.5rem', overflow: 'hidden' }}>
        {data.question}
      </h3>

      <OddsBar yesPct={data.yesPct} noPct={data.noPct} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Pool</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{totalPool} USDC</p>
        </div>
        
        <button 
          onClick={() => navigate(`/market/${address}`)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            border: '1px solid var(--border)',
            padding: '0.6rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          View Market <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};
