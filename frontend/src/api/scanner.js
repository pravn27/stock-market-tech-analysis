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

export default api;
