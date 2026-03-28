import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Send } from 'lucide-react';

export const OraclePanel = ({ onResolve, status }) => {
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPrice = async () => {
    setLoading(true);
    try {
      const resp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await resp.json();
      setBtcPrice(data.bitcoin.usd);
    } catch (err) {
      console.error("Price fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  return (
    <div className="glass-card animate-fade" style={{ border: '1px solid #7c3aed', background: 'rgba(124, 58, 237, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <Shield size={20} color="#7c3aed" />
        <h3 style={{ fontSize: '1.1rem' }}>Resolver Panel</h3>
      </div>

      <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Live BTC Price</p>
        <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>
          ${btcPrice ? btcPrice.toLocaleString() : "---"}
        </p>
        <button 
          onClick={fetchPrice}
          disabled={loading}
          style={{ 
            background: 'transparent', 
            color: 'var(--accent-primary)', 
            fontSize: '0.9rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            margin: '0 auto' 
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Price
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button 
          disabled={status !== "CLOSED"}
          onClick={() => onResolve(1)}
          style={{ background: '#10b981', color: 'white', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Send size={16} /> Resolve YES
        </button>
        <button 
          disabled={status !== "CLOSED"}
          onClick={() => onResolve(0)}
          style={{ background: '#ef4444', color: 'white', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Send size={16} /> Resolve NO
        </button>
      </div>
      {status !== "CLOSED" && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.8rem', textAlign: 'center' }}>
          Market must be CLOSED to resolve.
        </p>
      )}
    </div>
  );
};
