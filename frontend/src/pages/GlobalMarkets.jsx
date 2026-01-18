/**
 * Global Markets Page
 * Shows global market indices and sentiment analysis
 */

import React, { useState } from 'react';
import { getGlobalMarkets } from '../api/scanner';
import { TIMEFRAMES } from '../api/config';
import Loader from '../components/Loader';

const formatPrice = (price) => {
  if (price === null || price === undefined) return '-';
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatChange = (change, changePct) => {
  if (change === null || changePct === null) return { change: '-', pct: '-', className: '' };
  const isPositive = change >= 0;
  return {
    change: `${isPositive ? '+' : ''}${change.toFixed(2)}`,
    pct: `${isPositive ? '+' : ''}${changePct.toFixed(2)}%`,
    className: isPositive ? 'positive' : 'negative'
  };
};

// Sortable Table Component
const MarketTable = ({ title, emoji, markets }) => {
  const [sortColumn, setSortColumn] = React.useState('change_pct');
  const [sortDirection, setSortDirection] = React.useState('desc');

  if (!markets || markets.length === 0) return null;

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedMarkets = [...markets].sort((a, b) => {
    let aVal = a[sortColumn];
    let bVal = b[sortColumn];
    
    // Handle null values
    if (aVal === null || aVal === undefined) aVal = sortDirection === 'asc' ? Infinity : -Infinity;
    if (bVal === null || bVal === undefined) bVal = sortDirection === 'asc' ? Infinity : -Infinity;
    
    // String comparison for text columns
    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    
    // Numeric comparison
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return <span className="sort-icon">⇅</span>;
    return <span className="sort-icon active">{sortDirection === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="market-section table-view">
      <h3 className="section-title">{emoji} {title}</h3>
      <div className="table-container">
        <table className="market-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('short')} className="sortable">
                Symbol <SortIcon column="short" />
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Name <SortIcon column="name" />
              </th>
              <th onClick={() => handleSort('price')} className="sortable text-right">
                Price <SortIcon column="price" />
              </th>
              <th onClick={() => handleSort('change')} className="sortable text-right">
                Change <SortIcon column="change" />
              </th>
              <th onClick={() => handleSort('change_pct')} className="sortable text-right">
                Change % <SortIcon column="change_pct" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMarkets.map((market) => {
              const { change, pct, className } = formatChange(market.change, market.change_pct);
              return (
                <tr key={market.symbol} className={className}>
                  <td className="symbol-cell">{market.short}</td>
                  <td className="name-cell">{market.name}</td>
                  <td className="price-cell text-right">{formatPrice(market.price)}</td>
                  <td className={`change-cell text-right ${className}`}>{change}</td>
                  <td className={`pct-cell text-right ${className}`}>{pct}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SentimentGauge = ({ sentiment, timeframe }) => {
  if (!sentiment) return null;
  
  const { score, label, breadth, vix, factors } = sentiment;
  
  // Determine gauge color based on score
  const getGaugeColor = (score) => {
    if (score >= 70) return '#22c55e';
    if (score >= 55) return '#84cc16';
    if (score >= 45) return '#eab308';
    if (score >= 30) return '#f97316';
    return '#ef4444';
  };
  
  return (
    <div className="sentiment-card">
      <div className="sentiment-header">
        <h3>🌍 Global Market Sentiment</h3>
        <span className="timeframe-badge">{getTimeframeLabel(timeframe)}</span>
      </div>
      
      <div className="sentiment-gauge">
        <div className="gauge-container">
          <div 
            className="gauge-fill" 
            style={{ 
              width: `${score}%`,
              backgroundColor: getGaugeColor(score)
            }}
          />
          <span className="gauge-score">{score.toFixed(1)}%</span>
        </div>
        <div className="gauge-label" style={{ color: getGaugeColor(score) }}>
          {label}
        </div>
      </div>
      
      <div className="sentiment-details">
        <div className="detail-item">
          <span className="detail-label">📊 Breadth</span>
          <span className="detail-value">
            <span className="positive">{breadth.positive}</span>
            {' / '}
            <span className="negative">{breadth.negative}</span>
            {' markets '}
            ({breadth.percentage}% positive)
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">😰 VIX</span>
          <span className="detail-value">
            {vix.value ? `${vix.value.toFixed(2)} - ${vix.status}` : 'N/A'}
          </span>
        </div>
        
        <div className="detail-item factors">
          <span className="detail-label">📈 Factors</span>
          <div className="factor-bars">
            <div className="factor">
              <span>Breadth</span>
              <div className="factor-bar">
                <div style={{ width: `${factors.breadth_score}%` }} />
              </div>
              <span>{factors.breadth_score}</span>
            </div>
            <div className="factor">
              <span>Weighted</span>
              <div className="factor-bar">
                <div style={{ width: `${factors.weighted_return_score}%` }} />
              </div>
              <span>{factors.weighted_return_score}</span>
            </div>
            <div className="factor">
              <span>VIX</span>
              <div className="factor-bar">
                <div style={{ width: `${factors.vix_score}%` }} />
              </div>
              <span>{factors.vix_score}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketSection = ({ title, emoji, markets }) => {
  if (!markets || markets.length === 0) return null;
  
  return (
    <div className="market-section">
      <h3 className="section-title">{emoji} {title}</h3>
      <div className="market-grid">
        {markets.map((market) => {
          const { change, pct, className } = formatChange(market.change, market.change_pct);
          return (
            <div key={market.symbol} className={`market-card ${className}`}>
              <div className="market-header">
                <span className="market-short">{market.short}</span>
                {market.error && <span className="error-badge">!</span>}
              </div>
              <div className="market-price">{formatPrice(market.price)}</div>
              <div className={`market-change ${className}`}>
                <span className="change-value">{change}</span>
                <span className="change-pct">{pct}</span>
              </div>
              <div className="market-name">{market.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Get timeframe label for display
const getTimeframeLabel = (tf) => {
  const labels = {
    '1h': '1 Hour',
    '4h': '4 Hours',
    'daily': 'Daily',
    'weekly': 'Weekly',
    'monthly': 'Monthly'
  };
  return labels[tf] || tf;
};

const GlobalMarkets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('daily');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGlobalMarkets(timeframe);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page global-markets-page">
      <div className="page-header">
        <h2>Global Markets Overview</h2>
        <p className="page-desc">
          World market indices & sentiment analysis
        </p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Timeframe</label>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            disabled={loading}
          >
            {TIMEFRAMES.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>&nbsp;</label>
          <button 
            className="btn btn-primary" 
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {loading && <Loader message="Fetching global market data..." />}

      {!loading && !error && data && (
        <>
          <SentimentGauge sentiment={data.sentiment} timeframe={timeframe} />
          
          {/* View Toggle */}
          <div className="view-toggle">
            <button 
              className={viewMode === 'card' ? 'active' : ''}
              onClick={() => setViewMode('card')}
            >
              📊 Cards
            </button>
            <button 
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              📋 Table
            </button>
          </div>
          
          <div className="markets-container">
            {viewMode === 'card' ? (
              <>
                <MarketSection 
                  title="US Markets" 
                  emoji="🇺🇸" 
                  markets={data.us_markets} 
                />
                
                <MarketSection 
                  title="European Markets" 
                  emoji="🇪🇺" 
                  markets={data.european_markets} 
                />
                
                <MarketSection 
                  title="Asian Markets" 
                  emoji="🌏" 
                  markets={data.asian_markets} 
                />
                
                <MarketSection 
                  title="India ADRs" 
                  emoji="🇮🇳" 
                  markets={data.india_adrs} 
                />
                
                <MarketSection 
                  title="Commodities" 
                  emoji="🪙" 
                  markets={data.commodities} 
                />
              </>
            ) : (
              <>
                <MarketTable 
                  title="US Markets" 
                  emoji="🇺🇸" 
                  markets={data.us_markets} 
                />
                
                <MarketTable 
                  title="European Markets" 
                  emoji="🇪🇺" 
                  markets={data.european_markets} 
                />
                
                <MarketTable 
                  title="Asian Markets" 
                  emoji="🌏" 
                  markets={data.asian_markets} 
                />
                
                <MarketTable 
                  title="India ADRs" 
                  emoji="🇮🇳" 
                  markets={data.india_adrs} 
                />
                
                <MarketTable 
                  title="Commodities" 
                  emoji="🪙" 
                  markets={data.commodities} 
                />
              </>
            )}
          </div>

          <div className="last-updated">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
        </>
      )}

      {!loading && !error && !data && (
        <div className="no-data">
          Click Refresh to load global market data
        </div>
      )}
    </div>
  );
};

export default GlobalMarkets;
