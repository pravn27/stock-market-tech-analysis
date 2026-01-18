"""
Sector Relative Performance Scanner
Compares NIFTY sector indices against NIFTY 50 to identify
outperforming and underperforming sectors across timeframes.

Data Sources:
- Primary: yfinance (Yahoo Finance)
- Fallback: NSE India (for indices not available on Yahoo Finance)
"""

import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta

# Import NSE fallback fetcher
from core.nse_fetcher import get_nse_fetcher


# =============================================================================
# INDEX DEFINITIONS - Yahoo Finance Primary, NSE Fallback
# =============================================================================
# Primary: Yahoo Finance (^SYMBOL) - provides historical data for accurate returns
# Fallback: NSE India (NSE:NAME) - for indices not available on Yahoo Finance
# Reference: https://www.nseindia.com/market-data/live-market-indices

# Sectorial Indices (All major sectors)
NIFTY_SECTORS_MAIN = {
    "NIFTY 50": "^NSEI",
    
    # Banking & Finance
    "Bank Nifty": "^NSEBANK",
    "Nifty PSU Bank": "^CNXPSUBANK",
    "Nifty Pvt Bank": "NSE:NIFTY PRIVATE BANK",  # NSE fallback - Yahoo delisted
    "Nifty Finance": "NSE:NIFTY FINANCIAL SERVICES",  # NSE fallback - Yahoo delisted
    
    # Technology
    "Nifty IT": "^CNXIT",
    
    # Healthcare
    "Nifty Pharma": "^CNXPHARMA",
    "Nifty Healthcare": "NSE:NIFTY HEALTHCARE INDEX",  # NSE fallback
    
    # Consumer
    "Nifty FMCG": "^CNXFMCG",
    "Nifty Consumer Durables": "NSE:NIFTY CONSUMER DURABLES",  # NSE fallback
    "Nifty India Consumption": "NSE:NIFTY INDIA CONSUMPTION",  # NSE fallback
    
    # Industrial & Manufacturing
    "Nifty Auto": "^CNXAUTO",
    "Nifty Metal": "^CNXMETAL",
    "Nifty Realty": "^CNXREALTY",
    "Nifty Infra": "^CNXINFRA",
    
    # Energy & Resources
    "Nifty Energy": "^CNXENERGY",
    "Nifty Oil & Gas": "^CNXENERGY",  # Same as Energy on Yahoo
    
    # Others
    "Nifty Media": "^CNXMEDIA",
    "Nifty Commodities": "NSE:NIFTY COMMODITIES",  # NSE fallback
    "Nifty MNC": "^CNXMNC",
    "Nifty Services": "^CNXSERVICE",
    "Nifty PSE": "^CNXPSE",
    "Nifty CPSE": "NSE:NIFTY CPSE",  # NSE fallback
}

# Broader Market Indices
NIFTY_BROAD_INDICES = {
    # Benchmark
    "NIFTY 50": "^NSEI",
    
    # Broad Market
    "Nifty Next 50": "^NIFTYJR",
    "Nifty 100": "^CNX100",
    "Nifty 200": "^CNX200",
    "Nifty 500": "^CNX500",
    "Nifty Total Market": "NSE:NIFTY TOTAL MARKET",  # NSE fallback
    
    # Midcap Indices
    "Nifty Midcap 50": "^NIFTYMIDCAP50",
    "Nifty Midcap 100": "^CNXMIDCAP",
    "Nifty Midcap 150": "NSE:NIFTY MIDCAP 150",  # NSE fallback
    "Nifty Midcap Select": "NSE:NIFTY MIDCAP SELECT",  # NSE fallback
    
    # Smallcap Indices
    "Nifty Smallcap 50": "^NIFTYSMLCAP50",
    "Nifty Smallcap 100": "^CNXSMALLCAP",
    "Nifty Smallcap 250": "NSE:NIFTY SMALLCAP 250",  # NSE fallback
    
    # Microcap
    "Nifty Microcap 250": "NSE:NIFTY MICROCAP 250",  # NSE fallback
    
    # Combined
    "Nifty LargeMidcap 250": "NSE:NIFTY LARGEMIDCAP 250",  # NSE fallback
    "Nifty MidSmallcap 400": "NSE:NIFTY MIDSMALLCAP 400",  # NSE fallback
}

