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
          <label>Sector</label>
          <select 
            value={selectedSector} 
            onChange={(e) => onSectorChange(e.target.value)}
            disabled={loading}
          >
            <option value="">Select Sector</option>
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
