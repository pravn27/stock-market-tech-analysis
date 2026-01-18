"""
NSE India Data Fetcher
Fetches index and stock data directly from NSE India website
Used as fallback when yfinance doesn't have the data
"""

import requests
import pandas as pd
from typing import Dict, Optional, List
from datetime import datetime, timedelta
import time


class NSEFetcher:
    """
    Fetch data directly from NSE India website
    
    This is used as a fallback when Yahoo Finance doesn't have
    data for certain NSE indices.
    """
    
    BASE_URL = "https://www.nseindia.com"
    
    # NSE Index names mapping (display name -> NSE API name)
    # Reference: https://www.nseindia.com/market-data/live-market-indices
    NSE_INDEX_MAP = {
        # === BENCHMARK ===
        "NIFTY 50": "NIFTY 50",
        
        # === SECTORIAL ===
        # Banking & Finance
        "NIFTY BANK": "NIFTY BANK",
        "NIFTY PSU BANK": "NIFTY PSU BANK",
        "NIFTY PRIVATE BANK": "NIFTY PRIVATE BANK",
        "NIFTY FINANCIAL SERVICES": "NIFTY FINANCIAL SERVICES",
        "NIFTY FINANCIAL SERVICES 25/50": "NIFTY FINANCIAL SERVICES 25/50",
        "NIFTY FINANCIAL SERVICES EX-BANK": "NIFTY FINANCIAL SERVICES EX-BANK",
        
        # Technology
        "NIFTY IT": "NIFTY IT",
        
        # Healthcare
        "NIFTY PHARMA": "NIFTY PHARMA",
        "NIFTY HEALTHCARE INDEX": "NIFTY HEALTHCARE INDEX",
        
        # Consumer
        "NIFTY FMCG": "NIFTY FMCG",
        "NIFTY CONSUMER DURABLES": "NIFTY CONSUMER DURABLES",
        "NIFTY INDIA CONSUMPTION": "NIFTY INDIA CONSUMPTION",
        "NIFTY NON-CYCLICAL CONSUMER": "NIFTY NON-CYCLICAL CONSUMER",
        
        # Industrial & Manufacturing
        "NIFTY AUTO": "NIFTY AUTO",
        "NIFTY METAL": "NIFTY METAL",
        "NIFTY REALTY": "NIFTY REALTY",
        "NIFTY INFRASTRUCTURE": "NIFTY INFRASTRUCTURE",
        "NIFTY INDIA MANUFACTURING": "NIFTY INDIA MANUFACTURING",
        
        # Energy & Resources
        "NIFTY ENERGY": "NIFTY ENERGY",
        "NIFTY OIL & GAS": "NIFTY OIL & GAS",
        
        # Others
        "NIFTY MEDIA": "NIFTY MEDIA",
        "NIFTY COMMODITIES": "NIFTY COMMODITIES",
        "NIFTY MNC": "NIFTY MNC",
        "NIFTY SERVICES SECTOR": "NIFTY SERVICES SECTOR",
        "NIFTY PSE": "NIFTY PSE",
        "NIFTY CPSE": "NIFTY CPSE",
        "NIFTY CHEMICALS": "NIFTY CHEMICALS",
        
        # === BROAD MARKET ===
        "NIFTY NEXT 50": "NIFTY NEXT 50",
        "NIFTY 100": "NIFTY 100",
        "NIFTY 200": "NIFTY 200",
        "NIFTY 500": "NIFTY 500",
        "NIFTY TOTAL MARKET": "NIFTY TOTAL MARKET",
        
        # Midcap
        "NIFTY MIDCAP 50": "NIFTY MIDCAP 50",
        "NIFTY MIDCAP 100": "NIFTY MIDCAP 100",
        "NIFTY MIDCAP 150": "NIFTY MIDCAP 150",
        "NIFTY MIDCAP SELECT": "NIFTY MIDCAP SELECT",
        
        # Smallcap
        "NIFTY SMALLCAP 50": "NIFTY SMALLCAP 50",
        "NIFTY SMALLCAP 100": "NIFTY SMALLCAP 100",
        "NIFTY SMALLCAP 250": "NIFTY SMALLCAP 250",
        
        # Microcap & Combined
        "NIFTY MICROCAP 250": "NIFTY MICROCAP 250",
        "NIFTY LARGEMIDCAP 250": "NIFTY LARGEMIDCAP 250",
        "NIFTY MIDSMALLCAP 400": "NIFTY MIDSMALLCAP 400",
        
        # === THEMATIC ===
        "NIFTY INDIA DEFENCE": "NIFTY INDIA DEFENCE",
        "NIFTY INDIA DIGITAL": "NIFTY INDIA DIGITAL",
        "NIFTY HOUSING": "NIFTY HOUSING",
        "NIFTY CORE HOUSING": "NIFTY CORE HOUSING",
        "NIFTY INDIA INFRASTRUCTURE & LOGISTICS": "NIFTY INDIA INFRASTRUCTURE & LOGISTICS",
        "NIFTY TRANSPORTATION & LOGISTICS": "NIFTY TRANSPORTATION & LOGISTICS",
        "NIFTY INDIA TOURISM": "NIFTY INDIA TOURISM",
        "NIFTY RURAL": "NIFTY RURAL",
        "NIFTY CAPITAL MARKETS": "NIFTY CAPITAL MARKETS",
        "NIFTY EV & NEW AGE AUTOMOTIVE": "NIFTY EV & NEW AGE AUTOMOTIVE",
        "NIFTY MOBILITY": "NIFTY MOBILITY",
        "NIFTY INDIA NEW AGE CONSUMPTION": "NIFTY INDIA NEW AGE CONSUMPTION",
    }
    
    def __init__(self):
        self.session = None
        self._session_initialized = False
        self._last_init_time = 0
        self._cache = {}  # Cache for allIndices
        self._cache_time = 0
        self._cache_ttl = 60  # Cache for 60 seconds
    
    def _get_session(self):
        """Get or create a fresh session with cookies"""
        current_time = time.time()
        
        # Reinitialize session every 5 minutes or if not initialized
        if self.session is None or not self._session_initialized or (current_time - self._last_init_time > 300):
            self.session = requests.Session()
            
            # Browser-like headers for initial page load
            browser_headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                # Note: Don't specify Accept-Encoding to avoid brotli
                "Connection": "keep-alive",
            }
            
            try:
                # Hit main page to get cookies
                self.session.get(
                    self.BASE_URL,
                    headers=browser_headers,
                    timeout=10
                )
                time.sleep(0.3)  # Small delay to avoid rate limiting
                self._session_initialized = True
                self._last_init_time = current_time
            except Exception as e:
                print(f"NSE session init error: {e}")
                self._session_initialized = False
        
        return self.session
    
    def _get_api_headers(self):
        """Get headers for API requests"""
        return {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.9",
            # Note: Don't specify Accept-Encoding to avoid brotli which requests doesn't handle
            "X-Requested-With": "XMLHttpRequest",
            "Referer": "https://www.nseindia.com/market-data/live-equity-market",
            "Connection": "keep-alive",
        }
    
    def get_index_quote(self, index_name: str) -> Optional[Dict]:
        """
        Get current quote for an index from allIndices API
        
        Args:
            index_name: Name of the index (e.g., "NIFTY 50", "NIFTY FINANCIAL SERVICES")
            
        Returns:
            Dict with index data or None if failed
        """
        try:
            # Get all indices and find the one we need
            all_indices = self.get_all_indices()
            
            # Map our index name to NSE format if needed
            nse_index = self.NSE_INDEX_MAP.get(index_name, index_name)
            
            for idx in all_indices:
                # Match by index name
                if idx.get("index") == nse_index or idx.get("indexSymbol") == nse_index:
                    return {
                        "symbol": idx.get("indexSymbol", index_name),
                        "name": idx.get("index", index_name),
                        "lastPrice": idx.get("last", 0),
                        "change": idx.get("variation", 0),
                        "pChange": idx.get("percentChange", 0),
                        "open": idx.get("open", 0),
                        "dayHigh": idx.get("high", 0),
                        "dayLow": idx.get("low", 0),
                        "previousClose": idx.get("previousClose", 0),
                        "timestamp": datetime.now().isoformat(),
                    }
            
            print(f"Index {index_name} not found in NSE data")
            return None
            
        except Exception as e:
            print(f"NSE fetch error for {index_name}: {e}")
            return None
    
    def get_index_historical(self, index_name: str, days: int = 365) -> pd.DataFrame:
        """
        Get historical data for an index
        
        Since NSE historical API is complex, we'll use allIndices for current data
        and construct minimal historical from available fields.
        
        For proper historical analysis, we use the current price and calculate
        returns based on available period change percentages.
        
        Args:
            index_name: Name of the index
            days: Number of days of history
            
        Returns:
            DataFrame with OHLC data
        """
        try:
            nse_index = self.NSE_INDEX_MAP.get(index_name, index_name)
            
            # Get current data from allIndices
            all_indices = self.get_all_indices()
            
            index_data = None
            for idx in all_indices:
                if idx.get("index") == nse_index or idx.get("indexSymbol") == nse_index:
                    index_data = idx
                    break
            
            if not index_data:
                print(f"Index {index_name} not found in NSE allIndices")
                return pd.DataFrame()
            
            # NSE provides: last, previousClose, perChange365d, perChange30d
            # We can reconstruct approximate historical prices
            current_price = float(index_data.get("last", 0))
            prev_close = float(index_data.get("previousClose", current_price))
            
            if current_price == 0:
                return pd.DataFrame()
            
            # Create a DataFrame with at least current and previous day data
            dates = []
            closes = []
            
            # Today's data
            today = datetime.now().date()
            dates.append(today)
            closes.append(current_price)
            
            # Yesterday's close
            yesterday = today - timedelta(days=1)
            dates.append(yesterday)
            closes.append(prev_close)
            
            # Use perChange30d to estimate 30 days ago price
            per_change_30d = index_data.get("perChange30d", 0)
            if per_change_30d:
                price_30d_ago = current_price / (1 + float(per_change_30d) / 100)
                date_30d_ago = today - timedelta(days=30)
                dates.append(date_30d_ago)
                closes.append(price_30d_ago)
            
            # Use perChange365d to estimate 365 days ago price
            per_change_365d = index_data.get("perChange365d", 0)
            if per_change_365d:
                price_365d_ago = current_price / (1 + float(per_change_365d) / 100)
                date_365d_ago = today - timedelta(days=365)
                dates.append(date_365d_ago)
                closes.append(price_365d_ago)
            
            # Build DataFrame
            df = pd.DataFrame({
                "Date": dates,
                "Close": closes,
                "Open": closes,  # Approximate
                "High": closes,
                "Low": closes,
            })
            
            df["Date"] = pd.to_datetime(df["Date"])
            df = df.set_index("Date")
            df = df.sort_index()
            
            return df
            
        except Exception as e:
            print(f"NSE historical fetch error for {index_name}: {e}")
            return pd.DataFrame()
    
    def get_all_indices(self) -> List[Dict]:
        """
        Get list of all available indices with current values (cached)
        
        Returns:
            List of index data dicts
        """
        current_time = time.time()
        
        # Check cache first
        if self._cache.get("allIndices") and (current_time - self._cache_time < self._cache_ttl):
            return self._cache["allIndices"]
        
        session = self._get_session()
        
        try:
            url = f"{self.BASE_URL}/api/allIndices"
            headers = self._get_api_headers()
            
            response = session.get(
                url,
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    indices = data.get("data", [])
                    
                    # Cache the result
                    self._cache["allIndices"] = indices
                    self._cache_time = current_time
                    
                    return indices
                except Exception as json_err:
                    print(f"NSE JSON parse error: {json_err}")
                    # Force session refresh on next call
                    self._session_initialized = False
            
            print(f"NSE API returned status {response.status_code}")
            return []
            
        except Exception as e:
            print(f"NSE all indices fetch error: {e}")
            self._session_initialized = False  # Force refresh
            return []
    
    def get_stock_quote(self, symbol: str) -> Optional[Dict]:
        """
        Get current quote for a stock
        
        Args:
            symbol: Stock symbol (e.g., "RELIANCE", "TCS")
            
        Returns:
            Dict with stock data or None if failed
        """
        session = self._get_session()
        
        try:
            # Remove .NS suffix if present
            clean_symbol = symbol.replace(".NS", "").upper()
            
            url = f"{self.BASE_URL}/api/quote-equity"
            params = {"symbol": clean_symbol}
            headers = self._get_api_headers()
            
            response = session.get(
                url,
                headers=headers,
                params=params,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                price_info = data.get("priceInfo", {})
                
                return {
                    "symbol": clean_symbol,
                    "lastPrice": price_info.get("lastPrice", 0),
                    "change": price_info.get("change", 0),
                    "pChange": price_info.get("pChange", 0),
                    "open": price_info.get("open", 0),
                    "dayHigh": price_info.get("intraDayHighLow", {}).get("max", 0),
                    "dayLow": price_info.get("intraDayHighLow", {}).get("min", 0),
                    "previousClose": price_info.get("previousClose", 0),
                    "timestamp": datetime.now().isoformat(),
                }
            
            return None
            
        except Exception as e:
            print(f"NSE stock fetch error for {symbol}: {e}")
            return None


# Singleton instance
_nse_fetcher = None

def get_nse_fetcher() -> NSEFetcher:
    """Get or create NSE fetcher instance"""
    global _nse_fetcher
    if _nse_fetcher is None:
        _nse_fetcher = NSEFetcher()
    return _nse_fetcher
