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
            className={`nav-btn ${activePage === 'sectors' ? 'active' : ''}`}
            onClick={() => onPageChange('sectors')}
          >
            Sector Performance
          </button>
          <button 
            className={`nav-btn ${activePage === 'stocks' ? 'active' : ''}`}
            onClick={() => onPageChange('stocks')}
          >
            Sector Stocks
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
