import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CampaignAbi from '../abis/Campaign.json';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const PositionCard = ({ campaignAddress, tokenId, signer, account }) => {
  const [details, setDetails] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const fetchPosition = async () => {
    if (!signer || !campaignAddress) return;
    try {
      const contract = new ethers.Contract(campaignAddress, CampaignAbi, signer);
      const [question, side, stake, value, resolved, winningSide] = await Promise.all([
        contract.question(),
        contract.tokenSide(tokenId),
        contract.tokenStake(tokenId),
        contract.getTicketValue(tokenId),
        contract.resolved(),
        contract.winningSide()
      ]);

      setDetails({ side, stake, value });
      setMarketData({ question, resolved, winningSide });
    } catch (err) {
      console.error("Error fetching position:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, 10000); // Polling for value
    return () => clearInterval(interval);
  }, [campaignAddress, tokenId, signer]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const contract = new ethers.Contract(campaignAddress, CampaignAbi, signer);
      const tx = await contract.claim(tokenId);
      setTxHash(tx.hash);
      await tx.wait();
      fetchPosition();
    } catch (err) {
      console.error("Claim failed:", err);
    } finally {
      setClaiming(false);
    }
  };

  if (loading || !details) return <div className="glass-card" style={{ height: 180, opacity: 0.5 }}>Loading position...</div>;

  const sideLabel = Number(details.side) === 1 ? "YES" : "NO";
  const pnl = Number(details.value) - Number(details.stake);
  const pnlPct = (pnl / Number(details.stake)) * 100;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card" 
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{marketData.question}</h4>
        <span className={`status-badge`} style={{ 
          background: Number(details.side) === 1 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: Number(details.side) === 1 ? '#10b981' : '#ef4444'
        }}>
          {sideLabel}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700 }}>INVESTED</p>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>{ethers.formatUnits(details.stake, 6)} USDC</p>
        </div>
        <div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700 }}>CURRENT VALUE</p>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>{ethers.formatUnits(details.value, 6)} USDC</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: pnl >= 0 ? '#10b981' : '#ef4444', fontSize: '0.9rem', fontWeight: 700 }}>
          {pnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {pnl >= 0 ? "+" : ""}{ethers.formatUnits(pnl, 6)} ({pnlPct.toFixed(2)}%)
        </div>

        {marketData.resolved ? (
          Number(details.side) === Number(marketData.winningSide) ? (
            <button 
              onClick={handleClaim}
              disabled={claiming || Number(details.value) === 0}
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem'
              }}
            >
              {claiming ? "Claiming..." : Number(details.value) === 0 ? "Claimed ✓" : "Claim Payout"}
            </button>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Position Closed</span>
          )
        ) : (
          <button 
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              border: '1px solid var(--border)',
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem'
            }}
          >
            Transfer
          </button>
        )}
      </div>

      {txHash && (
        <a href={`https://testnet.monadexplorer.com/tx/${txHash}`} target="_blank" className="tx-link">
          TX Receipt <ExternalLink size={14} />
        </a>
      )}
    </motion.div>
  );
};
