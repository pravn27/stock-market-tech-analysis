/**
 * Filters Component
 */

import React from 'react';
import { TIMEFRAMES, INDEX_GROUPS } from '../api/config';

const Filters = ({ 
  showIndexGroup = true,
  indexGroup, 
  onIndexGroupChange, 
  timeframe, 
  onTimeframeChange,
  lookback = 1,
  onLookbackChange,
  sectors = [],
  selectedSector,
  onSectorChange,
  showSectorSelect = false,
  onRefresh,
  loading = false
}) => {
  return (
    <div className="filters">
      {showIndexGroup && (
        <div className="filter-group">
          <label>Index Group</label>
          <select 
            value={indexGroup} 
            onChange={(e) => onIndexGroupChange(e.target.value)}
            disabled={loading}
          >
            {INDEX_GROUPS.map(g => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
      )}
      
      {showSectorSelect && (
        <div className="filter-group">
          <label>Index / Sector</label>
          <select 
            value={selectedSector} 
            onChange={(e) => onSectorChange(e.target.value)}
            disabled={loading}
          >
            <option value="">Select Index / Sector</option>
            {sectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
      
      <div className="filter-group">
        <label>Timeframe</label>
        <select 
          value={timeframe} 
          onChange={(e) => onTimeframeChange(e.target.value)}
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
            onLookbackChange(Math.max(1, Math.min(val, 99)));
          }}
          min="1"
          max="99"
          disabled={loading}
          title="Compare with N periods back (1 = previous period)"
        />
      </div>
      
      <div className="filter-group">
        <label>&nbsp;</label>
        <button 
          className="btn btn-primary" 
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default Filters;