# Thematic Indices (Most are NSE-only)
NIFTY_THEMATIC = {
    "NIFTY 50": "^NSEI",
    
    # Defence & Manufacturing
    "Nifty India Defence": "NSE:NIFTY INDIA DEFENCE",  # NSE fallback
    "Nifty India Manufacturing": "NSE:NIFTY INDIA MANUFACTURING",  # NSE fallback
    
    # Digital & Technology
    "Nifty India Digital": "NSE:NIFTY INDIA DIGITAL",  # NSE fallback
    
    # Housing & Infrastructure
    "Nifty Housing": "NSE:NIFTY HOUSING",  # NSE fallback
    "Nifty Core Housing": "NSE:NIFTY CORE HOUSING",  # NSE fallback
    "Nifty Infra & Logistics": "NSE:NIFTY INDIA INFRASTRUCTURE & LOGISTICS",  # NSE fallback
    "Nifty Transport & Logistics": "NSE:NIFTY TRANSPORTATION & LOGISTICS",  # NSE fallback
    
    # Consumption & Tourism
    "Nifty India Tourism": "NSE:NIFTY INDIA TOURISM",  # NSE fallback
    "Nifty Rural": "NSE:NIFTY RURAL",  # NSE fallback
    "Nifty Non-Cyclical Consumer": "NSE:NIFTY NON-CYCLICAL CONSUMER",  # NSE fallback
    
    # Others
    "Nifty Capital Markets": "NSE:NIFTY CAPITAL MARKETS",  # NSE fallback
    "Nifty Chemicals": "NSE:NIFTY CHEMICALS",  # NSE fallback
    "Nifty EV & New Age Auto": "NSE:NIFTY EV & NEW AGE AUTOMOTIVE",  # NSE fallback
    "Nifty Mobility": "NSE:NIFTY MOBILITY",  # NSE fallback
}

