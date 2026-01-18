/**
 * Header Component
 */

import React from 'react';

const Header = ({ activePage, onPageChange }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Stock Market TA</h1>
        <nav className="nav">
          <button 
            className={`nav-btn ${activePage === 'overview' ? 'active' : ''}`}
            onClick={() => onPageChange('overview')}
          >
            Performance Overview
          </button>
          <button 
            className={`nav-btn ${activePage === 'dow-scanner' ? 'active' : ''}`}
            onClick={() => onPageChange('dow-scanner')}
          >
            📊 Dow Theory
          </button>
          <button 
            className={`nav-btn ${activePage === 'global' ? 'active' : ''}`}
            onClick={() => onPageChange('global')}
          >
            Global Markets
          </button>
          <button 
            className={`nav-btn ${activePage === 'nifty50' ? 'active' : ''}`}
            onClick={() => onPageChange('nifty50')}
          >
            Nifty 50
          </button>
          <button 
            className={`nav-btn ${activePage === 'banknifty' ? 'active' : ''}`}
            onClick={() => onPageChange('banknifty')}
          >
            Bank Nifty
          </button>
          <button 
            className={`nav-btn ${activePage === 'sectors' ? 'active' : ''}`}
            onClick={() => onPageChange('sectors')}
          >
            Indices & Sector Performance
          </button>
          <button 
            className={`nav-btn ${activePage === 'stocks' ? 'active' : ''}`}
            onClick={() => onPageChange('stocks')}
          >
            Indices & Sector Stocks
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
