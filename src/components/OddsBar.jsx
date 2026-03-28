import React from 'react';
import { motion } from 'framer-motion';

export const OddsBar = ({ yesPct, noPct }) => {
  return (
    <div style={{ margin: '1rem 0' }}>
      <div className="odds-bar-container">
        <motion.div 
          className="odds-yes" 
          initial={{ width: 0 }} 
          animate={{ width: `${yesPct}%` }} 
          transition={{ duration: 0.8, ease: "easeOut" }} 
        />
        <motion.div 
          className="odds-no" 
          initial={{ width: 0 }} 
          animate={{ width: `${noPct}%` }} 
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }} 
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
        <span style={{ color: 'var(--accent-secondary)' }}>YES {yesPct.toFixed(1)}%</span>
        <span style={{ color: 'var(--accent-danger)' }}>NO {noPct.toFixed(1)}%</span>
      </div>
    </div>
  );
};
