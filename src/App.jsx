import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useWallet } from './hooks/useWallet';
import { Header } from './components/Header';
import { Markets } from './pages/Markets';
import { Market } from './pages/Market';
import { Positions } from './pages/Positions';
import { Create } from './pages/Create';

function App() {
  const wallet = useWallet();

  return (
    <Router>
      <div className="app">
        <Header 
          account={wallet.account} 
          balance={wallet.balance} 
          connectWallet={wallet.connectWallet} 
          isCorrectNetwork={wallet.isCorrectNetwork} 
        />
        
        <main className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/markets" replace />} />
            <Route path="/markets" element={<Markets signer={wallet.signer} />} />
            <Route path="/market/:address" element={<Market signer={wallet.signer} account={wallet.account} />} />
            <Route path="/positions" element={<Positions signer={wallet.signer} account={wallet.account} />} />
            <Route path="/create" element={<Create signer={wallet.signer} />} />
          </Routes>
        </main>

        <footer style={{ padding: '4rem 0', textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: '4rem' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            &copy; 2026 Molybets · Built on Monad Testnet 🔮
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
