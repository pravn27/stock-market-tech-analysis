/**
 * ASTA - Stock Market Technical Analysis
 * Main App Component
 */

import React, { useState } from 'react';
import Header from './components/Header';
import GlobalMarkets from './pages/GlobalMarkets';
import Nifty50 from './pages/Nifty50';
import BankNifty from './pages/BankNifty';
import SectorPerformance from './pages/SectorPerformance';
import SectorStocks from './pages/SectorStocks';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('global');

  return (
    <div className="app">
      <Header activePage={activePage} onPageChange={setActivePage} />
      <main className="main-content">
        {activePage === 'global' && <GlobalMarkets />}
        {activePage === 'nifty50' && <Nifty50 />}
        {activePage === 'banknifty' && <BankNifty />}
        {activePage === 'sectors' && <SectorPerformance />}
        {activePage === 'stocks' && <SectorStocks />}
      </main>
      <footer className="footer">
        <p>ASTA - Stock Market Technical Analysis</p>
      </footer>
      </div>
  );
}

export default App;
