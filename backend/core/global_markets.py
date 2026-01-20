"""
Global Market Indices Configuration
Comprehensive list of global indices for market sentiment analysis
"""

# US Markets
US_MARKETS = [
    {"symbol": "^DJI", "name": "Dow Jones Industrial", "short": "DJI"},
    {"symbol": "^GSPC", "name": "S&P 500", "short": "SPX"},
    {"symbol": "^IXIC", "name": "NASDAQ Composite", "short": "IXIC"},
    {"symbol": "^NDX", "name": "NASDAQ 100", "short": "NDX"},
    {"symbol": "^RUT", "name": "Russell 2000", "short": "RUT"},
    {"symbol": "^NYA", "name": "NYSE Composite", "short": "NYA"},
    {"symbol": "^VIX", "name": "Volatility Index", "short": "VIX"},
    {"symbol": "DX-Y.NYB", "name": "US Dollar Index", "short": "DXY"},
    {"symbol": "USDINR=X", "name": "USD/INR", "short": "USDINR"},
    {"symbol": "ES=F", "name": "S&P 500 Futures", "short": "ES"},
    {"symbol": "NQ=F", "name": "NASDAQ Futures", "short": "NQ"},
]

# European Markets
EUROPEAN_MARKETS = [
    {"symbol": "^GDAXI", "name": "DAX (Germany)", "short": "DAX"},
    {"symbol": "^FTSE", "name": "FTSE 100 (UK)", "short": "FTSE"},
    {"symbol": "^FCHI", "name": "CAC 40 (France)", "short": "CAC40"},
    {"symbol": "^STOXX50E", "name": "Euro Stoxx 50", "short": "STOXX50"},
    {"symbol": "^AEX", "name": "AEX (Netherlands)", "short": "AEX"},
]

# Asian Markets
ASIAN_MARKETS = [
    {"symbol": "^NSEI", "name": "NIFTY 50 (India)", "short": "NIFTY"},
    {"symbol": "^BSESN", "name": "SENSEX (India)", "short": "SENSEX"},
    {"symbol": "^HSI", "name": "Hang Seng (HK)", "short": "HSI"},
    {"symbol": "^N225", "name": "Nikkei 225 (Japan)", "short": "N225"},
    {"symbol": "^STI", "name": "Straits Times (SG)", "short": "STI"},
    {"symbol": "^KS11", "name": "KOSPI (Korea)", "short": "KOSPI"},
    {"symbol": "^AXJO", "name": "ASX 200 (Australia)", "short": "XJO"},
    {"symbol": "000001.SS", "name": "Shanghai Composite", "short": "SHCOMP"},
    {"symbol": "^TWII", "name": "TAIEX (Taiwan)", "short": "TAIEX"},
    {"symbol": "^JKSE", "name": "Jakarta (Indonesia)", "short": "JKSE"},
]

# India ADRs (traded on US exchanges)
INDIA_ADRS = [
    {"symbol": "INFY", "name": "Infosys ADR", "short": "INFY"},
    {"symbol": "WIT", "name": "Wipro ADR", "short": "WIT"},
    {"symbol": "IBN", "name": "ICICI Bank ADR", "short": "IBN"},
    {"symbol": "HDB", "name": "HDFC Bank ADR", "short": "HDB"},
    {"symbol": "RDY", "name": "Dr. Reddy's ADR", "short": "RDY"},
    {"symbol": "SIFY", "name": "Sify Technologies", "short": "SIFY"},
]

# Commodities (for sentiment)
COMMODITIES = [
    {"symbol": "GC=F", "name": "Gold Futures", "short": "GOLD"},
    {"symbol": "CL=F", "name": "Crude Oil WTI", "short": "CRUDE"},
    {"symbol": "SI=F", "name": "Silver Futures", "short": "SILVER"},
]

# All markets combined
ALL_GLOBAL_MARKETS = {
    "us_markets": US_MARKETS,
    "european_markets": EUROPEAN_MARKETS,
    "asian_markets": ASIAN_MARKETS,
    "india_adrs": INDIA_ADRS,
    "commodities": COMMODITIES,
}

# Weights for sentiment calculation
SENTIMENT_WEIGHTS = {
    # US Markets (45% total weight)
    "^GSPC": 0.15,      # S&P 500 - most important
    "^DJI": 0.10,       # Dow Jones
    "^IXIC": 0.10,      # NASDAQ
    "^RUT": 0.05,       # Russell 2000
    "ES=F": 0.05,       # S&P Futures
    
    # European (20% total weight)
    "^GDAXI": 0.08,     # DAX
    "^FTSE": 0.07,      # FTSE
    "^STOXX50E": 0.05,  # Euro Stoxx
    
    # Asian (25% total weight)
    "^N225": 0.08,      # Nikkei
    "^HSI": 0.07,       # Hang Seng
    "^NSEI": 0.05,      # Nifty 50
    "^BSESN": 0.03,     # Sensex
    "^KS11": 0.02,      # KOSPI
    
    # Fear/Sentiment Gauges (10% total - inverse)
    "^VIX": -0.07,      # VIX (inverse weight)
    "DX-Y.NYB": -0.03,  # DXY (strong dollar = risk-off)
}

# VIX levels for sentiment
VIX_LEVELS = {
    "extreme_fear": 30,
    "fear": 20,
    "neutral": 15,
    "greed": 12,
    "extreme_greed": 10,
}
