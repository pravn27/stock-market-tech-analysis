/**
 * Performance Overview Page - Heatmap Matrix with Modal
 * Shows all sectors across ALL timeframes in one view
 */

import { useState } from 'react';
import { getTopPerformers, getSectorStocks } from '../api/scanner';
import Loader from '../components/Loader';

const TIMEFRAMES = ['3M', 'M', 'W', 'D', '4H', '1H'];
const TF_MAP = { '3M': '3m', 'M': 'monthly', 'W': 'weekly', 'D': 'daily', '4H': '4h', '1H': '1h' };
const TF_KEY_MAP = { '3M': 'three_month', 'M': 'monthly', 'W': 'weekly', 'D': 'daily', '4H': 'four_hour', '1H': 'one_hour' };

const PerformanceOverview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [limit, setLimit] = useState(5);
  const [lookback, setLookback] = useState(1);
  const [showNeutral, setShowNeutral] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSector, setModalSector] = useState(null);
  const [stocksData, setStocksData] = useState(null);
  const [stocksLoading, setStocksLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTopPerformers(limit, 'all', lookback);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const openStocksModal = async (sectorName) => {
    setModalSector(sectorName);
    setModalOpen(true);
    setStocksLoading(true);
    setStocksData(null);

    try {
      // Fetch stocks with same lookback as main data
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

  // Get sector data for a specific timeframe
  const getSectorForTimeframe = (category, tf, index) => {
    if (!data || !data[category] || !data[category][tf]) return null;
    return data[category][tf][index] || null;
  };

  // Build unified sector list with all timeframe data
  const buildSectorRows = (category) => {
    if (!data || !data[category]) return [];

    // Get all unique sectors from first timeframe that has data
    const sectorsMap = new Map();

    TIMEFRAMES.forEach(tf => {
      const items = data[category][tf] || [];
      items.forEach((item, idx) => {
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

    // Convert to array and limit
    return Array.from(sectorsMap.values()).slice(0, limit);
  };

  // Render heatmap table for a category
  const renderHeatmapTable = (category, title, icon, colorClass) => {
    const rows = buildSectorRows(category);

    if (rows.length === 0) {
      return (
        <div className={`heatmap-section ${colorClass}`}>
          <div className="heatmap-header">
            <span className="heatmap-icon">{icon}</span>
            <h3>{title}</h3>
            <span className="heatmap-count">0</span>
          </div>
          <div className="heatmap-empty">No sectors in this category</div>
        </div>
      );
    }

    return (
      <div className={`heatmap-section ${colorClass}`}>
        <div className="heatmap-header">
          <span className="heatmap-icon">{icon}</span>
          <h3>{title}</h3>
          <span className="heatmap-count">{rows.length}</span>
        </div>
        <div className="heatmap-table-wrapper">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th className="sector-col">Sector</th>
                {TIMEFRAMES.map(tf => (
                  <th key={tf} className="tf-col">{tf}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.name}
                  className="heatmap-row"
                  onClick={() => openStocksModal(row.name)}
                >
                  <td className="sector-cell">
                    <span className="sector-rank">{idx + 1}</span>
                    <span className="sector-name">{row.name}</span>
                    <span className="sector-arrow">▶</span>
                  </td>
                  {TIMEFRAMES.map(tf => (
                    <td
                      key={tf}
                      className={`rs-cell ${getRsColor(row.values[tf])}`}
                    >
                      {formatRs(row.values[tf])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render stocks modal
  const renderModal = () => {
    if (!modalOpen) return null;

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>📈 {modalSector} - Top {limit} Stocks</h3>
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
                      {stocksData.stocks.slice(0, limit).map((stock, idx) => (
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
    <div className="perf-heatmap">
      {/* Header */}
      <div className="perf-heatmap-header">
        <div className="perf-heatmap-title">
          <h2>📊 Performance Overview</h2>
          <p>
            All sectors vs NIFTY 50 across timeframes
            {data && <span className="lookback-badge">Lookback: {data.lookback || lookback} period{(data.lookback || lookback) > 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="perf-heatmap-controls">
        <div className="control-group">
          <label>Show Top</label>
          <input
            type="number"
            min="1"
            max="20"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
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
            title="Compare current vs N periods back (1=previous, 2=2 periods back)"
          />
          <span className="lookback-hint">periods</span>
        </div>

        <label className="toggle-neutral">
          <input
            type="checkbox"
            checked={showNeutral}
            onChange={(e) => setShowNeutral(e.target.checked)}
          />
          <span>Show Neutral</span>
        </label>

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

      {/* Heatmap Tables */}
      {!loading && data && (
        <div className="perf-heatmap-content">
          {renderHeatmapTable('outperforming', 'Outperforming', '🟢', 'section-green')}
          {showNeutral && renderHeatmapTable('neutral', 'Neutral', '⚪', 'section-gray')}
          {renderHeatmapTable('underperforming', 'Underperforming', '🔴', 'section-red')}

          <div className="perf-help">
            💡 Click any sector row to see its top stocks across all timeframes
          </div>
        </div>
      )}

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default PerformanceOverview;