# All Indices Combined (Sectors + Broad Market + Thematic)
NIFTY_ALL_SECTORS = {
    # Benchmark
    "NIFTY 50": "^NSEI",
    
    # === SECTORIAL ===
    # Banking & Finance
    "Bank Nifty": "^NSEBANK",
    "Nifty PSU Bank": "^CNXPSUBANK",
    "Nifty Pvt Bank": "NSE:NIFTY PRIVATE BANK",  # NSE fallback - Yahoo delisted
    "Nifty Finance": "NSE:NIFTY FINANCIAL SERVICES",  # NSE fallback - Yahoo delisted
    
    # Technology
    "Nifty IT": "^CNXIT",
    
    # Healthcare
    "Nifty Pharma": "^CNXPHARMA",
    "Nifty Healthcare": "NSE:NIFTY HEALTHCARE INDEX",  # NSE fallback
    
    # Consumer
    "Nifty FMCG": "^CNXFMCG",
    "Nifty Consumer Durables": "NSE:NIFTY CONSUMER DURABLES",  # NSE fallback
    "Nifty India Consumption": "NSE:NIFTY INDIA CONSUMPTION",  # NSE fallback
    
    # Industrial & Manufacturing
    "Nifty Auto": "^CNXAUTO",
    "Nifty Metal": "^CNXMETAL",
    "Nifty Realty": "^CNXREALTY",
    "Nifty Infra": "^CNXINFRA",
    
    # Energy & Resources
    "Nifty Energy": "^CNXENERGY",
    "Nifty Oil & Gas": "^CNXENERGY",  # Same as Energy on Yahoo
    
    # Others
    "Nifty Media": "^CNXMEDIA",
    "Nifty Commodities": "NSE:NIFTY COMMODITIES",  # NSE fallback
    "Nifty MNC": "^CNXMNC",
    "Nifty Services": "^CNXSERVICE",
    "Nifty PSE": "^CNXPSE",
    "Nifty CPSE": "NSE:NIFTY CPSE",  # NSE fallback
    
    # === BROAD MARKET ===
    "Nifty Next 50": "^NIFTYJR",
    "Nifty 100": "^CNX100",
    "Nifty 200": "^CNX200",
    "Nifty 500": "^CNX500",
    "Nifty Total Market": "NSE:NIFTY TOTAL MARKET",  # NSE fallback
    
    # Midcap
    "Nifty Midcap 50": "^NIFTYMIDCAP50",
    "Nifty Midcap 100": "^CNXMIDCAP",
    "Nifty Midcap 150": "NSE:NIFTY MIDCAP 150",  # NSE fallback
    "Nifty Midcap Select": "NSE:NIFTY MIDCAP SELECT",  # NSE fallback
    
    # Smallcap
    "Nifty Smallcap 50": "^NIFTYSMLCAP50",
    "Nifty Smallcap 100": "^CNXSMALLCAP",
    "Nifty Smallcap 250": "NSE:NIFTY SMALLCAP 250",  # NSE fallback
    
    # Microcap & Combined
    "Nifty Microcap 250": "NSE:NIFTY MICROCAP 250",  # NSE fallback
    "Nifty LargeMidcap 250": "NSE:NIFTY LARGEMIDCAP 250",  # NSE fallback
    "Nifty MidSmallcap 400": "NSE:NIFTY MIDSMALLCAP 400",  # NSE fallback
    
    # === THEMATIC ===
    "Nifty India Defence": "NSE:NIFTY INDIA DEFENCE",  # NSE fallback
    "Nifty India Manufacturing": "NSE:NIFTY INDIA MANUFACTURING",  # NSE fallback
    "Nifty India Digital": "NSE:NIFTY INDIA DIGITAL",  # NSE fallback
    "Nifty Housing": "NSE:NIFTY HOUSING",  # NSE fallback
    "Nifty Capital Markets": "NSE:NIFTY CAPITAL MARKETS",  # NSE fallback
    "Nifty Chemicals": "NSE:NIFTY CHEMICALS",  # NSE fallback
    "Nifty Transport & Logistics": "NSE:NIFTY TRANSPORTATION & LOGISTICS",  # NSE fallback
    "Nifty EV & New Age Auto": "NSE:NIFTY EV & NEW AGE AUTOMOTIVE",
}


