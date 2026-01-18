/**
 * Data Table Component - Reusable table for sectors/stocks
 */

import React from 'react';

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

const formatRS = (value) => {
  if (value === null || value === undefined) return '-';
  const formatted = value.toFixed(2);
  const className = value > 1 ? 'positive' : value < -1 ? 'negative' : '';
  return <span className={className}>{value > 0 ? '+' : ''}{formatted}%</span>;
};

const StatusBadge = ({ status }) => {
  const className = `status-badge status-${status}`;
  const label = status === 'outperforming' ? 'Outperforming' : 
                status === 'underperforming' ? 'Underperforming' : 'Neutral';
  return <span className={className}>{label}</span>;
};

const DataTable = ({ 
  data = [], 
  type = 'sector', // 'sector' or 'stock'
  timeframe = 'weekly',
  showRank = true 
}) => {
  if (!data || data.length === 0) {
    return <div className="no-data">No data available</div>;
  }

  // Map timeframe to key
  const tfKey = {
    '1h': 'one_hour',
    '4h': 'four_hour',
    'daily': 'daily',
    'weekly': 'weekly',
    'monthly': 'monthly',
    '3m': 'three_month'
  }[timeframe] || 'weekly';

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {showRank && <th>#</th>}
            <th>{type === 'sector' ? 'Sector' : 'Stock'}</th>
            <th>Symbol</th>
            <th>Price</th>
            <th>Return</th>
            <th>RS vs Nifty</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.symbol || index}>
              {showRank && <td className="rank">{item.rank || index + 1}</td>}
              <td className="name">{item.name}</td>
              <td className="symbol">{item.symbol}</td>
              <td className="price">₹{formatNumber(item.price)}</td>
              <td className="return">
                {formatReturn(item.returns?.[tfKey])}
              </td>
              <td className="rs">
                {formatRS(item.relative_strength?.[tfKey])}
              </td>
              <td className="status">
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
