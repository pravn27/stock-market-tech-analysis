"""
Sector Relative Performance Scanner
Compares NIFTY sector indices against NIFTY 50 to identify
outperforming and underperforming sectors across timeframes.
"""

import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta


# NOTE: Many Yahoo Finance NSE index symbols are deprecated or don't work.
# Only verified working symbols are included in the lists below.
#
# Working symbols format:
# - ^NSEI, ^NSEBANK, ^CNXIT, etc. (caret prefix)
# - NIFTYMIDCAP150.NS, NIFTY_MID_SELECT.NS (suffix format)
#
# Non-working symbols (as of Jan 2026):
# - ^CNXFINANCE, ^NIFTYPVTBANK, ^CNXMIDCAP, ^CNXSMALLCAP, ^CNX500, etc.


# Sectorial Indices (only verified working Yahoo Finance symbols)
NIFTY_SECTORS_MAIN = {
    "NIFTY 50": "^NSEI",
    "Bank Nifty": "^NSEBANK",
    "Nifty IT": "^CNXIT",
    "Nifty Pharma": "^CNXPHARMA",
    "Nifty FMCG": "^CNXFMCG",
    "Nifty Auto": "^CNXAUTO",
    "Nifty Metal": "^CNXMETAL",
    "Nifty Realty": "^CNXREALTY",
    "Nifty Energy": "^CNXENERGY",
    "Nifty PSU Bank": "^CNXPSUBANK",
    "Nifty Infra": "^CNXINFRA",
    "Nifty Media": "^CNXMEDIA",
}

# Broader Market Indices (using .NS suffix format that works with yfinance)
NIFTY_BROAD_INDICES = {
    # Benchmark
    "NIFTY 50": "^NSEI",
    
    # Broad Market
    "Nifty Next 50": "^NSMIDCP",
    "Nifty 100": "^CNX100",
    "Nifty 200": "^CNX200",
    
    # Midcap Indices
    "Nifty Midcap 150": "NIFTYMIDCAP150.NS",
    "Nifty Mid Select": "NIFTY_MID_SELECT.NS",
    
    # Smallcap Indices
    "Nifty Smallcap 250": "NIFTYSMLCAP250.NS",
}

# All Sectorial Indices (comprehensive)
# All Indices (combined - only verified working symbols)
NIFTY_ALL_SECTORS = {
    # Benchmark
    "NIFTY 50": "^NSEI",
    
    # Sectorial
    "Bank Nifty": "^NSEBANK",
    "Nifty IT": "^CNXIT",
    "Nifty Pharma": "^CNXPHARMA",
    "Nifty FMCG": "^CNXFMCG",
    "Nifty Auto": "^CNXAUTO",
    "Nifty Metal": "^CNXMETAL",
    "Nifty Realty": "^CNXREALTY",
    "Nifty Energy": "^CNXENERGY",
    "Nifty PSU Bank": "^CNXPSUBANK",
    "Nifty Media": "^CNXMEDIA",
    "Nifty Infra": "^CNXINFRA",
    
    # Broad Market
    "Nifty Next 50": "^NSMIDCP",
    "Nifty 100": "^CNX100",
    "Nifty 200": "^CNX200",
    
    # Midcap & Smallcap
    "Nifty Midcap 150": "NIFTYMIDCAP150.NS",
    "Nifty Mid Select": "NIFTY_MID_SELECT.NS",
    "Nifty Smallcap 250": "NIFTYSMLCAP250.NS",
}


class SectorRelativeStrength:
    """Analyze sector relative strength vs NIFTY 50"""
    
    def __init__(self, sectors: Optional[Dict[str, str]] = None):
        self.sectors = sectors if sectors is not None else NIFTY_SECTORS_MAIN
        self.benchmark = "NIFTY 50"
        self.benchmark_symbol = "^NSEI"
    
    def fetch_index_data(self, symbol: str, period: str = "6mo", interval: str = "1d") -> pd.DataFrame:
        """Fetch historical data for an index"""
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period, interval=interval)
            return df
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
            return pd.DataFrame()
    
    def fetch_intraday_data(self, symbol: str) -> pd.DataFrame:
        """Fetch intraday data (1hr intervals) for last 7 days"""
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
            
            df = self.fetch_index_data(symbol, period="6mo")
            
            if df.empty:
                continue
            
            returns = self.calculate_returns(df, lookback=lookback)
            
            # Add intraday returns
            if include_intraday:
                intraday_df = self.fetch_intraday_data(symbol)
                intraday_returns = self.calculate_intraday_returns(intraday_df, lookback=lookback)
                returns.update(intraday_returns)
            
            relative = self.calculate_relative_strength(returns, benchmark_returns)
            
            results.append({
                'name': name,
                'symbol': symbol,
                'price': float(df['Close'].iloc[-1]),
                'returns': returns,
                'relative': relative,
                'is_benchmark': False
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