class SectorRelativeStrength:
    """Analyze sector relative strength vs NIFTY 50"""
    
    def __init__(self, sectors: Optional[Dict[str, str]] = None):
        self.sectors = sectors if sectors is not None else NIFTY_SECTORS_MAIN
        self.benchmark = "NIFTY 50"
        self.benchmark_symbol = "^NSEI"
        self.nse_fetcher = None  # Lazy init
    
    def _get_nse_fetcher(self):
        """Get NSE fetcher (lazy initialization)"""
        if self.nse_fetcher is None:
            self.nse_fetcher = get_nse_fetcher()
        return self.nse_fetcher
    
    def _is_nse_symbol(self, symbol: str) -> bool:
        """Check if symbol should use NSE fallback"""
        return symbol.startswith("NSE:")
    
    def _get_nse_index_name(self, symbol: str) -> str:
        """Extract NSE index name from symbol"""
        return symbol.replace("NSE:", "")
    
    def fetch_index_data(self, symbol: str, period: str = "6mo", interval: str = "1d", index_name: str = None) -> pd.DataFrame:
        """
        Fetch historical data for an index
        
        Tries yfinance first, falls back to NSE India if:
        - Symbol starts with "NSE:" (NSE-only index)
        - yfinance returns empty data
        
        Args:
            symbol: Index symbol (Yahoo format or NSE:INDEX_NAME)
            period: Data period (e.g., "6mo", "1y")
            interval: Data interval (e.g., "1d", "1h")
            index_name: Human-readable index name (for NSE lookup)
            
        Returns:
            DataFrame with OHLC data
        """
        # Check if this is an NSE-only symbol
        if self._is_nse_symbol(symbol):
            nse_index = self._get_nse_index_name(symbol)
            print(f"Using NSE fallback for {nse_index}")
            return self._fetch_from_nse(nse_index)
        
        # Try yfinance first
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period, interval=interval)
            
            # Check if we got valid data
            if df.empty or len(df) < 2:
                print(f"yfinance returned empty for {symbol}, trying NSE fallback...")
                # Try NSE fallback using index_name
                if index_name:
                    return self._fetch_from_nse(index_name)
                return pd.DataFrame()
            
            return df
            
        except Exception as e:
            print(f"yfinance error for {symbol}: {e}")
            # Try NSE fallback
            if index_name:
                print(f"Trying NSE fallback for {index_name}...")
                return self._fetch_from_nse(index_name)
            return pd.DataFrame()
    
    def _fetch_from_nse(self, index_name: str) -> pd.DataFrame:
        """Fetch data from NSE India"""
        try:
            nse = self._get_nse_fetcher()
            df = nse.get_index_historical(index_name, days=180)
            return df
        except Exception as e:
            print(f"NSE fetch error for {index_name}: {e}")
            return pd.DataFrame()
    
    def fetch_intraday_data(self, symbol: str, index_name: str = None) -> pd.DataFrame:
        """
        Fetch intraday data (1hr intervals) for last 7 days
        
        Note: NSE doesn't provide historical intraday data,
        so this only works for yfinance symbols.
        """
        # NSE symbols don't have intraday history
        if self._is_nse_symbol(symbol):
            return pd.DataFrame()
        
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(period="7d", interval="1h")
            return df
        except Exception as e:
            print(f"Error fetching intraday {symbol}: {e}")
            return pd.DataFrame()
    
    def calculate_returns(self, df: pd.DataFrame, lookback: int = 1) -> Dict[str, float]:
        """
        Calculate returns comparing with N periods back closing price
        
        Args:
            df: DataFrame with OHLC data
            lookback: Number of periods back to compare (1 = previous period, 2 = 2 periods back, etc.)
        
        Returns:
            Dict with returns for each period
        """
        if df.empty or len(df) < 2:
            return {}
        
        returns = {}
        df = df.copy()
        df = df.reset_index()
        df['Date'] = pd.to_datetime(df['Date']) if 'Date' in df.columns else pd.to_datetime(df.index)
        
        current_price = float(df['Close'].iloc[-1])
        current_date = df['Date'].iloc[-1]
        
        # Daily: vs N days back close
        daily_offset = lookback
        if len(df) > daily_offset:
            prev_day_close = float(df['Close'].iloc[-(daily_offset + 1)])
            returns['Daily'] = ((current_price - prev_day_close) / prev_day_close) * 100
        else:
            returns['Daily'] = None
        
        # Weekly: vs N weeks back's last trading day close
        try:
            df['week'] = df['Date'].apply(lambda x: x.isocalendar()[1])
            df['year'] = df['Date'].apply(lambda x: x.year)
            df['year_week'] = df['year'] * 100 + df['week']
            
            # Get unique weeks sorted
            unique_weeks = df['year_week'].unique()
            unique_weeks.sort()
            
            # Find current week position
            current_year_week = current_date.year * 100 + current_date.isocalendar()[1]
            
            # Find all weeks before current week
            prev_weeks = [w for w in unique_weeks if w < current_year_week]
            
            if len(prev_weeks) >= lookback:
                target_week = prev_weeks[-lookback]
                target_week_data = df[df['year_week'] == target_week]
                if not target_week_data.empty:
                    prev_week_close = float(target_week_data['Close'].iloc[-1])
                    returns['Weekly'] = ((current_price - prev_week_close) / prev_week_close) * 100
                else:
                    returns['Weekly'] = None
            else:
                returns['Weekly'] = None
        except Exception:
            returns['Weekly'] = None
        
        # Monthly: vs N months back's last trading day close
        try:
            df['month'] = df['Date'].apply(lambda x: x.month)
            df['year'] = df['Date'].apply(lambda x: x.year)
            df['year_month'] = df['year'] * 100 + df['month']
            
            # Get unique months sorted
            unique_months = df['year_month'].unique()
            unique_months.sort()
            
            # Find current month position
            current_year_month = current_date.year * 100 + current_date.month
            
            # Find all months before current month
            prev_months = [m for m in unique_months if m < current_year_month]
            
            if len(prev_months) >= lookback:
                target_month = prev_months[-lookback]
                target_month_data = df[df['year_month'] == target_month]
                if not target_month_data.empty:
                    prev_month_close = float(target_month_data['Close'].iloc[-1])
                    returns['Monthly'] = ((current_price - prev_month_close) / prev_month_close) * 100
                else:
                    returns['Monthly'] = None
            else:
                returns['Monthly'] = None
        except Exception:
            returns['Monthly'] = None
        
        # Quarterly (3 Month): vs (3 * lookback) months ago last trading day close
        try:
            months_back = 3 * lookback
            target_date = current_date - pd.DateOffset(months=months_back)
            prev_quarter_data = df[df['Date'] <= target_date]
            if not prev_quarter_data.empty:
                prev_quarter_close = float(prev_quarter_data['Close'].iloc[-1])
                returns['3 Month'] = ((current_price - prev_quarter_close) / prev_quarter_close) * 100
            else:
                returns['3 Month'] = None
        except Exception:
            returns['3 Month'] = None
        
        return returns
    
    def calculate_intraday_returns(self, df: pd.DataFrame, lookback: int = 1) -> Dict[str, float]:
        """
        Calculate returns for intraday timeframes
        
        Args:
            df: DataFrame with OHLC data (1hr interval)
            lookback: Number of periods back (1 = 1hr/4hr ago, 2 = 2hr/8hr ago, etc.)
        
        Returns:
            Dict with returns for each intraday period
        """
        if df.empty or len(df) < 2:
            return {}
        
        returns = {}
        df = df.copy()
        
        current_price = float(df['Close'].iloc[-1])
        
        # 1 Hour: vs N hours ago close
        one_hour_offset = lookback
        if len(df) > one_hour_offset:
            one_hour_ago_close = float(df['Close'].iloc[-(one_hour_offset + 1)])
            returns['1 Hour'] = ((current_price - one_hour_ago_close) / one_hour_ago_close) * 100
        else:
            returns['1 Hour'] = None
        
        # 4 Hour: vs (4 * N) hours ago close
        four_hour_offset = 4 * lookback
        if len(df) > four_hour_offset:
            four_hour_ago_close = float(df['Close'].iloc[-(four_hour_offset + 1)])
            returns['4 Hour'] = ((current_price - four_hour_ago_close) / four_hour_ago_close) * 100
        else:
            returns['4 Hour'] = None
        
        return returns
    
    def calculate_relative_strength(self, sector_returns: Dict, benchmark_returns: Dict) -> Dict:
        """
        Calculate relative strength (sector return - benchmark return)
        Positive = outperforming, Negative = underperforming
        """
        relative = {}
        for period in sector_returns:
            if sector_returns[period] is not None and benchmark_returns.get(period) is not None:
                relative[period] = sector_returns[period] - benchmark_returns[period]
            else:
                relative[period] = None
        return relative
    
    def analyze_all_sectors(self, progress_callback=None, include_intraday: bool = True, lookback: int = 1) -> List[Dict]:
        """
        Analyze all sectors and calculate relative strength
        
        Args:
            progress_callback: Optional callback for progress updates
            include_intraday: Whether to include 1hr and 4hr timeframes
            lookback: Number of periods back to compare (1 = previous period, 2 = 2 periods back, etc.)
        
        Compares with N periods back closing prices:
        - 1 Hour: vs N hours ago close
        - 4 Hour: vs (4*N) hours ago close
        - Daily: vs N days ago close
        - Weekly: vs N weeks ago close
        - Monthly: vs N months ago close
        - 3 Month: vs (3*N) months ago close
        
        Returns:
            List of dicts with sector analysis
        """
        results = []
        
        # Fetch benchmark data first
        benchmark_df = self.fetch_index_data(self.benchmark_symbol, period="6mo")
        benchmark_returns = self.calculate_returns(benchmark_df, lookback=lookback)
        
        # Fetch intraday benchmark data
        benchmark_intraday_returns = {}
        if include_intraday:
            benchmark_intraday_df = self.fetch_intraday_data(self.benchmark_symbol)
            benchmark_intraday_returns = self.calculate_intraday_returns(benchmark_intraday_df, lookback=lookback)
            benchmark_returns.update(benchmark_intraday_returns)
        
        if not benchmark_returns:
            return results
        
        # Add benchmark to results
        benchmark_price = benchmark_df['Close'].iloc[-1] if not benchmark_df.empty else 0
        results.append({
            'name': self.benchmark,
            'symbol': self.benchmark_symbol,
            'price': float(benchmark_price),
            'returns': benchmark_returns,
            'relative': {p: 0.0 for p in benchmark_returns.keys()},  # Benchmark relative to itself is 0
            'is_benchmark': True,
            'lookback': lookback
        })
        
        # Analyze each sector
        sector_items = [(k, v) for k, v in self.sectors.items() if k != self.benchmark]
        
        for i, (name, symbol) in enumerate(sector_items):
            if progress_callback:
                progress_callback((i + 1) / len(sector_items), f"Analyzing {name}...")
            
            # Pass index_name for NSE fallback lookup
            df = self.fetch_index_data(symbol, period="6mo", index_name=name)
            
            if df.empty:
                print(f"No data for {name} ({symbol}), skipping...")
                continue
            
            returns = self.calculate_returns(df, lookback=lookback)
            
            # Add intraday returns (NSE symbols won't have intraday)
            if include_intraday and not self._is_nse_symbol(symbol):
                intraday_df = self.fetch_intraday_data(symbol, index_name=name)
                intraday_returns = self.calculate_intraday_returns(intraday_df, lookback=lookback)
                returns.update(intraday_returns)
            
            relative = self.calculate_relative_strength(returns, benchmark_returns)
            
            # Determine display symbol
            display_symbol = symbol if not self._is_nse_symbol(symbol) else f"NSE:{name}"
            
            results.append({
                'name': name,
                'symbol': display_symbol,
                'price': float(df['Close'].iloc[-1]),
                'returns': returns,
                'relative': relative,
                'is_benchmark': False,
                'data_source': 'NSE' if self._is_nse_symbol(symbol) else 'Yahoo'
            })
        
        return results
    
    def categorize_sectors(self, results: List[Dict], timeframe: str = 'Weekly') -> Tuple[List, List, List]:
        """
        Categorize sectors into outperforming, neutral, and underperforming
        
        Args:
            results: List of sector analysis results
            timeframe: Which timeframe to use for categorization
            
        Returns:
            Tuple of (outperforming, neutral, underperforming) lists
        """
        outperforming = []
        neutral = []
        underperforming = []
        
        for sector in results:
            if sector['is_benchmark']:
                continue
            
            rel = sector['relative'].get(timeframe)
            if rel is None:
                continue
            
            if rel > 1.0:  # More than 1% outperformance
                outperforming.append(sector)
            elif rel < -1.0:  # More than 1% underperformance
                underperforming.append(sector)
            else:
                neutral.append(sector)
        
        # Sort by relative strength
        outperforming.sort(key=lambda x: x['relative'].get(timeframe, 0), reverse=True)
        underperforming.sort(key=lambda x: x['relative'].get(timeframe, 0))
        
        return outperforming, neutral, underperforming
    
    def get_sector_ranking(self, results: List[Dict], timeframe: str = 'Weekly') -> List[Dict]:
        """
        Rank all sectors by relative strength for a timeframe
        """
        ranked = [s for s in results if not s['is_benchmark']]
        ranked.sort(key=lambda x: x['relative'].get(timeframe, 0) or -999, reverse=True)
        
        for i, sector in enumerate(ranked, 1):
            sector['rank'] = i
        
        return ranked


