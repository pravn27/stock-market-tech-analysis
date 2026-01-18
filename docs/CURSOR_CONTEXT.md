# ASTA - Cursor AI Context Document

> **Use this document as context when building new features with Cursor AI**

## Project Summary

ASTA is a stock market technical analysis platform with:
- **Backend:** FastAPI (Python 3.13+)
- **Frontend:** React + Vite
- **Data Source:** yfinance (Yahoo Finance)

## Architecture Quick Reference

```
backend/
├── main.py              # FastAPI app with CORS
├── models.py            # Pydantic models
├── core/                # Business logic
│   ├── sector_scanner.py    # RS calculations
│   └── sector_stocks.py     # Stock mappings
├── routers/             # API endpoints
│   ├── sectors.py           # /api/sectors/*
│   └── stocks.py            # /api/stocks/*
└── services/
    └── scanner.py           # Service layer

frontend/src/
├── api/                 # API client (Axios)
├── components/          # Reusable UI
├── pages/               # Page views
├── App.jsx              # Main app
└── App.css              # Styles
```

## Current Features

### 1. Sector Relative Strength
- Compare sectors vs NIFTY 50
- Timeframes: 1h, 4h, Daily, Weekly, Monthly, 3M
- Categories: Outperforming (>1%), Neutral, Underperforming (<-1%)

### 2. Stock Relative Strength
- Compare stocks within sectors vs NIFTY 50
- 14 sectors with ~10-20 stocks each
- Same timeframe and categorization logic

## API Patterns

### Adding New Endpoint

```python
# backend/routers/new_router.py
from fastapi import APIRouter, HTTPException, Query
router = APIRouter(prefix="/newfeature", tags=["NewFeature"])

@router.get("/endpoint")
async def get_data(param: str = Query("default")):
    try:
        result = SomeService.do_something(param)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

Register in `backend/main.py`:
```python
from backend.routers import new_router
app.include_router(new_router.router, prefix="/api")
```

### Adding New Service

```python
# backend/services/new_service.py
class NewService:
    @staticmethod
    def analyze(param: str) -> Dict:
        # Business logic here
        return {"result": "data"}
```

## Frontend Patterns

### Adding New Page

```jsx
// frontend/src/pages/NewPage.jsx
import React, { useState, useEffect } from 'react';
import { newApiCall } from '../api/scanner';

const NewPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await newApiCall();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="page">
      {/* Page content */}
    </div>
  );
};

export default NewPage;
```

Add to `App.jsx`:
```jsx
import NewPage from './pages/NewPage';
// In render: {activePage === 'newpage' && <NewPage />}
```

### Adding New API Function

```javascript
// frontend/src/api/scanner.js
export const newApiCall = async (param = 'default') => {
  const response = await api.get('/newfeature/endpoint', {
    params: { param }
  });
  return response.data;
};
```

## Data Model Templates

### Returns Data
```typescript
{
  one_hour: number | null,
  four_hour: number | null,
  daily: number | null,
  weekly: number | null,
  monthly: number | null,
  three_month: number | null
}
```

### Item Data (Sector/Stock)
```typescript
{
  name: string,
  symbol: string,
  price: number,
  returns: ReturnsData,
  relative_strength: RelativeStrength,
  status: 'outperforming' | 'neutral' | 'underperforming',
  rank: number | null
}
```

## Styling Guidelines

### CSS Variables (from App.css)
```css
--primary: #1e40af;
--bg-dark: #0f172a;
--bg-card: #1e293b;
--text-primary: #f1f5f9;
--positive: #22c55e;
--negative: #ef4444;
--neutral: #f59e0b;
```

### Status Badge Pattern
```jsx
<span className={`status-badge status-${status}`}>{label}</span>
```

## Common Operations

### Calculate Relative Strength
```python
relative_strength = item_return - benchmark_return
status = 'outperforming' if rs > 1 else 'underperforming' if rs < -1 else 'neutral'
```

### Fetch Stock Data (yfinance)
```python
ticker = yf.Ticker(symbol)
df = ticker.history(period="6mo", interval="1d")  # Daily
df = ticker.history(period="7d", interval="1h")   # Intraday
```

### Calculate Returns
```python
daily_return = ((current - prev_close) / prev_close) * 100
```

## Testing Commands

```bash
# Backend
uv run python run_api.py

# Frontend
cd frontend && npm run dev

# API Docs
open http://localhost:8000/docs
```

## Key Imports

### Backend
```python
from fastapi import APIRouter, HTTPException, Query
from backend.core.sector_scanner import SectorRelativeStrength, StockRelativeStrength
from backend.core.sector_stocks import SECTOR_STOCKS_MAP
import yfinance as yf
import pandas as pd
```

### Frontend
```javascript
import axios from 'axios';
import { API_BASE_URL, TIMEFRAMES, INDEX_GROUPS } from './config';
```

---

**When adding new features:**
1. Check this document for patterns
2. Follow existing code structure
3. Update PRD.md with new feature details
4. Keep UI simple and consistent
