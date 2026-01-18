# ASTA - Stock Market Technical Analysis
## Project Requirements Document (PRD)

**Version:** 1.0.0  
**Last Updated:** January 18, 2026  
**Status:** Active Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Backend Features](#4-backend-features)
5. [Frontend Features](#5-frontend-features)
6. [Data Models](#6-data-models)
7. [API Reference](#7-api-reference)
8. [Business Logic](#8-business-logic)
9. [UI/UX Guidelines](#9-uiux-guidelines)
10. [Future Roadmap](#10-future-roadmap)

---

## 1. Project Overview

### 1.1 Purpose
ASTA (Advanced Stock Technical Analysis) is a stock market analysis platform that provides relative strength analysis for NSE (National Stock Exchange of India) sectors and individual stocks compared to the NIFTY 50 benchmark.

### 1.2 Key Objectives
- Identify outperforming and underperforming sectors relative to NIFTY 50
- Analyze individual stocks within sectors for relative strength
- Support multiple timeframe analysis (intraday to quarterly)
- Provide clean, responsive, easy-to-access UI
- Maintain modular, scalable architecture for future growth

### 1.3 Target Users
- Retail traders and investors
- Technical analysts
- Portfolio managers
- Anyone interested in sector rotation strategies

### 1.4 Core Value Proposition
Quick identification of sector and stock momentum relative to the broader market, enabling informed trading and investment decisions.

---

## 2. Architecture

### 2.1 System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              React Frontend (Vite)                       │    │
│  │  - Components: Header, Filters, DataTable, etc.         │    │
│  │  - Pages: SectorPerformance, SectorStocks               │    │
│  │  - API Client: Axios                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ HTTP/REST (JSON)                  │
│                              ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│                        API LAYER                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              FastAPI Backend                             │    │
│  │  - Routers: /api/sectors/*, /api/stocks/*               │    │
│  │  - CORS enabled for frontend                             │    │
│  │  - Auto-generated OpenAPI docs                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Scanner Service                             │    │
│  │  - Business logic orchestration                          │    │
│  │  - Data transformation for API responses                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│                        CORE LAYER                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Analysis Modules                            │    │
│  │  - SectorRelativeStrength: Sector vs NIFTY 50           │    │
│  │  - StockRelativeStrength: Stock vs NIFTY 50             │    │
│  │  - sector_stocks.py: Stock-Sector mappings              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
├─────────────────────────────────────────────────────────────────┤
│                      DATA LAYER                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              yfinance API                                │    │
│  │  - Real-time and historical price data                   │    │
│  │  - Index data (NIFTY 50, sector indices)                │    │
│  │  - Stock data (NSE listed stocks)                        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Directory Structure
```
stock-market-tech-analysis/
├── backend/                      # Python FastAPI Backend
│   ├── __init__.py
│   ├── main.py                   # FastAPI app, CORS, routers
│   ├── models.py                 # Pydantic response models
│   ├── core/                     # Core business logic
│   │   ├── __init__.py
│   │   ├── sector_scanner.py     # Relative strength calculations
│   │   └── sector_stocks.py      # Sector-stock mappings
│   ├── routers/                  # API route handlers
│   │   ├── __init__.py
│   │   ├── sectors.py            # Sector endpoints
│   │   └── stocks.py             # Stock endpoints
│   └── services/                 # Service layer
│       ├── __init__.py
│       └── scanner.py            # Scanner business logic
│
├── frontend/                     # React Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Main app component
│       ├── App.css               # Global styles
│       ├── index.css             # CSS reset
│       ├── api/                  # API client
│       │   ├── config.js         # API configuration
│       │   └── scanner.js        # API functions
│       ├── components/           # Reusable components
│       │   ├── Header.jsx
│       │   ├── Filters.jsx
│       │   ├── DataTable.jsx
│       │   ├── CategoryView.jsx
│       │   ├── BenchmarkCard.jsx
│       │   └── Loader.jsx
│       └── pages/                # Page components
│           ├── SectorPerformance.jsx
│           └── SectorStocks.jsx
│
├── docs/                         # Documentation
│   └── PRD.md                    # This document
│
├── run_api.py                    # Backend runner script
├── pyproject.toml                # Python dependencies
└── README.md                     # Project readme
```

---

## 3. Tech Stack

### 3.1 Backend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Python | 3.13+ | Core language |
| Framework | FastAPI | 0.128+ | REST API framework |
| Server | Uvicorn | 0.40+ | ASGI server |
| Validation | Pydantic | 2.12+ | Request/response models |
| Data | yfinance | 1.0+ | Stock market data |
| Analysis | pandas | 2.3+ | Data manipulation |
| Technical | ta | 0.11+ | Technical indicators |
| Package Mgr | uv | latest | Dependency management |

### 3.2 Frontend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React | 18+ | UI framework |
| Build Tool | Vite | 7+ | Build & dev server |
| HTTP Client | Axios | latest | API requests |
| Styling | CSS | - | Custom CSS (no frameworks) |

### 3.3 Data Sources

| Source | Type | Data Provided |
|--------|------|---------------|
| Yahoo Finance (yfinance) | External API | Real-time & historical prices, index data |

### 3.4 Development Tools

| Tool | Purpose |
|------|---------|
| uv | Python package management |
| npm | Node.js package management |
| ESLint | JavaScript linting |

---

## 4. Backend Features

### 4.1 Sector Relative Strength Analysis

**Module:** `backend/core/sector_scanner.py`  
**Class:** `SectorRelativeStrength`

#### 4.1.1 Supported Index Groups

| Group | Key | Description | Indices Count |
|-------|-----|-------------|---------------|
| Sectorial | `sectorial` | Main sector indices | 13 |
| Broad Market | `broad_market` | Market cap indices | 13 |
| All | `all` | Comprehensive list | 27 |

#### 4.1.2 Sector Indices (Sectorial Group)

| Sector Name | Yahoo Symbol | Category |
|-------------|--------------|----------|
| NIFTY 50 | ^NSEI | Benchmark |
| Bank Nifty | ^NSEBANK | Banking |
| Nifty IT | ^CNXIT | Technology |
| Nifty Pharma | ^CNXPHARMA | Healthcare |
| Nifty FMCG | ^CNXFMCG | Consumer |
| Nifty Finance | ^CNXFINANCE | Financial Services |
| Nifty Auto | ^CNXAUTO | Automobile |
| Nifty Metal | ^CNXMETAL | Metals & Mining |
| Nifty Realty | ^CNXREALTY | Real Estate |
| Nifty Energy | ^CNXENERGY | Energy |
| Nifty PSU Bank | ^CNXPSUBANK | Public Sector Banks |
| Nifty Pvt Bank | ^NIFTYPVTBANK | Private Banks |
| Nifty Midcap 100 | ^CNXMIDCAP | Midcap |

#### 4.1.3 Timeframe Analysis

| Timeframe | Key | Calculation Method |
|-----------|-----|-------------------|
| 1 Hour | `1h` | Current vs 1 hour ago close |
| 4 Hour | `4h` | Current vs 4 hours ago close |
| Daily | `daily` | Current vs previous day close |
| Weekly | `weekly` | Current vs previous week's last close |
| Monthly | `monthly` | Current vs previous month's last close |
| 3 Month | `3m` | Current vs 3 months ago close |

#### 4.1.4 Relative Strength Calculation

```python
Relative Strength (RS) = Sector Return (%) - NIFTY 50 Return (%)

Categories:
- Outperforming: RS > +1%
- Neutral: -1% <= RS <= +1%
- Underperforming: RS < -1%
```

### 4.2 Stock Relative Strength Analysis

**Module:** `backend/core/sector_scanner.py`  
**Class:** `StockRelativeStrength`

#### 4.2.1 Supported Sectors for Stock Analysis

| Sector | Stock Count | Key Stocks |
|--------|-------------|------------|
| Bank Nifty | 12 | HDFCBANK, ICICIBANK, SBIN, KOTAKBANK |
| Nifty IT | 10 | TCS, INFY, HCLTECH, WIPRO |
| Nifty Pharma | 15 | SUNPHARMA, DRREDDY, CIPLA |
| Nifty FMCG | 14 | HINDUNILVR, ITC, NESTLEIND |
| Nifty Auto | 14 | MARUTI, TATAMOTORS, M&M |
| Nifty Metal | 12 | TATASTEEL, JSWSTEEL, HINDALCO |
| Nifty Realty | 9 | DLF, GODREJPROP, OBEROIRLTY |
| Nifty Energy | 12 | RELIANCE, ONGC, NTPC |
| Nifty Finance | 18 | BAJFINANCE, HDFCLIFE, SBILIFE |
| Nifty PSU Bank | 12 | SBIN, BANKBARODA, PNB |
| Nifty Pvt Bank | 10 | HDFCBANK, ICICIBANK, KOTAKBANK |
| Nifty Media | 9 | ZEEL, PVRINOX, SUNTV |
| Nifty Infra | 12 | LT, ADANIPORTS, ULTRACEMCO |
| Nifty Midcap 100 | 20 | POLYCAB, TRENT, PERSISTENT |

#### 4.2.2 Stock Data Points

For each stock, the following data is calculated:
- Current price
- Returns across all timeframes
- Relative strength vs NIFTY 50
- Performance status (outperforming/neutral/underperforming)
- Rank within sector

### 4.3 Service Layer

**Module:** `backend/services/scanner.py`  
**Class:** `ScannerService`

#### 4.3.1 Methods

| Method | Purpose | Parameters |
|--------|---------|------------|
| `get_index_groups()` | Get available index groups | None |
| `get_available_sectors()` | Get sectors for stock analysis | None |
| `get_sector_stocks(sector_name)` | Get stock list for sector | sector_name: str |
| `analyze_sectors(index_group, timeframe)` | Full sector analysis | index_group: str, timeframe: str |
| `analyze_sector_stocks(sector_name, timeframe)` | Stock analysis in sector | sector_name: str, timeframe: str |

---

## 5. Frontend Features

### 5.1 Application Structure

**Entry Point:** `frontend/src/App.jsx`

#### 5.1.1 Navigation
- Header with title "Stock Market TA"
- Two main pages: Sector Performance, Sector Stocks
- Tab-based navigation

### 5.2 Pages

#### 5.2.1 Sector Performance Page

**File:** `frontend/src/pages/SectorPerformance.jsx`

**Features:**
- Index group selection (Sectorial, Broad Market, All)
- Timeframe selection (1h, 4h, Daily, Weekly, Monthly, 3M)
- Benchmark card showing NIFTY 50 data
- Two view modes:
  - **Categorized View:** Grouped by Outperforming, Neutral, Underperforming
  - **Ranked View:** Single table sorted by relative strength
- Refresh button for on-demand data update
- Last updated timestamp

**State Management:**
```javascript
{
  loading: boolean,
  error: string | null,
  data: SectorPerformanceResponse | null,
  indexGroup: 'sectorial' | 'broad_market' | 'all',
  timeframe: '1h' | '4h' | 'daily' | 'weekly' | 'monthly' | '3m',
  viewMode: 'category' | 'ranked'
}
```

#### 5.2.2 Sector Stocks Page

**File:** `frontend/src/pages/SectorStocks.jsx`

**Features:**
- Sector selection dropdown (14 sectors)
- Timeframe selection
- Benchmark card showing NIFTY 50 data
- Sector summary with stock count
- Two view modes (Categorized, Ranked)
- Individual stock data with relative strength

**State Management:**
```javascript
{
  loading: boolean,
  sectorsLoading: boolean,
  error: string | null,
  data: SectorStocksResponse | null,
  sectors: string[],
  selectedSector: string,
  timeframe: string,
  viewMode: 'category' | 'ranked'
}
```

### 5.3 Components

#### 5.3.1 Header Component

**File:** `frontend/src/components/Header.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| activePage | string | Current active page |
| onPageChange | function | Page change handler |

**Features:**
- Application title: "Stock Market TA"
- Navigation buttons with active state

#### 5.3.2 Filters Component

**File:** `frontend/src/components/Filters.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| showIndexGroup | boolean | Show index group dropdown |
| indexGroup | string | Selected index group |
| onIndexGroupChange | function | Index group change handler |
| timeframe | string | Selected timeframe |
| onTimeframeChange | function | Timeframe change handler |
| sectors | array | List of sectors (for stock page) |
| selectedSector | string | Selected sector |
| onSectorChange | function | Sector change handler |
| showSectorSelect | boolean | Show sector dropdown |
| onRefresh | function | Refresh button handler |
| loading | boolean | Loading state |

#### 5.3.3 DataTable Component

**File:** `frontend/src/components/DataTable.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| data | array | Array of sector/stock data |
| type | string | 'sector' or 'stock' |
| timeframe | string | Current timeframe for display |
| showRank | boolean | Show rank column |

**Columns:**
- Rank (#)
- Name (Sector/Stock)
- Symbol
- Price (₹)
- Return (% with color coding)
- RS vs Nifty (% with color coding)
- Status (badge)

#### 5.3.4 CategoryView Component

**File:** `frontend/src/components/CategoryView.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| outperforming | array | Outperforming items |
| neutral | array | Neutral items |
| underperforming | array | Underperforming items |
| type | string | 'sector' or 'stock' |
| timeframe | string | Current timeframe |

**Sections:**
- Outperforming (green dot indicator)
- Neutral (yellow dot indicator)
- Underperforming (red dot indicator)

#### 5.3.5 BenchmarkCard Component

**File:** `frontend/src/components/BenchmarkCard.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| benchmark | object | Benchmark data |
| timeframe | string | Current timeframe |

**Display:**
- Benchmark name (NIFTY 50)
- Current price
- Return for selected timeframe

#### 5.3.6 Loader Component

**File:** `frontend/src/components/Loader.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| message | string | Loading message |

### 5.4 API Client

**File:** `frontend/src/api/scanner.js`

**Functions:**
| Function | Endpoint | Purpose |
|----------|----------|---------|
| `getSectorPerformance(group, timeframe)` | GET /api/sectors/performance | Fetch sector analysis |
| `getSectorsList()` | GET /api/sectors/list | Fetch available sectors |
| `getSectorStocks(sectorName, timeframe)` | GET /api/stocks/sector/{name} | Fetch stock analysis |
| `getIndexGroups()` | GET /api/sectors/groups | Fetch index groups |

**Configuration:**
```javascript
// frontend/src/api/config.js
API_BASE_URL = 'http://localhost:8000/api'
TIMEOUT = 60000 // 60 seconds
```

---

## 6. Data Models

### 6.1 API Response Models

#### 6.1.1 ReturnsData
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

#### 6.1.2 RelativeStrength
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

#### 6.1.3 BenchmarkData
```typescript
{
  name: string,          // "NIFTY 50"
  symbol: string,        // "^NSEI"
  price: number,         // Current price
  returns: ReturnsData,
  timestamp: string      // ISO timestamp
}
```

#### 6.1.4 SectorData
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

#### 6.1.5 StockData
```typescript
{
  symbol: string,        // "TCS.NS"
  name: string,          // "Tata Consultancy Services"
  price: number,
  returns: ReturnsData,
  relative_strength: RelativeStrength,
  status: 'outperforming' | 'neutral' | 'underperforming',
  rank: number | null
}
```

#### 6.1.6 SectorPerformanceResponse
```typescript
{
  benchmark: BenchmarkData,
  sectors: SectorData[],
  outperforming: SectorData[],
  neutral: SectorData[],
  underperforming: SectorData[],
  timestamp: string,
  timeframe: string
}
```

#### 6.1.7 SectorStocksResponse
```typescript
{
  sector_name: string,
  benchmark: BenchmarkData,
  stocks: StockData[],
  outperforming: StockData[],
  neutral: StockData[],
  underperforming: StockData[],
  total_stocks: number,
  timestamp: string,
  timeframe: string
}
```

---

## 7. API Reference

### 7.1 Base URL
```
http://localhost:8000/api
```

### 7.2 Endpoints

#### GET /sectors/performance

Get sector performance relative to NIFTY 50.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| group | string | sectorial | Index group: sectorial, broad_market, all |
| timeframe | string | weekly | Timeframe: 1h, 4h, daily, weekly, monthly, 3m |

**Response:** `SectorPerformanceResponse`

**Example:**
```bash
GET /api/sectors/performance?group=sectorial&timeframe=weekly
```

#### GET /sectors/list

Get list of available sectors for stock analysis.

**Response:**
```json
{
  "sectors": ["Bank Nifty", "Nifty IT", ...],
  "total": 14
}
```

#### GET /sectors/groups

Get available index groups.

**Response:**
```json
{
  "sectorial": ["NIFTY 50", "Bank Nifty", ...],
  "broad_market": ["NIFTY 50", "Nifty Junior", ...],
  "all": [...]
}
```

#### GET /stocks/sector/{sector_name}

Get stocks in a sector with performance analysis.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sector_name | string | Sector name (URL encoded) |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| timeframe | string | weekly | Analysis timeframe |

**Response:** `SectorStocksResponse`

**Example:**
```bash
GET /api/stocks/sector/Nifty%20IT?timeframe=daily
```

#### GET /stocks/sector/{sector_name}/list

Get list of stock symbols in a sector.

**Response:**
```json
{
  "sector": "Nifty IT",
  "stocks": ["TCS.NS", "INFY.NS", ...],
  "total": 10
}
```

### 7.3 Health Endpoints

#### GET /
Root endpoint with API info.

#### GET /health
Health check endpoint.

---

## 8. Business Logic

### 8.1 Relative Strength Calculation

#### 8.1.1 Return Calculation
```python
# Daily Return
return = ((current_price - prev_day_close) / prev_day_close) * 100

# Weekly Return
return = ((current_price - prev_week_last_close) / prev_week_last_close) * 100

# Monthly Return
return = ((current_price - prev_month_last_close) / prev_month_last_close) * 100

# Intraday (1hr, 4hr)
return = ((current_price - n_hours_ago_close) / n_hours_ago_close) * 100
```

#### 8.1.2 Relative Strength
```python
relative_strength = sector_return - benchmark_return
# Positive = outperforming NIFTY 50
# Negative = underperforming NIFTY 50
```

#### 8.1.3 Status Categorization
```python
if relative_strength > 1.0:
    status = "outperforming"
elif relative_strength < -1.0:
    status = "underperforming"
else:
    status = "neutral"
```

### 8.2 Data Fetching

#### 8.2.1 Historical Data
- Period: 6 months
- Interval: 1 day
- Source: yfinance

#### 8.2.2 Intraday Data
- Period: 7 days
- Interval: 1 hour
- Source: yfinance

---

## 9. UI/UX Guidelines

### 9.1 Design Principles
- **Simple:** Clean, uncluttered interface
- **Accessible:** Easy to navigate and understand
- **Responsive:** Works on desktop, tablet, mobile
- **Informative:** Key data visible at a glance

### 9.2 Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| Background (Dark) | Slate 900 | #0f172a |
| Card Background | Slate 800 | #1e293b |
| Input Background | Slate 700 | #334155 |
| Primary | Blue 700 | #1e40af |
| Primary Dark | Blue 800 | #1e3a8a |
| Text Primary | Slate 100 | #f1f5f9 |
| Text Secondary | Slate 400 | #94a3b8 |
| Text Muted | Slate 500 | #64748b |
| Positive | Green 500 | #22c55e |
| Negative | Red 500 | #ef4444 |
| Neutral | Amber 500 | #f59e0b |
| Border | Slate 700 | #334155 |

### 9.3 Typography
- Font: System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)
- Monospace: For prices and symbols

### 9.4 Component Styling
- Border radius: 8px
- Shadows: Subtle (0 4px 6px -1px rgba(0, 0, 0, 0.3))
- Transitions: 0.2s ease

### 9.5 Status Indicators

| Status | Badge Color | Dot Color |
|--------|-------------|-----------|
| Outperforming | Green (15% opacity) | #22c55e |
| Neutral | Amber (15% opacity) | #f59e0b |
| Underperforming | Red (15% opacity) | #ef4444 |

---

## 10. Future Roadmap

### 10.1 Planned Features

#### Phase 2: Technical Indicators
- [ ] Bollinger Bands scanner
- [ ] RSI (Relative Strength Index) analysis
- [ ] MACD signals
- [ ] Moving average crossovers
- [ ] Volume analysis

#### Phase 3: Pattern Recognition
- [ ] PAPA (Price Action Pattern Analysis) scanner
- [ ] Candlestick patterns
- [ ] Support/Resistance levels
- [ ] Trend identification

#### Phase 4: Charting
- [ ] Interactive price charts
- [ ] Multiple timeframe views
- [ ] Indicator overlays
- [ ] Drawing tools

#### Phase 5: Alerts & Notifications
- [ ] Price alerts
- [ ] Pattern alerts
- [ ] Sector rotation alerts
- [ ] Email/Push notifications

#### Phase 6: Portfolio
- [ ] Watchlist management
- [ ] Portfolio tracking
- [ ] Performance analytics

### 10.2 Technical Improvements
- [ ] Data caching (Redis)
- [ ] WebSocket for real-time updates
- [ ] Database integration (PostgreSQL)
- [ ] User authentication
- [ ] API rate limiting
- [ ] Unit & integration tests

---

## Appendix A: Quick Reference

### Running the Application

```bash
# Backend (Terminal 1)
cd stock-market-tech-analysis
uv run python run_api.py
# Runs on http://localhost:8000

# Frontend (Terminal 2)
cd stock-market-tech-analysis/frontend
npm run dev
# Runs on http://localhost:5173
```

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Files to Modify

| Feature | Backend File | Frontend File |
|---------|--------------|---------------|
| New Sector Index | backend/core/sector_scanner.py | - |
| New Stock Mapping | backend/core/sector_stocks.py | - |
| New API Endpoint | backend/routers/*.py | frontend/src/api/scanner.js |
| New Page | - | frontend/src/pages/*.jsx |
| New Component | - | frontend/src/components/*.jsx |
| Styling | - | frontend/src/App.css |

---

**Document Control:**
- Created: January 18, 2026
- Author: ASTA Development Team
- Next Review: Upon major feature addition
