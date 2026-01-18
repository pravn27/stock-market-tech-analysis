/**
 * Dow Theory Scanner Page
 * Multi-Timeframe Analysis: Super TIDE, TIDE, WAVE, RIPPLE
 * Shows "Where Do You Stand?" in the overall trend context
 */

import { useState, useEffect } from 'react';
import { scanDowTheory, getDowTheoryAnalysis } from '../api/scanner';
import Loader from '../components/Loader';

const FILTERS = [
  { value: 'all', label: 'All Stocks' },
  { value: 'strong_buy', label: '🟢 Strong Buy' },
  { value: 'pullback_buy', label: '🟡 Pullback Buy' },
  { value: 'intraday_buy', label: '🔵 Intraday Buy' },
  { value: 'bearish', label: '🔴 Bearish' },
  { value: 'wait', label: '⚪ Wait / No Trade' },
];

const MTF_GROUPS = [
  { key: 'super_tide', name: 'Super TIDE', timeframes: ['monthly', 'weekly'] },
  { key: 'tide', name: 'TIDE', timeframes: ['daily', '4h'] },
  { key: 'wave', name: 'WAVE', timeframes: ['4h', '1h'] },
  { key: 'ripple', name: 'RIPPLE', timeframes: ['1h', '15m'] },
];

const TF_LABELS = {
  monthly: 'M',
  weekly: 'W',
  daily: 'D',
  '4h': '4H',
  '1h': '1H',
  '15m': '15M',
};

const DowTheoryScanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Single stock detail modal
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockDetail, setStockDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await scanDowTheory('nifty50', filter, null, 50);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const openStockDetail = async (symbol) => {
    setSelectedStock(symbol);
    setDetailLoading(true);
    setStockDetail(null);
    
    try {
      const result = await getDowTheoryAnalysis(symbol);
      setStockDetail(result);
    } catch (err) {
      console.error('Failed to fetch stock detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeStockDetail = () => {
    setSelectedStock(null);
    setStockDetail(null);
  };

  // Get color class for trend
  const getTrendColor = (color) => {
    const colorMap = {
      green: 'trend-green',
      lightgreen: 'trend-lightgreen',
      red: 'trend-red',
      orange: 'trend-orange',
      yellow: 'trend-yellow',
      gray: 'trend-gray',
      cyan: 'trend-cyan',
      pink: 'trend-pink',
    };
    return colorMap[color] || 'trend-gray';
  };

  // Get emoji for trend
  const getTrendEmoji = (trend) => {
    if (!trend) return '⚪';
    if (trend === 'HH-HL') return '🟢';
    if (trend === 'LL-LH') return '🔴';
    if (trend === 'LL→HL') return '🟡';  // Transition up
    if (trend === 'HH→LH') return '🟠';  // Transition down
    if (trend === 'Sideways') return '⚪';
    return '⚪';
  };

  // Get trend label display
  const getTrendLabel = (tf) => {
    if (!tf) return '-';
    const high = tf.last_high_label || '-';
    const low = tf.last_low_label || '-';
    return `${high}/${low}`;
  };

  // Render single stock detail modal
  const renderDetailModal = () => {
    if (!selectedStock) return null;

    return (
      <div className="modal-overlay" onClick={closeStockDetail}>
        <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>📈 {selectedStock} - Dow Theory Analysis</h3>
            <button className="modal-close" onClick={closeStockDetail}>✕</button>
          </div>

          <div className="modal-body">
            {detailLoading && (
              <div className="modal-loading">Analyzing timeframes...</div>
            )}

            {!detailLoading && stockDetail && (
              <div className="dow-detail">
                {/* MTF Groups Summary */}
                <div className="dow-mtf-summary">
                  {MTF_GROUPS.map(group => {
                    const groupData = stockDetail.mtf_groups?.[group.key];
                    if (!groupData) return null;
                    
                    return (
                      <div key={group.key} className={`mtf-group-card ${getTrendColor(groupData.color)}`}>
                        <div className="mtf-group-name">{groupData.name}</div>
                        <div className="mtf-group-trend">{groupData.trend}</div>
                        <div className="mtf-group-purpose">{groupData.purpose}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Opportunity */}
                {stockDetail.opportunity && (
                  <div className={`dow-opportunity ${getTrendColor(stockDetail.opportunity.color)}`}>
                    <div className="opp-type">{stockDetail.opportunity.type}</div>
                    <div className="opp-strategy">Strategy: {stockDetail.opportunity.strategy}</div>
                    <div className="opp-desc">{stockDetail.opportunity.description}</div>
                  </div>
                )}

                {/* Timeframe Details Table */}
                <div className="dow-tf-table">
                  <h4>Timeframe Breakdown</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Timeframe</th>
                        <th>Trend</th>
                        <th>Confidence</th>
                        <th>Swing Highs</th>
                        <th>Swing Lows</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stockDetail.timeframes || {}).map(([key, tf]) => (
                        <tr key={key} className={getTrendColor(tf.color)}>
                          <td className="tf-label">{tf.label}</td>
                          <td className="tf-trend">
                            {getTrendEmoji(tf.trend)} {tf.trend}
                          </td>
                          <td className="tf-confidence">{tf.confidence}%</td>
                          <td className="tf-swings">{tf.swings?.highs?.join(' → ') || '-'}</td>
                          <td className="tf-swings">{tf.swings?.lows?.join(' → ') || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="dow-legend">
                  <span>🟢 HH-HL = Uptrend</span>
                  <span>🔴 LL-LH = Downtrend</span>
                  <span>🟡 HLs-LHs = Sideways</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dow-scanner">
      {/* Header */}
      <div className="dow-header">
        <div className="dow-title">
          <h2>📊 Dow Theory Scanner</h2>
          <p>Multi-Timeframe Analysis: Where Do You Stand?</p>
        </div>
      </div>

      {/* Controls */}
      <div className="dow-controls">
        <div className="control-group">
          <label>Filter</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <button className="refresh-btn" onClick={fetchData} disabled={loading}>
          {loading ? 'Scanning...' : '🔍 Scan Nifty 50'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="dow-error">
          <span>{error}</span>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && <Loader message="Scanning all timeframes... This may take a minute." />}

      {/* Empty State */}
      {!loading && !error && !data && (
        <div className="dow-empty">
          <div className="dow-empty-icon">📊</div>
          <p>Click <strong>Scan Nifty 50</strong> to analyze stocks</p>
          <p className="dow-empty-hint">Analysis covers: Monthly, Weekly, Daily, 4H, 1H, 15M timeframes</p>
        </div>
      )}

      {/* Results Table */}
      {!loading && data && data.stocks && (
        <div className="dow-content">
          <div className="dow-results-header">
            <span>Found {data.total} stocks</span>
            <span className="filter-badge">{FILTERS.find(f => f.value === filter)?.label}</span>
          </div>

          <div className="dow-table-wrapper">
            <table className="dow-table">
              <thead>
                <tr>
                  <th className="stock-col">Stock</th>
                  <th className="mtf-col" colSpan="2">Super TIDE<br/><small>M | W</small></th>
                  <th className="mtf-col" colSpan="2">TIDE<br/><small>D | 4H</small></th>
                  <th className="mtf-col" colSpan="2">WAVE<br/><small>4H | 1H</small></th>
                  <th className="mtf-col" colSpan="2">RIPPLE<br/><small>1H | 15M</small></th>
                  <th className="opp-col">Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {data.stocks.map((stock, idx) => {
                  const tfs = stock.timeframes || {};
                  const opp = stock.opportunity || {};
                  
                  return (
                    <tr 
                      key={stock.symbol} 
                      className="dow-row"
                      onClick={() => openStockDetail(stock.symbol)}
                    >
                      <td className="stock-cell">
                        <span className="stock-rank">{idx + 1}</span>
                        <span className="stock-name">{stock.symbol}</span>
                        <span className="stock-arrow">▶</span>
                      </td>
                      
                      {/* Super TIDE: M, W */}
                      <td className={`trend-cell ${getTrendColor(tfs.monthly?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs.monthly?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs.monthly)}</span>
                      </td>
                      <td className={`trend-cell ${getTrendColor(tfs.weekly?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs.weekly?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs.weekly)}</span>
                      </td>
                      
                      {/* TIDE: D, 4H */}
                      <td className={`trend-cell ${getTrendColor(tfs.daily?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs.daily?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs.daily)}</span>
                      </td>
                      <td className={`trend-cell ${getTrendColor(tfs['4h']?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs['4h']?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs['4h'])}</span>
                      </td>
                      
                      {/* WAVE: 4H, 1H */}
                      <td className={`trend-cell ${getTrendColor(tfs['4h']?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs['4h']?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs['4h'])}</span>
                      </td>
                      <td className={`trend-cell ${getTrendColor(tfs['1h']?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs['1h']?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs['1h'])}</span>
                      </td>
                      
                      {/* RIPPLE: 1H, 15M */}
                      <td className={`trend-cell ${getTrendColor(tfs['1h']?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs['1h']?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs['1h'])}</span>
                      </td>
                      <td className={`trend-cell ${getTrendColor(tfs['15m']?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs['15m']?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs['15m'])}</span>
                      </td>
                      
                      {/* Opportunity */}
                      <td className={`opp-cell ${getTrendColor(opp.color)}`}>
                        <span className="opp-type">{opp.type || '-'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="dow-footer">
            <div className="dow-legend">
              <span>🟢 HH-HL = Uptrend</span>
              <span>🟡 LL→HL = Transition Up</span>
              <span>⚪ Sideways</span>
              <span>🟠 HH→LH = Transition Down</span>
              <span>🔴 LL-LH = Downtrend</span>
            </div>
            <div className="dow-help">
              💡 Click any row for detailed pivot analysis • HH=Higher High, HL=Higher Low, LH=Lower High, LL=Lower Low
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {renderDetailModal()}
    </div>
  );
};

export default DowTheoryScanner;
