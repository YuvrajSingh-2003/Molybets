import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, ExternalLink, ArrowDownLeft, Tag } from 'lucide-react';

const STORAGE_KEY = 'molybets_payment_requests';

/**
 * PaymentRequestBanner
 * Globally mounted in App.jsx.
 * Polls localStorage for any payment requests addressed to the connected wallet (account).
 * Shows a notification bell + expandable panel listing pending requests.
 *
 * Note: Since this is a P2P frontend-only flow (no backend), the recipient sees the
 * request only on the same browser/device. For cross-device use, a backend would be needed.
 * For this testnet demo this localStorage approach suffices perfectly.
 */
export const PaymentRequestBanner = ({ account }) => {
  const [requests, setRequests] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  const loadRequests = () => {
    if (!account) { setRequests([]); return; }
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const mine = all.filter(
      r => r.to === account.toLowerCase() && r.status === 'pending'
    );
    setRequests(mine);
  };

  // Poll every 3 s to catch requests added by another tab/session
  useEffect(() => {
    loadRequests();
    const id = setInterval(loadRequests, 3000);
    return () => clearInterval(id);
  }, [account]);

  const dismissRequest = (reqId) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = all.map(r => r.id === reqId ? { ...r, status: 'dismissed' } : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    loadRequests();
  };

  const acceptRequest = (reqId) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = all.map(r => r.id === reqId ? { ...r, status: 'accepted' } : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    loadRequests();
  };

  if (!account || requests.length === 0) return null;

  return (
    <>
      {/* ── Floating Bell ── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setPanelOpen(true)}
        title="You have incoming payment requests"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 900,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(124,58,237,0.5)',
        }}
      >
        <Bell size={22} color="white" />
        {/* Badge */}
        <span style={{
          position: 'absolute',
          top: -2, right: -2,
          width: 20, height: 20,
          background: '#ef4444',
          borderRadius: '50%',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--bg-dark)',
        }}>
          {requests.length}
        </span>
      </motion.button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 950,
              }}
            />

            {/* Slide-in Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              style={{
                position: 'fixed',
                top: 0, right: 0,
                height: '100vh',
                width: '100%',
                maxWidth: 420,
                zIndex: 1000,
                background: 'rgba(12,12,16,0.98)',
                borderLeft: '1px solid rgba(124,58,237,0.25)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
              }}
            >
              {/* Panel Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.5rem',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(124,58,237,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ArrowDownLeft size={20} color="#7c3aed" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Payment Requests</h3>
                  <span style={{
                    background: 'rgba(124,58,237,0.2)',
                    color: '#a78bfa',
                    borderRadius: 100,
                    padding: '0.1rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}>
                    {requests.length}
                  </span>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)', padding: '0.4rem', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>

              <p style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>
                Someone transferred a betting ticket to you and is asking for MON in return. Acknowledge once you've settled the payment off-chain or dismiss if unwanted.
              </p>

              {/* Requests List */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                  {requests.map(req => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 60 }}
                      style={{
                        background: 'rgba(20,20,26,0.8)',
                        border: '1px solid rgba(124,58,237,0.2)',
                        borderRadius: 16,
                        padding: '1.25rem',
                      }}
                    >
                      {/* From */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', color: 'white', fontWeight: 700, flexShrink: 0,
                        }}>
                          {req.from.slice(2, 4).toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                          {req.from.slice(0, 6)}…{req.from.slice(-4)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>transferred a ticket to you</span>
                      </div>

                      {/* Ticket Info */}
                      <div style={{
                        background: 'rgba(124,58,237,0.07)',
                        border: '1px solid rgba(124,58,237,0.15)',
                        borderRadius: 10,
                        padding: '0.75rem',
                        marginBottom: 12,
                      }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{req.question}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{
                            background: req.sideLabel === 'YES' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: req.sideLabel === 'YES' ? '#10b981' : '#ef4444',
                            padding: '0.15rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700,
                          }}>{req.sideLabel}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Staked: <b style={{ color: 'white' }}>{req.stakeFormatted} MON</b></span>
                        </div>
                      </div>

                      {/* Asking Price */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: 10,
                        padding: '0.6rem 0.85rem',
                        marginBottom: 12,
                      }}>
                        <Tag size={14} color="#10b981" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Asking Price:</span>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                          {req.askingPrice} MON
                        </span>
                      </div>

                      {/* TX Link */}
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${req.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="tx-link"
                        style={{ marginTop: 0, marginBottom: 12, fontSize: '0.78rem' }}
                      >
                        Verify transfer on-chain <ExternalLink size={12} />
                      </a>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => acceptRequest(req.id)}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))',
                            border: '1px solid rgba(16,185,129,0.3)',
                            color: '#10b981',
                            padding: '0.55rem 0.75rem',
                            fontSize: '0.82rem',
                            borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          }}
                        >
                          <CheckCircle size={14} />
                          Paid & Acknowledge
                        </button>
                        <button
                          onClick={() => dismissRequest(req.id)}
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-dim)',
                            padding: '0.55rem 0.75rem',
                            fontSize: '0.82rem',
                            borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          }}
                        >
                          <X size={14} />
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
