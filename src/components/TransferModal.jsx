import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import CampaignAbi from '../abis/Campaign.json';
import { X, Send, Tag, Wallet, ArrowRight, Loader } from 'lucide-react';

/**
 * TransferModal
 * Shown when the user clicks "Transfer" on a PositionCard.
 * Lets the sender set:
 *   - recipient wallet address
 *   - an optional asking price in MON (a P2P "sell" offer stored in localStorage)
 *
 * Flow:
 *  1. Sender fills form → clicks "Confirm Transfer"
 *  2. transferFrom is called on-chain (NFT moves to recipient)
 *  3. A payment-request record is stored in localStorage so the recipient sees it
 *  4. onSuccess() is called → parent removes the card
 */
export const TransferModal = ({
  isOpen,
  onClose,
  onSuccess,
  tokenId,
  campaignAddress,
  question,
  sideLabel,
  stakeFormatted,
  currentValueFormatted,
  signer,
  account,
}) => {
  const [toAddress, setToAddress] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'confirming' | 'done' | 'error'
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleClose = () => {
    if (step === 'confirming') return; // prevent close mid-tx
    setToAddress('');
    setAskingPrice('');
    setStep('form');
    setErrorMsg('');
    onClose();
  };

  const handleTransfer = async () => {
    if (!ethers.isAddress(toAddress)) {
      setErrorMsg('Invalid wallet address. Please enter a valid Monad address.');
      return;
    }

    const price = parseFloat(askingPrice);
    if (askingPrice !== '' && (isNaN(price) || price < 0)) {
      setErrorMsg('Enter a valid asking price ( ≥ 0 MON ) or leave blank for free transfer.');
      return;
    }

    setErrorMsg('');
    setStep('confirming');

    try {
      const contract = new ethers.Contract(campaignAddress, CampaignAbi, signer);
      // Use signer.getAddress() to get the exact checksummed address the wallet knows,
      // avoids ERC721IncorrectOwner when account prop has a case mismatch.
      const fromAddress = await signer.getAddress();
      const tx = await contract.transferFrom(fromAddress, toAddress, tokenId);
      setTxHash(tx.hash);
      await tx.wait();

      // ── Store a payment request in localStorage so recipient sees it ──
      if (askingPrice !== '' && price > 0) {
        const KEY = 'molybets_payment_requests';
        const existing = JSON.parse(localStorage.getItem(KEY) || '[]');
        existing.push({
          id: `${campaignAddress}-${tokenId.toString()}-${Date.now()}`,
          to: toAddress.toLowerCase(),
          from: account.toLowerCase(),
          campaignAddress,
          tokenId: tokenId.toString(),
          question,
          sideLabel,
          stakeFormatted,
          askingPrice: price.toString(),
          txHash: tx.hash,
          timestamp: Date.now(),
          status: 'pending', // pending | accepted | dismissed
        });
        localStorage.setItem(KEY, JSON.stringify(existing));
      }

      setStep('done');
    } catch (err) {
      console.error('Transfer failed:', err);
      setErrorMsg(err?.reason || err?.message || 'Transaction failed. Check console for details.');
      setStep('form');
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 9998,
            }}
          />

          {/* Modal — portaled to body so position:fixed is always relative to viewport */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              width: '100%',
              maxWidth: 480,
              padding: '0 1rem',
            }}
          >
            <div style={{
              background: 'rgba(14, 14, 18, 0.98)',
              border: '1px solid rgba(124, 58, 237, 0.35)',
              borderRadius: 24,
              padding: '2rem',
              boxShadow: '0 30px 80px -10px rgba(124,58,237,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>
                    Transfer Ticket
                  </h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>NFT · Token #{tokenId?.toString()}</p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={step === 'confirming'}
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)', padding: '0.4rem', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>

              {step !== 'done' ? (
                <>
                  {/* Ticket Preview */}
                  <div style={{
                    background: 'rgba(124,58,237,0.08)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: 14,
                    padding: '1rem',
                    marginBottom: '1.5rem',
                  }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: 6 }}>Ticket</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{question}</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{
                        background: sideLabel === 'YES' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: sideLabel === 'YES' ? '#10b981' : '#ef4444',
                        padding: '0.2rem 0.7rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700,
                      }}>{sideLabel}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Staked: <b style={{ color: 'var(--text-main)' }}>{stakeFormatted} MON</b>
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Value: <b style={{ color: 'var(--text-main)' }}>{currentValueFormatted} MON</b>
                      </span>
                    </div>
                  </div>

                  {/* Recipient Address */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Wallet size={13} /> Recipient Address
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={toAddress}
                      onChange={e => { setToAddress(e.target.value); setErrorMsg(''); }}
                      disabled={step === 'confirming'}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        padding: '0.75rem 1rem',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  {/* Asking Price */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Tag size={13} /> Asking Price (MON)
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        placeholder="e.g. 5.0  (leave blank for free transfer)"
                        min="0"
                        step="0.01"
                        value={askingPrice}
                        onChange={e => { setAskingPrice(e.target.value); setErrorMsg(''); }}
                        disabled={step === 'confirming'}
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--border)',
                          borderRadius: 12,
                          padding: '0.75rem 4rem 0.75rem 1rem',
                          color: 'var(--text-main)',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                      <span style={{
                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600, pointerEvents: 'none',
                      }}>MON</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>
                      💡 The recipient will see a payment request with your asking price. The NFT transfers on-chain immediately; payment settlement is between you and the recipient.
                    </p>
                  </div>

                  {/* Error */}
                  {errorMsg && (
                    <div style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 10,
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                      color: '#ef4444',
                    }}>
                      {errorMsg}
                    </div>
                  )}

                  {/* Confirm Button */}
                  <button
                    onClick={handleTransfer}
                    disabled={step === 'confirming' || !toAddress}
                    style={{
                      width: '100%',
                      background: step === 'confirming'
                        ? 'rgba(124,58,237,0.4)'
                        : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      color: 'white',
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {step === 'confirming' ? (
                      <>
                        <Loader size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                        Confirming on Monad...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Confirm Transfer
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* ── Success State ── */
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 250 }}
                    style={{
                      width: 72, height: 72,
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',
                      border: '2px solid rgba(16,185,129,0.4)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      fontSize: '2rem',
                    }}
                  >
                    ✓
                  </motion.div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Transfer Complete!</h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    The ticket NFT has been sent to<br />
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontSize: '0.8rem' }}>{toAddress}</span>
                    {parseFloat(askingPrice) > 0 && (
                      <><br /><br />A payment request for <b style={{ color: '#10b981' }}>{askingPrice} MON</b> has been queued. The recipient will see it when they connect their wallet.</>
                    )}
                  </p>
                  {txHash && (
                    <a
                      href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="tx-link"
                      style={{ justifyContent: 'center', marginBottom: '1.5rem' }}
                    >
                      View on Monad Explorer ↗
                    </a>
                  )}
                  <button
                    onClick={() => { handleClose(); onSuccess(); }}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-main)',
                      padding: '0.75rem',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Portal to document.body so the modal escapes any parent transform/stacking context
  return ReactDOM.createPortal(modalContent, document.body);
};
