/**
 * ASTA - Stock Market Technical Analysis
 * Main App Component
 */

import React, { useState } from 'react';
import Header from './components/Header';
import SectorPerformance from './pages/SectorPerformance';
import SectorStocks from './pages/SectorStocks';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('sectors');

  return (
    <div className="app">
      <Header activePage={activePage} onPageChange={setActivePage} />
      <main className="main-content">
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
