"""
Bank Nifty Heavyweight Stocks with Weightage
Shows major banking stocks that drive Bank Nifty index movement
Reference: https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%20BANK
"""

# Bank Nifty stocks with approximate weightage (as of Jan 2026)
# Bank Nifty has 12 banking stocks
BANKNIFTY_STOCKS = [
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "weightage": 28.52},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank", "weightage": 23.18},
    {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank", "weightage": 10.25},
    {"symbol": "AXISBANK.NS", "name": "Axis Bank", "weightage": 9.85},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "weightage": 9.42},
    {"symbol": "INDUSINDBK.NS", "name": "IndusInd Bank", "weightage": 5.12},
    {"symbol": "BANKBARODA.NS", "name": "Bank of Baroda", "weightage": 3.85},
    {"symbol": "FEDERALBNK.NS", "name": "Federal Bank", "weightage": 2.95},
    {"symbol": "PNB.NS", "name": "Punjab National Bank", "weightage": 2.48},
    {"symbol": "IDFCFIRSTB.NS", "name": "IDFC First Bank", "weightage": 2.15},
    {"symbol": "BANDHANBNK.NS", "name": "Bandhan Bank", "weightage": 1.28},
    {"symbol": "AUBANK.NS", "name": "AU Small Finance Bank", "weightage": 0.95},
]

# Total weightage should be ~100%
TOTAL_WEIGHTAGE = sum(s["weightage"] for s in BANKNIFTY_STOCKS)
