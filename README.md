# ASTA - Stock Market Technical Analysis

A modular stock market technical analysis application with **FastAPI Backend** and **ReactJS Frontend** as separate services.

## Architecture

```
stock-market-tech-analysis/
├── backend/                    # 🐍 FastAPI Backend Service
│   ├── pyproject.toml          # Python dependencies
│   ├── run.py                  # Server runner
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
│
├── frontend/                   # ⚛️ ReactJS Frontend
│   ├── package.json            # Node dependencies
│   ├── src/
│   │   ├── api/                # API client
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── App.jsx             # Main app
│   │   └── App.css             # Styles
│   └── vite.config.js
│
└── docs/                       # 📚 Documentation
    ├── PRD.md                  # Project Requirements Document
    └── CURSOR_CONTEXT.md       # Cursor AI context
```

## Features

### Sector Performance
- Compare NIFTY sectors vs NIFTY 50 benchmark
- Multiple timeframes: 1 Hour, 4 Hour, Daily, Weekly, Monthly, 3 Month
- **Lookback Period**: Compare with N candles back (configurable)
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

---

### 🐍 Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
uv sync

# Start the API server
uv run python run.py
```

**Backend runs at:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

---

### ⚛️ Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs at:** http://localhost:5173

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sectors/performance` | GET | Get sector performance vs NIFTY 50 |
| `/api/sectors/list` | GET | Get available sectors |
| `/api/sectors/groups` | GET | Get index groups |
| `/api/stocks/sector/{name}` | GET | Get stocks in a sector |

### Query Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `group` | `sectorial`, `broad_market`, `all` | Index group to analyze |
| `timeframe` | `1h`, `4h`, `daily`, `weekly`, `monthly`, `3m` | Analysis timeframe |
| `lookback` | `1-99` (default: 1) | Periods back to compare |

## Tech Stack

| Service | Technologies |
|---------|-------------|
| **Backend** | FastAPI, Pydantic, yfinance, pandas, uvicorn |
| **Frontend** | React (Vite), Axios, CSS |

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/PRD.md](docs/PRD.md) | Complete Project Requirements Document |
| [docs/CURSOR_CONTEXT.md](docs/CURSOR_CONTEXT.md) | Quick reference for Cursor AI |

---

**Development Tips:**
- Backend auto-reloads on file changes
- Frontend has HMR (Hot Module Replacement)
- Use `docs/CURSOR_CONTEXT.md` as context when building new features with Cursor AI
