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
 */
export const getSectorPerformance = async (group = 'sectorial', timeframe = 'weekly') => {
  const response = await api.get('/sectors/performance', {
    params: { group, timeframe }
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
 */
export const getSectorStocks = async (sectorName, timeframe = 'weekly') => {
  const response = await api.get(`/stocks/sector/${encodeURIComponent(sectorName)}`, {
    params: { timeframe }
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

export default api;