class StockRelativeStrength:
    """
    Analyze individual stocks relative strength vs NIFTY 50
    Flow: NIFTY 50 → Sector Index → Individual Stocks
    """
    
    def __init__(self):
        self.benchmark_symbol = "^NSEI"
        self.benchmark_name = "NIFTY 50"
    
    def fetch_stock_data(self, symbol: str, period: str = "6mo") -> pd.DataFrame:
        """Fetch historical data for a stock"""
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period)
            return df
        except Exception as e:
            return pd.DataFrame()
    
    def fetch_intraday_data(self, symbol: str) -> pd.DataFrame:
        """Fetch intraday data (1hr intervals) for last 7 days"""
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(period="7d", interval="1h")
            return df
        except Exception:
            return pd.DataFrame()
    
    def calculate_returns(self, df: pd.DataFrame, lookback: int = 1) -> Dict[str, float]:
        """
        Calculate returns for different timeframes
        
        Args:
            df: DataFrame with OHLC data
            lookback: Number of periods back to compare
        """
        if df.empty or len(df) < 2:
            return {}
        
        returns = {}
        df = df.copy()
        df = df.reset_index()
        df['Date'] = pd.to_datetime(df['Date']) if 'Date' in df.columns else pd.to_datetime(df.index)
        
        current_price = float(df['Close'].iloc[-1])
        current_date = df['Date'].iloc[-1]
        
        # Daily: vs N days back
        daily_offset = lookback
        if len(df) > daily_offset:
            prev_close = float(df['Close'].iloc[-(daily_offset + 1)])
            returns['Daily'] = ((current_price - prev_close) / prev_close) * 100
        
        # Weekly: vs N weeks back
        try:
            df['week'] = df['Date'].apply(lambda x: x.isocalendar()[1])
            df['year'] = df['Date'].apply(lambda x: x.year)
            df['year_week'] = df['year'] * 100 + df['week']
            
            unique_weeks = df['year_week'].unique()
            unique_weeks.sort()
            
            current_year_week = current_date.year * 100 + current_date.isocalendar()[1]
            prev_weeks = [w for w in unique_weeks if w < current_year_week]
            
            if len(prev_weeks) >= lookback:
                target_week = prev_weeks[-lookback]
                target_week_data = df[df['year_week'] == target_week]
                if not target_week_data.empty:
                    prev_close = float(target_week_data['Close'].iloc[-1])
                    returns['Weekly'] = ((current_price - prev_close) / prev_close) * 100
        except:
            pass
        
        # Monthly: vs N months back
        try:
            df['month'] = df['Date'].apply(lambda x: x.month)
            df['year_month'] = df['year'] * 100 + df['month']
            
            unique_months = df['year_month'].unique()
            unique_months.sort()
            
            current_year_month = current_date.year * 100 + current_date.month
            prev_months = [m for m in unique_months if m < current_year_month]
            
            if len(prev_months) >= lookback:
                target_month = prev_months[-lookback]
                target_month_data = df[df['year_month'] == target_month]
                if not target_month_data.empty:
                    prev_close = float(target_month_data['Close'].iloc[-1])
                    returns['Monthly'] = ((current_price - prev_close) / prev_close) * 100
        except:
            pass
        
        return returns
    
    def calculate_intraday_returns(self, df: pd.DataFrame, lookback: int = 1) -> Dict[str, float]:
        """
        Calculate intraday returns
        
        Args:
            df: DataFrame with OHLC data (1hr interval)
            lookback: Number of periods back to compare
        """
        if df.empty or len(df) < 2:
            return {}
        
        returns = {}
        current_price = float(df['Close'].iloc[-1])
        
        # 1 Hour: vs N hours ago
        one_hour_offset = lookback
        if len(df) > one_hour_offset:
            returns['1 Hour'] = ((current_price - float(df['Close'].iloc[-(one_hour_offset + 1)])) / float(df['Close'].iloc[-(one_hour_offset + 1)])) * 100
        
        # 4 Hour: vs (4*N) hours ago
        four_hour_offset = 4 * lookback
        if len(df) > four_hour_offset:
            returns['4 Hour'] = ((current_price - float(df['Close'].iloc[-(four_hour_offset + 1)])) / float(df['Close'].iloc[-(four_hour_offset + 1)])) * 100
        
        return returns
    
    def analyze_sector_stocks(self, sector_name: str, stocks: List[str], 
                              progress_callback=None, include_intraday: bool = True,
                              lookback: int = 1) -> Dict:
        """
        Analyze all stocks in a sector and compare with NIFTY 50
        
        Args:
            sector_name: Name of the sector
            stocks: List of stock symbols
            progress_callback: Optional callback for progress updates
            include_intraday: Whether to include 1hr and 4hr timeframes
            lookback: Number of periods back to compare
        
        Returns:
            Dict with benchmark, sector stocks analysis
        """
        from core.sector_stocks import SECTOR_STOCKS_MAP
        
        results = {
            'sector_name': sector_name,
            'benchmark': None,
            'stocks': [],
            'outperforming': [],
            'underperforming': [],
            'neutral': [],
            'lookback': lookback
        }
        
        # Fetch benchmark data
        benchmark_df = self.fetch_stock_data(self.benchmark_symbol, period="6mo")
        benchmark_returns = self.calculate_returns(benchmark_df, lookback=lookback)
        
        if include_intraday:
            intraday_df = self.fetch_intraday_data(self.benchmark_symbol)
            intraday_returns = self.calculate_intraday_returns(intraday_df, lookback=lookback)
            benchmark_returns.update(intraday_returns)
        
        if not benchmark_returns:
            return results
        
        results['benchmark'] = {
            'name': self.benchmark_name,
            'symbol': self.benchmark_symbol,
            'price': float(benchmark_df['Close'].iloc[-1]) if not benchmark_df.empty else 0,
            'returns': benchmark_returns
        }
        
        # Analyze each stock
        for i, symbol in enumerate(stocks):
            if progress_callback:
                progress_callback((i + 1) / len(stocks), f"Analyzing {symbol}...")
            
            try:
                df = self.fetch_stock_data(symbol, period="6mo")
                if df.empty:
                    continue
                
                returns = self.calculate_returns(df, lookback=lookback)
                
                if include_intraday:
                    intraday_df = self.fetch_intraday_data(symbol)
                    intraday_returns = self.calculate_intraday_returns(intraday_df, lookback=lookback)
                    returns.update(intraday_returns)
                
                # Calculate relative strength
                relative = {}
                for period in returns:
                    if returns.get(period) is not None and benchmark_returns.get(period) is not None:
                        relative[period] = returns[period] - benchmark_returns[period]
                
                # Get stock info
                ticker = yf.Ticker(symbol)
                info = ticker.info
                stock_name = info.get('longName', symbol.replace('.NS', ''))
                
                stock_data = {
                    'symbol': symbol,
                    'name': stock_name,
                    'price': float(df['Close'].iloc[-1]),
                    'returns': returns,
                    'relative': relative
                }
                
                results['stocks'].append(stock_data)
                
                # Categorize based on Weekly relative strength
                weekly_rs = relative.get('Weekly', 0) or 0
                if weekly_rs > 1:
                    results['outperforming'].append(stock_data)
                elif weekly_rs < -1:
                    results['underperforming'].append(stock_data)
                else:
                    results['neutral'].append(stock_data)
                    
            except Exception as e:
                continue
        
        # Sort by relative strength
        results['outperforming'].sort(key=lambda x: x['relative'].get('Weekly', 0) or 0, reverse=True)
        results['underperforming'].sort(key=lambda x: x['relative'].get('Weekly', 0) or 0)
        results['stocks'].sort(key=lambda x: x['relative'].get('Weekly', 0) or 0, reverse=True)
        
        return results
    
    def get_stock_ranking(self, stocks_data: List[Dict], timeframe: str = 'Weekly') -> List[Dict]:
        """Rank stocks by relative strength"""
        ranked = sorted(stocks_data, key=lambda x: x['relative'].get(timeframe, 0) or -999, reverse=True)
        for i, stock in enumerate(ranked, 1):
            stock['rank'] = i
        return ranked
