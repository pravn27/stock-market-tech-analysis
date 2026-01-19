/**
 * Scanner API Service
 */

import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for data fetching
});

/**
 * Get sector performance data
 * @param {string} group - Index group: sectorial, broad_market, all
 * @param {string} timeframe - Timeframe: 1h, 4h, daily, weekly, monthly, 3m
 * @param {number} lookback - Periods back to compare (1=previous, 2=2 periods back, etc.)
 */
export const getSectorPerformance = async (group = 'sectorial', timeframe = 'weekly', lookback = 1) => {
  const response = await api.get('/sectors/performance', {
    params: { group, timeframe, lookback }
  });
  return response.data;
};

/**
 * Get list of available sectors
 */
export const getSectorsList = async () => {
  const response = await api.get('/sectors/list');
  return response.data;
};

/**
 * Get stocks in a sector with performance data
 * @param {string} sectorName - Name of the sector
 * @param {string} timeframe - Timeframe: 1h, 4h, daily, weekly, monthly
 * @param {number} lookback - Periods back to compare (1=previous, 2=2 periods back, etc.)
 */
export const getSectorStocks = async (sectorName, timeframe = 'weekly', lookback = 1) => {
  const response = await api.get(`/stocks/sector/${encodeURIComponent(sectorName)}`, {
    params: { timeframe, lookback }
  });
  return response.data;
};

/**
 * Get index groups
 */
export const getIndexGroups = async () => {
  const response = await api.get('/sectors/groups');
  return response.data;
};

/**
 * Get Nifty 50 heavyweight stocks with weightage
 * @param {string} timeframe - Timeframe: 1h, 4h, daily, weekly, monthly
 * @param {number} lookback - Periods back to compare (1=previous, 2=2 periods back, etc.)
 * @param {boolean} topOnly - If true, only top 20 heavyweights
 */
export const getNifty50Heavyweights = async (timeframe = 'weekly', lookback = 1, topOnly = false) => {
  const response = await api.get('/stocks/nifty50/heavyweights', {
    params: { timeframe, lookback, top_only: topOnly }
  });
  return response.data;
};

/**
 * Get Bank Nifty heavyweight stocks with weightage
 * @param {string} timeframe - Timeframe: 1h, 4h, daily, weekly, monthly
 * @param {number} lookback - Periods back to compare (1=previous, 2=2 periods back, etc.)
 * @param {string} compareTo - Benchmark: 'banknifty' or 'nifty50'
 */
export const getBankNiftyHeavyweights = async (timeframe = 'weekly', lookback = 1, compareTo = 'banknifty') => {
  const response = await api.get('/stocks/banknifty/heavyweights', {
    params: { timeframe, lookback, compare_to: compareTo }
  });
  return response.data;
};

/**
 * Get global market indices with sentiment analysis
 * @param {string} timeframe - Timeframe: 1h, 4h, daily, weekly, monthly
 */
export const getGlobalMarkets = async (timeframe = 'daily') => {
  const response = await api.get('/markets/global', {
    params: { timeframe }
  });
  return response.data;
};

/**
 * Get only market sentiment
 * @param {string} timeframe - Timeframe: 1h, 4h, daily, weekly, monthly
 */
export const getMarketSentiment = async (timeframe = 'daily') => {
  const response = await api.get('/markets/sentiment', {
    params: { timeframe }
  });
  return response.data;
};

/**
 * Get top performers across all timeframes
 * @param {number} limit - Number of items per category (1-20)
 * @param {string} include - Include: sectorial, broad_market, thematic, or all
 * @param {number} lookback - Periods back to compare (1=current, 2=2 periods back, etc.)
 */
export const getTopPerformers = async (limit = 3, include = 'all', lookback = 1) => {
  const response = await api.get('/sectors/top-performers', {
    params: { limit, include, lookback }
  });
  return response.data;
};

/**
 * Get Dow Theory analysis for a single stock
 * @param {string} symbol - Stock symbol
 */
export const getDowTheoryAnalysis = async (symbol) => {
  const response = await api.get(`/scanner/dow-theory/${symbol}`);
  return response.data;
};

/**
 * Scan multiple stocks using Dow Theory
 * @param {string} universe - Stock universe: nifty50, custom
 * @param {string} filterType - Filter: all, strong_buy, pullback_buy, intraday_buy, bearish, wait
 * @param {string} symbols - Comma-separated symbols for custom universe
 * @param {number} limit - Max stocks to return
 */
export const scanDowTheory = async (universe = 'nifty50', filterType = 'all', symbols = null, limit = 50) => {
  const params = { universe, filter_type: filterType, limit };
  if (symbols) params.symbols = symbols;
  
  const response = await api.get('/scanner/dow-theory', { params });
  return response.data;
};

/**
 * Get Dow Theory scan summary
 */
export const getDowTheorySummary = async () => {
  const response = await api.get('/scanner/dow-theory/summary');
  return response.data;
};

/**
 * Get FULL stock analysis (PAPA + SMM Checklist)
 * Includes Dow Theory + RSI + future indicators
 * @param {string} symbol - Stock symbol
 */
export const getStockAnalysis = async (symbol) => {
  const response = await api.get(`/scanner/stock/${symbol}/analysis`);
  return response.data;
};

/**
 * Get RSI analysis for a stock
 * @param {string} symbol - Stock symbol
 */
export const getRSIAnalysis = async (symbol) => {
  const response = await api.get(`/scanner/rsi/${symbol}`);
  return response.data;
};

// Aliases for backward compatibility
export const getNifty50Stocks = getNifty50Heavyweights;
export const getBankNiftyStocks = getBankNiftyHeavyweights;
export const getSectorList = getSectorsList;

export default api;
