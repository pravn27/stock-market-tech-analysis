/**
 * API Configuration
 */

export const API_BASE_URL = 'http://localhost:8000/api';

export const TIMEFRAMES = [
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: '3m', label: '3 Month' }
];

export const INDEX_GROUPS = [
  { value: 'sectorial', label: 'NIFTY Sectors' },
  { value: 'broad_market', label: 'Broad Market' },
  { value: 'all', label: 'All Indices' }
];
