import React from 'react';
import { Share2, MessageCircle, Heart, Repeat } from 'lucide-react';
import { OddsBar } from './OddsBar';

export const FarcasterFrameMock = ({ question, yesPct, noPct, onBet }) => {
  return (
    <div className="glass-card animate-fade" style={{ background: '#18181b', padding: '1.5rem', border: '1px solid #3f3f46' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: '100%', background: 'linear-gradient(45deg, #7c3aed, #ec4899)' }} />
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Molybets <span style={{ color: '#71717a', fontWeight: 400 }}>@molybets</span></p>
          <p style={{ fontSize: '0.9rem', color: '#d4d4d8', marginTop: '0.2rem' }}>
            New market live: {question} · Bet YES or NO below 🔮
          </p>
        </div>
      </div>

      <div style={{ 
        background: '#09090b', 
        borderRadius: '12px', 
        border: '1px solid #27272a',
        padding: '1.5rem',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{question}</h4>
        
        <div style={{ padding: '1rem 0' }}>
            <div className="odds-bar-container" style={{ background: '#27272a' }}>
                <div className="odds-yes" style={{ width: `${yesPct}%` }} />
                <div className="odds-no" style={{ width: `${noPct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.5rem' }}>
                <span style={{ color: '#10b981' }}>YES {yesPct.toFixed(0)}%</span>
                <span style={{ color: '#ef4444' }}>NO {noPct.toFixed(0)}%</span>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
          <button 
            onClick={() => onBet(1)}
            style={{ background: '#10b981', color: 'white', padding: '0.6rem', fontSize: '0.9rem' }}
          >
            Bet YES
          </button>
          <button 
            onClick={() => onBet(0)}
            style={{ background: '#ef4444', color: 'white', padding: '0.6rem', fontSize: '0.9rem' }}
          >
            Bet NO
          </button>
        </div>
        <p style={{ color: '#71717a', fontSize: '0.75rem', marginTop: '0.8rem' }}>Tap to bet · Position ticket minted on Monad</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717a', padding: '0 0.5rem' }}>
        <MessageCircle size={18} />
        <Repeat size={18} />
        <Heart size={18} />
        <Share2 size={18} />
      </div>
      
      <div style={{ marginTop: '1.5rem', borderTop: '1px solid #27272a', paddingTop: '1rem', textAlign: 'center' }}>
        <p style={{ color: '#71717a', fontSize: '0.75rem', fontStyle: 'italic' }}>
          This is how Molybets works natively on Farcaster
        </p>
        <span className="status-badge" style={{ fontSize: '0.65rem', background: '#27272a', marginTop: '0.5rem', display: 'inline-block' }}>Coming Soon</span>
      </div>
    </div>
  );
};
