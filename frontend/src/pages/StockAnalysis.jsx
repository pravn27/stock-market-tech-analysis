/**
 * Stock Analysis Page - PAPA + SMM Checklist
 * Complete technical analysis for a single stock
 */

import React, { useState, useEffect, useMemo } from 'react';
import { getStockAnalysis } from '../api/scanner';
import Loader from '../components/Loader';

const StockAnalysis = ({ symbol, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (symbol) {
      fetchAnalysis();
    }
  }, [symbol]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStockAnalysis(symbol);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch analysis');
    } finally {
      setLoading(false);
    }
  };

  // Get color class for RSI
  const getRsiColorClass = (color) => {
    const colorMap = {
      'green': 'rsi-bullish',
      'lightgreen': 'rsi-near-bullish',
      'gray': 'rsi-neutral',
      'yellow': 'rsi-swing',
      'orange': 'rsi-near-bearish',
      'red': 'rsi-bearish'
    };
    return colorMap[color] || 'rsi-neutral';
  };

  // Get emoji for Dow Theory trend
  const getTrendEmoji = (trend) => {
    if (!trend) return '⚪';
    if (trend === 'HH-HL') return '🟢';
    if (trend === 'LL-LH') return '🔴';
    if (trend === 'LL→HL') return '🟡';
    if (trend === 'HH→LH') return '🟠';
    return '⚪';
  };

  // Get color class for trend
  const getTrendColorClass = (color) => {
    const colorMap = {
      'green': 'trend-up',
      'lightgreen': 'trend-trans-up',
      'red': 'trend-down',
      'orange': 'trend-trans-down',
      'yellow': 'trend-sideways'
    };
    return colorMap[color] || 'trend-neutral';
  };

  // Get opportunity color
  const getOpportunityClass = (color) => {
    const colorMap = {
      'green': 'opp-strong-buy',
      'lightgreen': 'opp-buy',
      'cyan': 'opp-intraday-buy',
      'red': 'opp-sell',
      'orange': 'opp-sell',
      'pink': 'opp-intraday-sell',
      'gray': 'opp-wait'
    };
    return colorMap[color] || 'opp-wait';
  };

  // Timeframe order for display
  const timeframeOrder = ['monthly', 'weekly', 'daily', '4h', '1h', '15m'];
  const timeframeLabels = {
    'monthly': 'M',
    'weekly': 'W',
    'daily': 'D',
    '4h': '4H',
    '1h': '1H',
    '15m': '15M'
  };

  if (loading) {
    return (
      <div className="stock-analysis-page">
        <Loader />
        <p>Loading analysis for {symbol}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-analysis-page">
        <button className="back-btn" onClick={onBack}>← Back to Scanner</button>
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="stock-analysis-page">
        <button className="back-btn" onClick={onBack}>← Back to Scanner</button>
        <div className="error-message">No data available for {symbol}</div>
      </div>
    );
  }

  const dowData = data.checklist?.['1_dow_theory']?.data;
  const rsiData = data.checklist?.['6_indicators']?.indicators?.rsi?.data;
  const opportunity = data.opportunity;
  const mtfGroups = data.mtf_groups;

  return (
    <div className="stock-analysis-page">
      {/* Header */}
      <div className="analysis-header">
        <button className="back-btn" onClick={onBack}>← Back to Scanner</button>
        <div className="stock-info">
          <h1>{data.symbol}</h1>
          <span className="stock-name">{data.name}</span>
          <span className="stock-sector">{data.sector}</span>
        </div>
        <button className="refresh-btn" onClick={fetchAnalysis}>🔄 Refresh</button>
      </div>

      {/* Opportunity Summary */}
      {opportunity && (
        <div className={`opportunity-banner ${getOpportunityClass(opportunity.color)}`}>
          <div className="opp-type">{opportunity.type}</div>
          <div className="opp-strategy">{opportunity.strategy}</div>
          <div className="opp-desc">{opportunity.description}</div>
        </div>
      )}

      {/* MTF Groups Summary */}
      {mtfGroups && (
        <div className="mtf-groups-summary">
          {Object.entries(mtfGroups).map(([key, group]) => (
            <div key={key} className={`mtf-group-badge ${group.color}`}>
              <span className="group-name">{group.name}</span>
              <span className="group-trend">{group.trend}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Checklist Table */}
      <div className="checklist-container">
        <table className="checklist-table">
          <thead>
            <tr>
              <th className="checklist-item-header">PAPA + SMM Checklist</th>
              <th colSpan="2" className="super-tide-header">Super TIDE</th>
              <th colSpan="2" className="tide-header">TIDE</th>
              <th colSpan="2" className="wave-header">WAVE</th>
              <th colSpan="2" className="ripple-header">RIPPLE</th>
            </tr>
            <tr className="tf-labels">
              <th></th>
              <th>M</th>
              <th>W</th>
              <th>D</th>
              <th>4H</th>
              <th>4H</th>
              <th>1H</th>
              <th>1H</th>
              <th>15M</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. Dow Theory / Overall Context */}
            <tr className="section-header">
              <td colSpan="9">
                <strong>1. Overall Context / Dow Theory</strong>
                <span className="section-desc">Where do you stand in overall trend?</span>
              </td>
            </tr>
            <tr>
              <td className="item-label">Trend (HH-HL / LL-LH)</td>
              {/* Super TIDE */}
              <td className={`trend-cell ${getTrendColorClass(dowData?.timeframes?.monthly?.color)}`}>
                <span className="cell-emoji">{getTrendEmoji(dowData?.timeframes?.monthly?.trend)}</span>
                <span className="cell-label">{dowData?.timeframes?.monthly?.last_high_label || '-'}/{dowData?.timeframes?.monthly?.last_low_label || '-'}</span>
              </td>
              <td className={`trend-cell ${getTrendColorClass(dowData?.timeframes?.weekly?.color)}`}>
                <span className="cell-emoji">{getTrendEmoji(dowData?.timeframes?.weekly?.trend)}</span>
                <span className="cell-label">{dowData?.timeframes?.weekly?.last_high_label || '-'}/{dowData?.timeframes?.weekly?.last_low_label || '-'}</span>
              </td>
              {/* TIDE */}
              <td className={`trend-cell ${getTrendColorClass(dowData?.timeframes?.daily?.color)}`}>
                <span className="cell-emoji">{getTrendEmoji(dowData?.timeframes?.daily?.trend)}</span>
                <span className="cell-label">{dowData?.timeframes?.daily?.last_high_label || '-'}/{dowData?.timeframes?.daily?.last_low_label || '-'}</span>
              </td>
              <td className={`trend-cell ${getTrendColorClass(dowData?.timeframes?.['4h']?.color)}`}>
                <span className="cell-emoji">{getTrendEmoji(dowData?.timeframes?.['4h']?.trend)}</span>
                <span className="cell-label">{dowData?.timeframes?.['4h']?.last_high_label || '-'}/{dowData?.timeframes?.['4h']?.last_low_label || '-'}</span>
              </td>
              {/* WAVE */}
              <td className={`trend-cell ${getTrendColorClass(dowData?.timeframes?.['4h']?.color)}`}>
                <span className="cell-emoji">{getTrendEmoji(dowData?.timeframes?.['4h']?.trend)}</span>
                <span className="cell-label">{dowData?.timeframes?.['4h']?.last_high_label || '-'}/{dowData?.timeframes?.['4h']?.last_low_label || '-'}</span>
              </td>
              <td className={`trend-cell ${getTrendColorClass(dowData?.timeframes?.['1h']?.color)}`}>
                <span className="cell-emoji">{getTrendEmoji(dowData?.timeframes?.['1h']?.trend)}</span>
                <span className="cell-label">{dowData?.timeframes?.['1h']?.last_high_label || '-'}/{dowData?.timeframes?.['1h']?.last_low_label || '-'}</span>
              </td>
              {/* RIPPLE */}
              <td className={`trend-cell ${getTrendColorClass(dowData?.timeframes?.['1h']?.color)}`}>
                <span className="cell-emoji">{getTrendEmoji(dowData?.timeframes?.['1h']?.trend)}</span>
                <span className="cell-label">{dowData?.timeframes?.['1h']?.last_high_label || '-'}/{dowData?.timeframes?.['1h']?.last_low_label || '-'}</span>
              </td>
              <td className={`trend-cell ${getTrendColorClass(dowData?.timeframes?.['15m']?.color)}`}>
                <span className="cell-emoji">{getTrendEmoji(dowData?.timeframes?.['15m']?.trend)}</span>
                <span className="cell-label">{dowData?.timeframes?.['15m']?.last_high_label || '-'}/{dowData?.timeframes?.['15m']?.last_low_label || '-'}</span>
              </td>
            </tr>

            {/* Spacer */}
            <tr className="spacer-row"><td colSpan="9"></td></tr>

            {/* 6. Technical Indicators */}
            <tr className="section-header">
              <td colSpan="9">
                <strong>6. Check Indicators</strong>
                <span className="section-desc">Technical momentum and confirmation</span>
              </td>
            </tr>
            
            {/* RSI Row */}
            <tr>
              <td className="item-label">RSI (14)</td>
              {/* Super TIDE */}
              <td className={`indicator-cell ${getRsiColorClass(rsiData?.timeframes?.monthly?.color)}`}>
                <span className="cell-value">{rsiData?.timeframes?.monthly?.value ?? '-'}</span>
                <span className="cell-zone">{rsiData?.timeframes?.monthly?.zone?.split(' ')[0] || '-'}</span>
              </td>
              <td className={`indicator-cell ${getRsiColorClass(rsiData?.timeframes?.weekly?.color)}`}>
                <span className="cell-value">{rsiData?.timeframes?.weekly?.value ?? '-'}</span>
                <span className="cell-zone">{rsiData?.timeframes?.weekly?.zone?.split(' ')[0] || '-'}</span>
              </td>
              {/* TIDE */}
              <td className={`indicator-cell ${getRsiColorClass(rsiData?.timeframes?.daily?.color)}`}>
                <span className="cell-value">{rsiData?.timeframes?.daily?.value ?? '-'}</span>
                <span className="cell-zone">{rsiData?.timeframes?.daily?.zone?.split(' ')[0] || '-'}</span>
              </td>
              <td className={`indicator-cell ${getRsiColorClass(rsiData?.timeframes?.['4h']?.color)}`}>
                <span className="cell-value">{rsiData?.timeframes?.['4h']?.value ?? '-'}</span>
                <span className="cell-zone">{rsiData?.timeframes?.['4h']?.zone?.split(' ')[0] || '-'}</span>
              </td>
              {/* WAVE */}
              <td className={`indicator-cell ${getRsiColorClass(rsiData?.timeframes?.['4h']?.color)}`}>
                <span className="cell-value">{rsiData?.timeframes?.['4h']?.value ?? '-'}</span>
                <span className="cell-zone">{rsiData?.timeframes?.['4h']?.zone?.split(' ')[0] || '-'}</span>
              </td>
              <td className={`indicator-cell ${getRsiColorClass(rsiData?.timeframes?.['1h']?.color)}`}>
                <span className="cell-value">{rsiData?.timeframes?.['1h']?.value ?? '-'}</span>
                <span className="cell-zone">{rsiData?.timeframes?.['1h']?.zone?.split(' ')[0] || '-'}</span>
              </td>
              {/* RIPPLE */}
              <td className={`indicator-cell ${getRsiColorClass(rsiData?.timeframes?.['1h']?.color)}`}>
                <span className="cell-value">{rsiData?.timeframes?.['1h']?.value ?? '-'}</span>
                <span className="cell-zone">{rsiData?.timeframes?.['1h']?.zone?.split(' ')[0] || '-'}</span>
              </td>
              <td className={`indicator-cell ${getRsiColorClass(rsiData?.timeframes?.['15m']?.color)}`}>
                <span className="cell-value">{rsiData?.timeframes?.['15m']?.value ?? '-'}</span>
                <span className="cell-zone">{rsiData?.timeframes?.['15m']?.zone?.split(' ')[0] || '-'}</span>
              </td>
            </tr>

            {/* Placeholder rows for future indicators */}
            <tr className="future-indicator">
              <td className="item-label">MACD</td>
              <td colSpan="8" className="coming-soon">Coming Soon...</td>
            </tr>
            <tr className="future-indicator">
              <td className="item-label">Stochastic</td>
              <td colSpan="8" className="coming-soon">Coming Soon...</td>
            </tr>
            <tr className="future-indicator">
              <td className="item-label">DMI (+DI/-DI)</td>
              <td colSpan="8" className="coming-soon">Coming Soon...</td>
            </tr>
            <tr className="future-indicator">
              <td className="item-label">ADX</td>
              <td colSpan="8" className="coming-soon">Coming Soon...</td>
            </tr>
            <tr className="future-indicator">
              <td className="item-label">Bollinger Band</td>
              <td colSpan="8" className="coming-soon">Coming Soon...</td>
            </tr>
            <tr className="future-indicator">
              <td className="item-label">EMAs</td>
              <td colSpan="8" className="coming-soon">Coming Soon...</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* RSI Legend */}
      <div className="indicator-legend">
        <h4>RSI Zones Legend</h4>
        <div className="legend-items">
          <span className="legend-item rsi-bearish">🔴 &gt;78: Unsustainable Bulls</span>
          <span className="legend-item rsi-bullish">🟢 &gt;60: Bullish Momentum</span>
          <span className="legend-item rsi-near-bullish">🟡 55-60: Near 60</span>
          <span className="legend-item rsi-neutral">⚪ 45-55: Near 50 (Neutral)</span>
          <span className="legend-item rsi-near-bearish">🟠 40-45: Near 40</span>
          <span className="legend-item rsi-bearish">🔴 &lt;40: Bearish Momentum</span>
          <span className="legend-item rsi-bullish">🟢 &lt;22: Unsustainable Bears</span>
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;
