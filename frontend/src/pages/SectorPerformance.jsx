/**
 * Sector Performance Page
 */

import React, { useState, useEffect } from 'react';
import { getSectorPerformance } from '../api/scanner';
import Filters from '../components/Filters';
import BenchmarkCard from '../components/BenchmarkCard';
import CategoryView from '../components/CategoryView';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';

const SectorPerformance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [indexGroup, setIndexGroup] = useState('sectorial');
  const [timeframe, setTimeframe] = useState('weekly');
  const [viewMode, setViewMode] = useState('category'); // 'category' or 'ranked'

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSectorPerformance(indexGroup, timeframe);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="page sector-performance">
      <div className="page-header">
        <h2>Sector Performance</h2>
        <p className="page-desc">Relative strength of sectors vs NIFTY 50</p>
      </div>

      <Filters
        showIndexGroup={true}
        indexGroup={indexGroup}
        onIndexGroupChange={setIndexGroup}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onRefresh={fetchData}
        loading={loading}
      />

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {loading && <Loader message="Fetching sector data..." />}

      {!loading && !error && data && (
        <>
          <BenchmarkCard benchmark={data.benchmark} timeframe={timeframe} />

          <div className="view-toggle">
            <button 
              className={viewMode === 'category' ? 'active' : ''}
              onClick={() => setViewMode('category')}
            >
              Categorized
            </button>
            <button 
              className={viewMode === 'ranked' ? 'active' : ''}
              onClick={() => setViewMode('ranked')}
            >
              Ranked
            </button>
          </div>

          {viewMode === 'category' ? (
            <CategoryView
              outperforming={data.outperforming}
              neutral={data.neutral}
              underperforming={data.underperforming}
              type="sector"
              timeframe={timeframe}
            />
          ) : (
            <DataTable 
              data={data.sectors} 
              type="sector" 
              timeframe={timeframe}
              showRank={true}
            />
          )}

          <div className="last-updated">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
};

export default SectorPerformance;
