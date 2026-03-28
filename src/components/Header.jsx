import React from 'react';
import { Wallet, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = ({ account, balance, connectWallet, isCorrectNetwork }) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      padding: '1rem 0',
      background: 'rgba(10, 10, 12, 0.8)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/markets" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #7c3aed 0%, #10b981 100%)',
              borderRadius: 8,
              boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
            }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Molybets</h1>
          </div>
        </Link>
        
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/markets" style={{ textDecoration: 'none', color: 'var(--text-dim)', fontWeight: 600 }}>Markets</Link>
            <Link to="/positions" style={{ textDecoration: 'none', color: 'var(--text-dim)', fontWeight: 600 }}>Positions</Link>
            <Link to="/create" style={{ textDecoration: 'none', color: 'var(--text-dim)', fontWeight: 600 }}>Create</Link>
          </nav>

          {account ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="glass-card" style={{ padding: '0.4rem 1rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{parseFloat(balance).toFixed(2)} MON</span>
              </div>
              <button 
                className={isCorrectNetwork ? "glass-card" : "glass-card"}
                style={{ 
                  color: isCorrectNetwork ? 'var(--text-main)' : 'var(--accent-danger)',
                  padding: '0.4rem 1rem', 
                  borderRadius: 12,
                  borderColor: isCorrectNetwork ? 'var(--border)' : 'var(--accent-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '100%', 
                  background: isCorrectNetwork ? '#10b981' : '#ef4444' 
                }} />
                {account.slice(0, 6)}...{account.slice(-4)}
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
                padding: '0.6rem 1.4rem',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Wallet size={18} />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
