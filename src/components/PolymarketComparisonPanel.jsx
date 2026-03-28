import React from 'react';
import { Lock, Unlock, Zap, TrendingUp, Users, Smartphone } from 'lucide-react';

export const PolymarketComparisonPanel = () => {
  return (
    <div className="animate-fade" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
      <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '3rem' }}>
        Molybets is a layer on top of prediction markets
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-card" style={{ opacity: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', color: 'var(--text-dim)' }}>
            <Lock size={20} />
            <h3 style={{ fontSize: '1.1rem' }}>Standard prediction market (e.g. Polymarket)</h3>
          </div>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-dim)' }}>
            <li>• Position locked until resolution</li>
            <li>• Cannot transfer your bet</li>
            <li>• No social trading layer</li>
            <li>• Dapp-only experience</li>
          </ul>
        </div>

        <div className="glass-card" style={{ border: '2px solid var(--accent-primary)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            background: 'var(--accent-primary)', 
            padding: '0.2rem 1rem', 
            fontSize: '0.75rem', 
            fontWeight: 700 
          }}>
            THE MOLYBETS WAY
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
            <Unlock size={20} />
            <h3 style={{ fontSize: '1.1rem' }}>With Molybets layer</h3>
          </div>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>• Position is a transferable ticket</li>
            <li>• Trade before resolution</li>
            <li>• Works inside Farcaster feeds</li>
            <li>• Claim by current holder, not original bettor</li>
          </ul>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        We're not replacing Polymarket. We add the social and liquidity layer they never built.
      </p>
    </div>
  );
};
