/**
 * Performance Overview Page - Unified Sortable Table
 * Shows all sectors across ALL timeframes in one sortable table
 */

import { useState, useMemo } from 'react';
import { getTopPerformers, getSectorStocks } from '../api/scanner';
import Loader from '../components/Loader';

const TIMEFRAMES = ['3M', 'M', 'W', 'D', '4H', '1H'];
const TF_KEY_MAP = { '3M': 'three_month', 'M': 'monthly', 'W': 'weekly', 'D': 'daily', '4H': 'four_hour', '1H': 'one_hour' };

const INDEX_GROUPS = [
  { value: 'all', label: 'All Indices' },
  { value: 'sectorial', label: 'Sectorial' },
  { value: 'broad_market', label: 'Broad Market' },
  { value: 'thematic', label: 'Thematic' }
];

const PerformanceOverview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [limit, setLimit] = useState(10);
  const [lookback, setLookback] = useState(1);
  const [indexGroup, setIndexGroup] = useState('all');

  // Sorting state
  const [sortColumn, setSortColumn] = useState('W');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSector, setModalSector] = useState(null);
  const [stocksData, setStocksData] = useState(null);
  const [stocksLoading, setStocksLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch more data than limit to allow sorting across all
      const result = await getTopPerformers(50, indexGroup, lookback);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Build unified sector list from all categories
  const allSectors = useMemo(() => {
    if (!data) return [];

    const sectorsMap = new Map();

    // Combine all categories
    ['outperforming', 'neutral', 'underperforming'].forEach(category => {
      if (!data[category]) return;

      TIMEFRAMES.forEach(tf => {
        const items = data[category][tf] || [];
        items.forEach(item => {
          if (!sectorsMap.has(item.name)) {
            sectorsMap.set(item.name, {
              name: item.name,
              symbol: item.symbol,
              values: {}
            });
          }
          sectorsMap.get(item.name).values[tf] = item.rs;
        });
      });
    });

    return Array.from(sectorsMap.values());
  }, [data]);

  // Sort and limit sectors
  const sortedSectors = useMemo(() => {
    if (allSectors.length === 0) return [];

    const sorted = [...allSectors].sort((a, b) => {
      const aVal = a.values[sortColumn] ?? -999;
      const bVal = b.values[sortColumn] ?? -999;

      if (sortDirection === 'desc') {
        return bVal - aVal;
      }
      return aVal - bVal;
    });

    return sorted.slice(0, limit);
  }, [allSectors, sortColumn, sortDirection, limit]);

  // Handle column sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const openStocksModal = async (sectorName) => {
    setModalSector(sectorName);
    setModalOpen(true);
    setStocksLoading(true);
    setStocksData(null);

    try {
      const result = await getSectorStocks(sectorName, 'weekly', lookback);
      setStocksData(result);
    } catch (err) {
      console.error('Failed to fetch stocks:', err);
    } finally {
      setStocksLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSector(null);
    setStocksData(null);
  };

  // Get RS color based on value
  const getRsColor = (value) => {
    if (value === null || value === undefined) return 'neutral';
    if (value > 3) return 'strong-positive';
    if (value > 1) return 'positive';
    if (value < -3) return 'strong-negative';
    if (value < -1) return 'negative';
    return 'neutral';
  };

  // Format RS value with 2 decimal places and % symbol
  const formatRs = (value) => {
    if (value === null || value === undefined) return '-';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Get status based on Weekly RS
  const getStatus = (weeklyRs) => {
    if (weeklyRs === null || weeklyRs === undefined) return 'neutral';
    if (weeklyRs > 1) return 'outperforming';
    if (weeklyRs < -1) return 'underperforming';
    return 'neutral';
  };

  // Render sort indicator
  const renderSortIndicator = (column) => {
    if (sortColumn !== column) {
      return <span className="sort-icon inactive">↕</span>;
    }
    return <span className="sort-icon active">{sortDirection === 'desc' ? '↓' : '↑'}</span>;
  };

  // Render stocks modal
  const renderModal = () => {
    if (!modalOpen) return null;

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>📈 {modalSector} - Top Stocks</h3>
            <button className="modal-close" onClick={closeModal}>✕</button>
          </div>

          <div className="modal-body">
            {stocksLoading && (
              <div className="modal-loading">Loading stocks...</div>
            )}

            {!stocksLoading && stocksData && stocksData.stocks && (
              <>
                <div className="modal-table-wrapper">
                  <table className="stocks-modal-table">
                    <thead>
                      <tr>
                        <th className="stock-col">Stock</th>
                        {TIMEFRAMES.map(tf => (
                          <th key={tf} className="tf-col">{tf}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stocksData.stocks.slice(0, 10).map((stock, idx) => (
                        <tr key={stock.symbol} className={`stock-row ${stock.status}`}>
                          <td className="stock-cell">
                            <span className="stock-rank">{idx + 1}</span>
                            <span className={`stock-indicator ${stock.status}`}>
                              {stock.status === 'outperforming' ? '🟢' :
                                stock.status === 'underperforming' ? '🔴' : '⚪'}
                            </span>
                            <span className="stock-name">{stock.name}</span>
                          </td>
                          {TIMEFRAMES.map(tf => {
                            const tfKey = TF_KEY_MAP[tf];
                            const rs = stock.relative_strength?.[tfKey];
                            return (
                              <td
                                key={tf}
                                className={`rs-cell ${getRsColor(rs)}`}
                              >
                                {formatRs(rs)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="modal-legend">
                  <span>🟢 Outperforming (RS &gt; 1%)</span>
                  <span>⚪ Neutral</span>
                  <span>🔴 Underperforming (RS &lt; -1%)</span>
                </div>
              </>
            )}

            {!stocksLoading && (!stocksData || !stocksData.stocks) && (
              <div className="modal-empty">No stocks data available</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="perf-overview">
      {/* Header */}
      <div className="perf-overview-header">
        <div className="perf-overview-title">
          <h2>📊 Performance Overview</h2>
          <p>
            {INDEX_GROUPS.find(g => g.value === indexGroup)?.label || 'All'} vs NIFTY 50 • Sorted by {sortColumn} {sortDirection === 'desc' ? '↓' : '↑'}
            {data && <span className="lookback-badge">Lookback: {data.lookback || lookback}</span>}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="perf-overview-controls">
        <div className="control-group">
          <label>Index Group</label>
          <select
            value={indexGroup}
            onChange={(e) => setIndexGroup(e.target.value)}
          >
            {INDEX_GROUPS.map(g => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Show Top</label>
          <input
            type="number"
            min="1"
            max="50"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
          />
        </div>

        <div className="control-group">
          <label>Lookback</label>
          <input
            type="number"
            min="1"
            max="99"
            value={lookback}
            onChange={(e) => setLookback(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
            title="Compare current vs N periods back"
          />
          <span className="lookback-hint">periods</span>
        </div>

        <button className="refresh-btn" onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="perf-error">
          <span>{error}</span>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && <Loader message="Loading all timeframes..." />}

      {/* Empty State */}
      {!loading && !error && !data && (
        <div className="perf-empty">
          <div className="perf-empty-icon">📊</div>
          <p>Click <strong>Refresh</strong> to load sector performance</p>
        </div>
      )}

      {/* Unified Table */}
      {!loading && data && (
        <div className="perf-overview-content">
          <div className="perf-table-wrapper">
            <table className="perf-table">
              <thead>
                <tr>
                  <th className="rank-col">#</th>
                  <th className="sector-col">Index / Sector</th>
                  {TIMEFRAMES.map(tf => (
                    <th
                      key={tf}
                      className={`tf-col sortable ${sortColumn === tf ? 'sorted' : ''}`}
                      onClick={() => handleSort(tf)}
                    >
                      {tf} {renderSortIndicator(tf)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedSectors.map((row, idx) => {
                  const status = getStatus(row.values['W']);
                  return (
                    <tr
                      key={row.name}
                      className={`perf-row ${status}`}
                      onClick={() => openStocksModal(row.name)}
                    >
                      <td className="rank-cell">{idx + 1}</td>
                      <td className="sector-cell">
                        <span className={`status-dot ${status}`}>
                          {status === 'outperforming' ? '🟢' :
                            status === 'underperforming' ? '🔴' : '⚪'}
                        </span>
                        <span className="sector-name">{row.name}</span>
                        <span className="sector-arrow">▶</span>
                      </td>
                      {TIMEFRAMES.map(tf => (
                        <td
                          key={tf}
                          className={`rs-cell ${getRsColor(row.values[tf])} ${sortColumn === tf ? 'sorted-col' : ''}`}
                        >
                          {formatRs(row.values[tf])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="perf-footer">
            <div className="perf-legend">
              <span>🟢 Outperforming (RS &gt; 1%)</span>
              <span>⚪ Neutral (-1% to +1%)</span>
              <span>🔴 Underperforming (RS &lt; -1%)</span>
            </div>
            <div className="perf-help">
              💡 Click any row to see top stocks • Click column headers to sort
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default PerformanceOverview;
