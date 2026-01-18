/**
 * Benchmark Card Component - Shows NIFTY 50 info
 */

import React from 'react';

const formatReturn = (value) => {
  if (value === null || value === undefined) return '-';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const BenchmarkCard = ({ benchmark, timeframe = 'weekly' }) => {
  if (!benchmark) return null;

  const tfKey = {
    '1h': 'one_hour',
    '4h': 'four_hour',
    'daily': 'daily',
    'weekly': 'weekly',
    'monthly': 'monthly',
    '3m': 'three_month'
  }[timeframe] || 'weekly';

  const returnValue = benchmark.returns?.[tfKey];
  const returnClass = returnValue > 0 ? 'positive' : returnValue < 0 ? 'negative' : '';

  return (
    <div className="benchmark-card">
      <div className="benchmark-info">
        <span className="benchmark-label">Benchmark</span>
        <span className="benchmark-name">{benchmark.name}</span>
      </div>
      <div className="benchmark-price">
        <span className="price-label">Price</span>
        <span className="price-value">₹{benchmark.price?.toFixed(2)}</span>
      </div>
      <div className="benchmark-return">
        <span className="return-label">Return</span>
        <span className={`return-value ${returnClass}`}>
          {formatReturn(returnValue)}
        </span>
      </div>
    </div>
  );
};

export default BenchmarkCard;
