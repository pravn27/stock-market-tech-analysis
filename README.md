# ASTA - Stock Market Technical Analysis

A modular stock market technical analysis application with **FastAPI Backend** and **ReactJS Frontend**.

## Architecture

```
stock-market-tech-analysis/
├── backend/                    # FastAPI Backend Service
│   ├── main.py                 # FastAPI app entry point
│   ├── models.py               # Pydantic models
│   ├── core/                   # Core analysis modules
│   │   ├── sector_scanner.py   # Sector relative strength logic
│   │   └── sector_stocks.py    # Sector stock mappings
│   ├── routers/                # API route handlers
│   │   ├── sectors.py          # Sector endpoints
│   │   └── stocks.py           # Stock endpoints
│   └── services/               # Business logic layer
│       └── scanner.py          # Scanner service
├── frontend/                   # ReactJS Frontend
│   ├── src/
│   │   ├── api/                # API client
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── App.jsx             # Main app
│   │   └── App.css             # Styles
│   └── package.json
├── run_api.py                  # Backend server runner
└── pyproject.toml              # Python dependencies
```

## Features

### Sector Performance
- Compare NIFTY sectors vs NIFTY 50 benchmark
- Multiple timeframes: 1 Hour, 4 Hour, Daily, Weekly, Monthly, 3 Month
- Categorized view: Outperforming, Neutral, Underperforming
- Ranked view by relative strength

### Sector Stocks
- Individual stock analysis within sectors
- Performance relative to NIFTY 50
- Stock ranking by relative strength

## Quick Start

### Prerequisites
- Python 3.13+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) package manager

### 1. Install Backend Dependencies

```bash
uv sync
```

### 2. Start Backend API

```bash
uv run python run_api.py
```

Backend runs at: http://localhost:8000

API Docs: http://localhost:8000/docs

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. Start Frontend

```bash
npm run dev
```

Frontend runs at: http://localhost:5173

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sectors/performance` | GET | Get sector performance vs NIFTY 50 |
| `/api/sectors/list` | GET | Get available sectors |
| `/api/sectors/groups` | GET | Get index groups |
| `/api/stocks/sector/{name}` | GET | Get stocks in a sector |

### Query Parameters

- `group`: Index group (`sectorial`, `broad_market`, `all`)
- `timeframe`: Analysis timeframe (`1h`, `4h`, `daily`, `weekly`, `monthly`, `3m`)

## Development

### Backend
```bash
# Run with auto-reload
uv run python run_api.py
```

### Frontend
```bash
cd frontend
npm run dev
```

## Tech Stack

**Backend:**
- FastAPI
- Pydantic
- yfinance
- pandas, ta (technical analysis)

**Frontend:**
- React (Vite)
- Axios
- CSS (no frameworks - clean & simple)

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/PRD.md](docs/PRD.md) | Complete Project Requirements Document |
| [docs/CURSOR_CONTEXT.md](docs/CURSOR_CONTEXT.md) | Quick reference for Cursor AI |

Use `docs/CURSOR_CONTEXT.md` as context when building new features with Cursor AI.
