"""
Nifty 50 Heavyweight Stocks with Weightage
Shows major stocks that drive Nifty 50 index movement
Reference: https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%2050
"""

# Nifty 50 stocks with approximate weightage (as of Jan 2026)
# Weightage changes based on market cap, so these are approximate values
NIFTY50_STOCKS = [
    # Top 10 Heavyweights (~60% of index)
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "weightage": 13.15},
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "weightage": 9.82},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank", "weightage": 8.12},
    {"symbol": "INFY.NS", "name": "Infosys", "weightage": 5.89},
    {"symbol": "TCS.NS", "name": "TCS", "weightage": 4.21},
    {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel", "weightage": 4.05},
    {"symbol": "ITC.NS", "name": "ITC", "weightage": 3.98},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "weightage": 3.45},
    {"symbol": "LT.NS", "name": "Larsen & Toubro", "weightage": 3.38},
    {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank", "weightage": 2.85},
    
    # Next 10 (~20% of index)
    {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever", "weightage": 2.68},
    {"symbol": "AXISBANK.NS", "name": "Axis Bank", "weightage": 2.52},
    {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance", "weightage": 2.15},
    {"symbol": "MARUTI.NS", "name": "Maruti Suzuki", "weightage": 1.95},
    {"symbol": "SUNPHARMA.NS", "name": "Sun Pharma", "weightage": 1.82},
    {"symbol": "HCLTECH.NS", "name": "HCL Tech", "weightage": 1.78},
    {"symbol": "TITAN.NS", "name": "Titan Company", "weightage": 1.72},
    {"symbol": "ASIANPAINT.NS", "name": "Asian Paints", "weightage": 1.65},
    {"symbol": "NTPC.NS", "name": "NTPC", "weightage": 1.58},
    {"symbol": "M&M.NS", "name": "Mahindra & Mahindra", "weightage": 1.52},
    
    # Next 10 (~10% of index)
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors", "weightage": 1.45},
    {"symbol": "ULTRACEMCO.NS", "name": "UltraTech Cement", "weightage": 1.38},
    {"symbol": "POWERGRID.NS", "name": "Power Grid Corp", "weightage": 1.32},
    {"symbol": "BAJAJFINSV.NS", "name": "Bajaj Finserv", "weightage": 1.28},
    {"symbol": "WIPRO.NS", "name": "Wipro", "weightage": 1.22},
    {"symbol": "ONGC.NS", "name": "ONGC", "weightage": 1.18},
    {"symbol": "TATASTEEL.NS", "name": "Tata Steel", "weightage": 1.15},
    {"symbol": "ADANIENT.NS", "name": "Adani Enterprises", "weightage": 1.12},
    {"symbol": "JSWSTEEL.NS", "name": "JSW Steel", "weightage": 1.08},
    {"symbol": "COALINDIA.NS", "name": "Coal India", "weightage": 1.05},
    
    # Next 10 (~6% of index)
    {"symbol": "TECHM.NS", "name": "Tech Mahindra", "weightage": 0.98},
    {"symbol": "INDUSINDBK.NS", "name": "IndusInd Bank", "weightage": 0.95},
    {"symbol": "NESTLEIND.NS", "name": "Nestle India", "weightage": 0.92},
    {"symbol": "GRASIM.NS", "name": "Grasim Industries", "weightage": 0.88},
    {"symbol": "TATACONSUM.NS", "name": "Tata Consumer", "weightage": 0.85},
    {"symbol": "DRREDDY.NS", "name": "Dr. Reddy's Labs", "weightage": 0.82},
    {"symbol": "BRITANNIA.NS", "name": "Britannia", "weightage": 0.78},
    {"symbol": "HINDALCO.NS", "name": "Hindalco", "weightage": 0.75},
    {"symbol": "ADANIPORTS.NS", "name": "Adani Ports", "weightage": 0.72},
    {"symbol": "CIPLA.NS", "name": "Cipla", "weightage": 0.68},
    
    # Bottom 10 (~4% of index)
    {"symbol": "DIVISLAB.NS", "name": "Divi's Labs", "weightage": 0.65},
    {"symbol": "APOLLOHOSP.NS", "name": "Apollo Hospitals", "weightage": 0.62},
    {"symbol": "EICHERMOT.NS", "name": "Eicher Motors", "weightage": 0.58},
    {"symbol": "BPCL.NS", "name": "BPCL", "weightage": 0.55},
    {"symbol": "SBILIFE.NS", "name": "SBI Life Insurance", "weightage": 0.52},
    {"symbol": "HEROMOTOCO.NS", "name": "Hero MotoCorp", "weightage": 0.48},
    {"symbol": "BAJAJ-AUTO.NS", "name": "Bajaj Auto", "weightage": 0.45},
    {"symbol": "SHRIRAMFIN.NS", "name": "Shriram Finance", "weightage": 0.42},
    {"symbol": "TRENT.NS", "name": "Trent", "weightage": 0.38},
    {"symbol": "BEL.NS", "name": "Bharat Electronics", "weightage": 0.35},
]

# Get just the top heavyweight stocks (top 20 by weightage)
NIFTY50_TOP_HEAVYWEIGHTS = NIFTY50_STOCKS[:20]

# Total weightage should be ~100%
TOTAL_WEIGHTAGE = sum(s["weightage"] for s in NIFTY50_STOCKS)
