/**
 * Nifty 50 Heavyweight Stocks Page
 * Shows major stocks that drive Nifty 50 index movement with their weightage
 */

import React, { useState } from 'react';
import { getNifty50Heavyweights } from '../api/scanner';
import { TIMEFRAMES } from '../api/config';
import BenchmarkCard from '../components/BenchmarkCard';
import Loader from '../components/Loader';

const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return '-';
  return num.toFixed(decimals);
};

const formatReturn = (value) => {
  if (value === null || value === undefined) return '-';
  const formatted = value.toFixed(2);
  const className = value > 0 ? 'positive' : value < 0 ? 'negative' : '';
  return <span className={className}>{value > 0 ? '+' : ''}{formatted}%</span>;
};

const StatusBadge = ({ status }) => {
  const className = `status-badge status-${status}`;
  const label = status === 'outperforming' ? 'Outperforming' : 
                status === 'underperforming' ? 'Underperforming' : 'Neutral';
  return <span className={className}>{label}</span>;
};

const Nifty50 = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('weekly');
  const [lookback, setLookback] = useState(1);
  const [topOnly, setTopOnly] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNifty50Heavyweights(timeframe, lookback, topOnly);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Get timeframe key for display
  const tfKey = {
    '1h': 'one_hour',
    '4h': 'four_hour',
    'daily': 'daily',
    'weekly': 'weekly',
    'monthly': 'monthly',
    '3m': 'three_month'
  }[timeframe] || 'weekly';

  return (
    <div className="page nifty50-page">
      <div className="page-header">
        <h2>Nifty 50 Heavyweight Stocks</h2>
        <p className="page-desc">
          Major heavyweight stocks relative comparison for moving of Nifty 50 price
        </p>
      </div>

      {/* Filters */}
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
          <label>Lookback</label>
          <input 
            type="number"
            className="lookback-input"
            value={lookback} 
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setLookback(Math.max(1, Math.min(val, 99)));
            }}
            min="1"
            max="99"
            disabled={loading}
            title="Compare with N periods back (1 = previous period)"
          />
        </div>

        <div className="filter-group">
          <label>Show</label>
          <select 
            value={topOnly ? 'top20' : 'all'} 
            onChange={(e) => setTopOnly(e.target.value === 'top20')}
            disabled={loading}
          >
            <option value="all">All 50 Stocks</option>
            <option value="top20">Top 20 Heavyweights</option>
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

      {loading && <Loader message="Fetching Nifty 50 heavyweight data..." />}

      {!loading && !error && data && (
        <>
          <BenchmarkCard benchmark={data.benchmark} timeframe={timeframe} />

          {/* Weightage Summary */}
          <div className="weightage-summary">
            <div className="summary-card outperforming">
              <span className="label">Outperforming</span>
              <span className="count">{data.outperforming?.length || 0} stocks</span>
              <span className="weightage">{data.outperforming_weightage}% weightage</span>
            </div>
            <div className="summary-card neutral">
              <span className="label">Neutral</span>
              <span className="count">{data.neutral?.length || 0} stocks</span>
              <span className="weightage">{(data.total_weightage - data.outperforming_weightage - data.underperforming_weightage).toFixed(2)}% weightage</span>
            </div>
            <div className="summary-card underperforming">
              <span className="label">Underperforming</span>
              <span className="count">{data.underperforming?.length || 0} stocks</span>
              <span className="weightage">{data.underperforming_weightage}% weightage</span>
            </div>
          </div>

          {/* Data Table */}
          <div className="table-container">
            <table className="data-table nifty50-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Stock</th>
                  <th>Symbol</th>
                  <th>Weightage %</th>
                  <th>Price</th>
                  <th>Return</th>
                  <th>RS vs Nifty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.stocks?.map((stock, index) => (
                  <tr key={stock.symbol}>
                    <td className="rank">{stock.rank || index + 1}</td>
                    <td className="name">{stock.name}</td>
                    <td className="symbol">{stock.symbol.replace('.NS', '')}</td>
                    <td className="weightage">
                      <span className="weightage-bar" style={{width: `${Math.min(stock.weightage * 5, 100)}%`}}></span>
                      <span className="weightage-value">{stock.weightage.toFixed(2)}%</span>
                    </td>
                    <td className="price">₹{formatNumber(stock.price)}</td>
                    <td className="return">{formatReturn(stock.returns?.[tfKey])}</td>
                    <td className="rs">{formatReturn(stock.relative_strength?.[tfKey])}</td>
                    <td className="status"><StatusBadge status={stock.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="last-updated">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
        </>
      )}

      {!loading && !error && !data && (
        <div className="no-data">
          Click Refresh to load Nifty 50 heavyweight stocks data
        </div>
      )}
    </div>
  );
};

export default Nifty50;
