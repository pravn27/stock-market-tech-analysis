/**
 * API Configuration
 */

// Production API URL (Render backend)
const PRODUCTION_API_URL = 'https://stock-market-tech-analysis.onrender.com/api';

// Development API URL (local backend)
const DEVELOPMENT_API_URL = 'http://localhost:8000/api';

// Vite: import.meta.env.DEV is true during `npm run dev`, false during `npm run build`
export const API_BASE_URL = import.meta.env.DEV ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

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
  { value: 'thematic', label: 'Thematic Indices' },
  { value: 'all', label: 'All Indices' }
];

// Lookback options: how many periods back to compare
// 1 = previous period (default), 2 = 2 periods back, etc.
export const LOOKBACK_OPTIONS = [
  { value: 1, label: 'Previous (1)' },
  { value: 2, label: '2 Periods Back' },
  { value: 3, label: '3 Periods Back' },
  { value: 4, label: '4 Periods Back' },
  { value: 5, label: '5 Periods Back' }
];