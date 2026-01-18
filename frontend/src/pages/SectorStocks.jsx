/**
 * Sector Stocks Page
 */

import React, { useState, useEffect } from 'react';
import { getSectorsList, getSectorStocks } from '../api/scanner';
import Filters from '../components/Filters';
import BenchmarkCard from '../components/BenchmarkCard';
import CategoryView from '../components/CategoryView';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';

const SectorStocks = () => {
  const [loading, setLoading] = useState(false);
  const [sectorsLoading, setSectorsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState('');
  const [timeframe, setTimeframe] = useState('weekly');
  const [viewMode, setViewMode] = useState('category');

  // Load sectors list on mount
  useEffect(() => {
    const loadSectors = async () => {
      try {
        const result = await getSectorsList();
        setSectors(result.sectors || []);
        if (result.sectors?.length > 0) {
          setSelectedSector(result.sectors[0]);
        }
      } catch (err) {
        console.error('Failed to load sectors:', err);
      } finally {
        setSectorsLoading(false);
      }
    };
    loadSectors();
  }, []);

  const fetchData = async () => {
    if (!selectedSector) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await getSectorStocks(selectedSector, timeframe);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when sector changes
  useEffect(() => {
    if (selectedSector) {
      fetchData();
    }
  }, [selectedSector]);

  if (sectorsLoading) {
    return <Loader message="Loading sectors..." />;
  }

  return (
    <div className="page sector-stocks">
      <div className="page-header">
        <h2>Sector Stocks</h2>
        <p className="page-desc">Individual stock performance within sectors</p>
      </div>

      <Filters
        showIndexGroup={false}
        showSectorSelect={true}
        sectors={sectors}
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
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

      {loading && <Loader message={`Fetching ${selectedSector} stocks...`} />}

      {!loading && !error && data && (
        <>
          <BenchmarkCard benchmark={data.benchmark} timeframe={timeframe} />

          <div className="sector-summary">
            <span className="sector-name">{data.sector_name}</span>
            <span className="stock-count">{data.total_stocks} stocks</span>
          </div>

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
              type="stock"
              timeframe={timeframe}
            />
          ) : (
            <DataTable 
              data={data.stocks} 
              type="stock" 
              timeframe={timeframe}
              showRank={true}
            />
          )}

          <div className="last-updated">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
        </>
      )}

      {!loading && !error && !data && selectedSector && (
        <div className="no-data">
          Select a sector and click Refresh to load data
        </div>
      )}
    </div>
  );
};

export default SectorStocks;
