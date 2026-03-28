import React, { useState, useEffect, useCallback } from 'react';
import { useFactory } from '../hooks/useFactory';
import { PositionCard } from '../components/PositionCard';
import { Briefcase, Wallet, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import CampaignAbi from '../abis/Campaign.json';

export const Positions = ({ signer, account }) => {
  const { campaigns, loading: factoryLoading } = useFactory(signer);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllPositions = useCallback(async () => {
    if (!account || !campaigns.length || !signer) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const allPos = [];
      const promises = campaigns.map(async (addr) => {
        const contract = new ethers.Contract(addr, CampaignAbi, signer);
        
        try {
          const tickets = await contract.getUserTickets(account);
          
          for (const tid of tickets) {
            try {
              // Check stake > 0 (not claimed/burned) AND that the account still owns it
              // getUserTickets is append-only; tokens transferred away are still listed
              const [stake, owner] = await Promise.all([
                contract.tokenStake(tid),
                contract.ownerOf(tid),
              ]);
              if (stake > 0n && owner.toLowerCase() === account.toLowerCase()) {
                allPos.push({ campaign: addr, tokenId: tid });
              }
            } catch (e) {
              // Ignore burned / nonexistent tokens (ownerOf throws on burned)
            }
          }
        } catch (e) {
          console.error("Failed to sync tickets for campaign", addr, e);
        }
      });

      await Promise.all(promises);
      setPositions(allPos);
    } catch (err) {
      console.error("Error fetching positions:", err);
    } finally {
      setLoading(false);
    }
  }, [account, campaigns, signer]);

  useEffect(() => {
    fetchAllPositions();
  }, [fetchAllPositions]);

  if (!account) return (
    <div style={{ textAlign: 'center', padding: '10rem 0' }}>
      <Wallet size={48} color="var(--text-dim)" style={{ marginBottom: '1.5rem' }} />
      <h2>Connect your wallet</h2>
      <p style={{ color: 'var(--text-dim)' }}>Please connect to view your active positions.</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Positions</h2>
        <p style={{ color: 'var(--text-dim)' }}>Your active prediction tickets and claimable winnings.</p>
      </div>

      {loading || factoryLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Scanning Monad for your tickets...</p>
        </div>
      ) : positions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', border: '1px dashed var(--border)', borderRadius: 20, marginTop: '2rem' }}>
          <Briefcase size={48} color="var(--text-dim)" style={{ marginBottom: '1.5rem' }} />
          <h3>No positions yet.</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Browse markets to place your first bet.</p>
          <Link to="/markets" style={{ textDecoration: 'none' }}>
            <button style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.8rem 1.5rem' }}>
              Browse Markets
            </button>
          </Link>
        </div>
      ) : (
        <div className="market-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
          {positions.map((pos, idx) => (
            <PositionCard 
              key={`${pos.campaign}-${pos.tokenId}`} 
              campaignAddress={pos.campaign} 
              tokenId={pos.tokenId} 
              signer={signer}
              account={account}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
