import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCampaign } from '../hooks/useCampaign';
import { ethers } from 'ethers';
import { CONFIG } from '../config';
import { ChevronLeft, ExternalLink, Info, AlertTriangle } from 'lucide-react';
import { OddsBar } from '../components/OddsBar';
import { CountdownTimer } from '../components/CountdownTimer';
import { FarcasterFrameMock } from '../components/FarcasterFrameMock';
import { PolymarketComparisonPanel } from '../components/PolymarketComparisonPanel';
import { OraclePanel } from '../components/OraclePanel';
import { motion } from 'framer-motion';

export const Market = ({ signer, account }) => {
  const { address } = useParams();
  const { data, loading, join, resolve } = useCampaign(address, signer, account);
  const [side, setSide] = useState(1); // 1 = YES, 0 = NO
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  if (loading || !data.question) return <div style={{ padding: '6rem 0', textAlign: 'center' }}>Fetching market details...</div>;

  const totalPool = ethers.formatEther(data.yesPool + data.noPool);
  const sidePool = side === 1 ? data.yesPool : data.noPool;
  const rawAmount = amount ? ethers.parseEther(amount) : 0n;
  
  // Estimated Payout: (your stake / selected pool + your stake) * total pool
  const estPayout = rawAmount > 0n 
    ? (Number(rawAmount) / (Number(sidePool) + Number(rawAmount))) * (Number(data.yesPool + data.noPool) + Number(rawAmount))
    : 0;

  const handleAction = async () => {
    setError(null);
    try {
      const hash = await join(side, rawAmount);
      setTxHash(hash);
      setAmount("");
    } catch (err) {
      setError(err.reason || err.message);
    }
  };

  const isOracle = account?.toLowerCase() === CONFIG.Oracle?.toLowerCase();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '3rem 0' }}
    >
      <Link to="/markets" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ChevronLeft size={16} /> Back to Markets
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className={`status-badge status-${data.state}`}>{data.state}</span>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Time Remaining: <CountdownTimer expiry={data.lockTime} />
            </div>
          </div>
          
          <h2 style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '2rem' }}>{data.question}</h2>
          
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Implied Odds</span>
              <span style={{ color: 'var(--text-dim)' }}>{totalPool} MON Total Pool</span>
            </div>
            <OddsBar yesPct={data.yesPct} noPct={data.noPct} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '4rem' }}>
            <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={18} /> Place Bet
                </h3>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button 
                        onClick={() => setSide(1)}
                        style={{ 
                            flex: 1, 
                            padding: '1rem', 
                            background: side === 1 ? 'var(--accent-secondary)' : 'rgba(255, 255, 255, 0.05)',
                            color: side === 1 ? 'white' : 'var(--text-dim)',
                            border: side === 1 ? 'none' : '1px solid var(--border)'
                        }}
                    >
                        YES
                    </button>
                    <button 
                        onClick={() => setSide(0)}
                        style={{ 
                            flex: 1, 
                            padding: '1rem', 
                            background: side === 0 ? 'var(--accent-danger)' : 'rgba(255, 255, 255, 0.05)',
                            color: side === 0 ? 'white' : 'var(--text-dim)',
                            border: side === 0 ? 'none' : '1px solid var(--border)'
                        }}
                    >
                        NO
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Amount (MON)</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            padding: '1rem',
                            color: 'white',
                            fontSize: '1.1rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Est. Payout</span>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>{estPayout.toFixed(2)} MON</span>
                    </div>
                </div>

                <button 
                    onClick={handleAction}
                    disabled={!amount || data.state !== "OPEN"}
                    style={{
                        width: '100%',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        padding: '1rem',
                        fontSize: '1.1rem'
                    }}
                >
                    Place Bet
                </button>
                
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    You will receive a position ticket for this bet.
                </p>

                {txHash && (
                    <a href={`https://testnet.monadexplorer.com/tx/${txHash}`} target="_blank" className="tx-link" style={{ justifyContent: 'center' }}>
                        View Result <ExternalLink size={14} />
                    </a>
                )}

                {error && (
                    <div style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '0.8rem', borderRadius: 8, color: '#ef4444', fontSize: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}
            </div>

            <FarcasterFrameMock 
              question={data.question} 
              yesPct={data.yesPct} 
              noPct={data.noPct} 
              onBet={(s) => { setSide(s); handleAction(); }}
            />
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Target Price</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0' }}>
                    ${Number(data.targetPrice).toLocaleString()}
                </p>
            </div>

            {isOracle && <OraclePanel onResolve={resolve} status={data.state} />}
            
            <div className="glass-card">
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Market Info</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Address</span>
                        <code style={{ fontSize: '0.75rem' }}>{address.slice(0, 8)}...{address.slice(-6)}</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Oracle</span>
                        <code style={{ fontSize: '0.75rem' }}>{CONFIG.Oracle?.slice(0, 8)}...</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Network</span>
                        <span>{CONFIG.networkName}</span>
                    </div>
                </div>
            </div>
        </aside>
      </div>

      <PolymarketComparisonPanel />
    </motion.div>
  );
};
