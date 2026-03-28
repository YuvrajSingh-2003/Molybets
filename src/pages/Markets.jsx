import React from 'react';
import { useFactory } from '../hooks/useFactory';
import { MarketCard } from '../components/MarketCard';
import { PlusCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Markets = ({ signer }) => {
  const { campaigns, loading } = useFactory(signer);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Active Markets</h2>
          <p style={{ color: 'var(--text-dim)' }}>Predict and trade on world events with on-chain tickets.</p>
        </div>
        
        <Link to="/create" style={{ textDecoration: 'none' }}>
          <button style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} /> Create Market
          </button>
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <p>Scanning Monad for markets...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', border: '1px dashed var(--border)', borderRadius: 20, marginTop: '2rem' }}>
            <Search size={48} color="var(--text-dim)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ marginBottom: '1rem' }}>No markets yet.</h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Be the first to create one and start the prediction.</p>
            <Link to="/create" style={{ textDecoration: 'none' }}>
                <button style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid var(--border)', padding: '0.8rem 1.5rem' }}>
                    Create First Market
                </button>
            </Link>
        </div>
      ) : (
        <div className="market-grid">
          {campaigns.map(addr => (
            <MarketCard key={addr} address={addr} signer={signer} />
          ))}
        </div>
      )}
    </motion.div>
  );
};
