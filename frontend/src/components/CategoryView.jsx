/**
 * Category View Component - Shows data grouped by status
 */

import React from 'react';
import DataTable from './DataTable';

const CategoryView = ({ 
  outperforming = [], 
  neutral = [], 
  underperforming = [],
  type = 'sector',
  timeframe = 'weekly'
}) => {
  return (
    <div className="category-view">
      {/* Outperforming */}
      <div className="category-section">
        <h3 className="category-title outperforming">
          <span className="dot"></span>
          Outperforming ({outperforming.length})
        </h3>
        {outperforming.length > 0 ? (
          <DataTable data={outperforming} type={type} timeframe={timeframe} showRank={false} />
        ) : (
          <div className="no-data">None</div>
        )}
      </div>

      {/* Neutral */}
      <div className="category-section">
        <h3 className="category-title neutral">
          <span className="dot"></span>
          Neutral ({neutral.length})
        </h3>
        {neutral.length > 0 ? (
          <DataTable data={neutral} type={type} timeframe={timeframe} showRank={false} />
        ) : (
          <div className="no-data">None</div>
        )}
      </div>

      {/* Underperforming */}
      <div className="category-section">
        <h3 className="category-title underperforming">
          <span className="dot"></span>
          Underperforming ({underperforming.length})
        </h3>
        {underperforming.length > 0 ? (
          <DataTable data={underperforming} type={type} timeframe={timeframe} showRank={false} />
        ) : (
          <div className="no-data">None</div>
        )}
      </div>
    </div>
  );
};

export default CategoryView;
