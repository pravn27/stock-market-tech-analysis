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


# NSE Sector Indices (Yahoo Finance symbols)
NIFTY_SECTORS = {
    # Benchmark
    "NIFTY 50": "^NSEI",
    
    # Major Sectors
    "Bank Nifty": "^NSEBANK",
    "Nifty IT": "^CNXIT",
    "Nifty Pharma": "^CNXPHARMA",
    "Nifty FMCG": "^CNXFMCG",
    "Nifty Finance": "^CNXFINANCE",
    "Nifty Auto": "^CNXAUTO",
    "Nifty Metal": "^CNXMETAL",
    "Nifty Realty": "^CNXREALTY",
    "Nifty Energy": "^CNXENERGY",
    "Nifty Infra": "^CNXINFRA",
    "Nifty PSE": "^CNXPSE",
    "Nifty Media": "^CNXMEDIA",
    "Nifty PSU Bank": "^CNXPSUBANK",
    "Nifty Pvt Bank": "^NIFTYPVTBANK",
    
    # Broader Market
    "Nifty Next 50": "^NSMIDCP",
    "Nifty Midcap 100": "^CNXMIDCAP",
    "Nifty Smallcap 100": "^CNXSMALLCAP",
}

# Simplified list for faster scanning
NIFTY_SECTORS_MAIN = {
    "NIFTY 50": "^NSEI",
    "Bank Nifty": "^NSEBANK",
    "Nifty IT": "^CNXIT",
    "Nifty Pharma": "^CNXPHARMA",
    "Nifty FMCG": "^CNXFMCG",
    "Nifty Finance": "^CNXFINANCE",
    "Nifty Auto": "^CNXAUTO",
    "Nifty Metal": "^CNXMETAL",
    "Nifty Realty": "^CNXREALTY",
    "Nifty Energy": "^CNXENERGY",
    "Nifty PSU Bank": "^CNXPSUBANK",
    "Nifty Pvt Bank": "^NIFTYPVTBANK",
    "Nifty Midcap 100": "^CNXMIDCAP",
}

# Broader Market Indices
NIFTY_BROAD_INDICES = {
    # Benchmark
    "NIFTY 50": "^NSEI",
    
    # Broad Market
    "Nifty Junior (Next 50)": "^NSMIDCP",
    "Nifty 100": "^CNX100",
    "Nifty 200": "^CNX200",
    "Nifty 500": "^CNX500",
    "India VIX": "^INDIAVIX",
    
    # Midcap Indices
    "Nifty Midcap 50": "^NIFTYMIDCAP50",
    "Nifty Midcap 100": "^CNXMIDCAP",
    "Nifty Midcap 150": "NIFTYMIDCAP150.NS",
    "Nifty Mid Select": "NIFTY_MID_SELECT.NS",
    
    # Smallcap Indices
    "Nifty Smallcap 50": "^NIFTYSMLCAP50",
    "Nifty Smallcap 100": "^CNXSMALLCAP",
    "Nifty Smallcap 250": "NIFTYSMLCAP250.NS",
}

# All Sectorial Indices (comprehensive)
NIFTY_ALL_SECTORS = {
    # Benchmark
    "NIFTY 50": "^NSEI",
    
    # Sectorial
    "Bank Nifty": "^NSEBANK",
    "Nifty IT": "^CNXIT",
    "Nifty Pharma": "^CNXPHARMA",
    "Nifty FMCG": "^CNXFMCG",
    "Nifty Finance": "^CNXFINANCE",
    "Nifty Auto": "^CNXAUTO",
    "Nifty Metal": "^CNXMETAL",
    "Nifty Realty": "^CNXREALTY",
    "Nifty Energy": "^CNXENERGY",
    "Nifty PSU Bank": "^CNXPSUBANK",
    "Nifty Pvt Bank": "^NIFTYPVTBANK",
    "Nifty Media": "^CNXMEDIA",
    "Nifty Infra": "^CNXINFRA",
    "Nifty PSE": "^CNXPSE",
    "Nifty Commodities": "^CNXCOMMODITIES",
    "Nifty Consumption": "^CNXCONSUMPTION",
    "Nifty Healthcare": "NIFTY_HEALTHCARE.NS",
    "Nifty Oil & Gas": "NIFTY_OIL_AND_GAS.NS",
    
    # Broad Market
    "Nifty Junior": "^NSMIDCP",
    "Nifty 100": "^CNX100",
    "Nifty 200": "^CNX200",
    "Nifty 500": "^CNX500",
    
    # Midcap
    "Nifty Midcap 50": "^NIFTYMIDCAP50",
    "Nifty Midcap 100": "^CNXMIDCAP",
    
    # Smallcap
    "Nifty Smallcap 50": "^NIFTYSMLCAP50",
    "Nifty Smallcap 100": "^CNXSMALLCAP",
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
    
    def calculate_returns(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Calculate returns comparing with previous period's closing price
        
        - Daily: Current close vs Previous day's close
        - Weekly: Current close vs Previous week's last trading day close
        - Monthly: Current close vs Previous month's last trading day close
        
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
        
        # Daily: vs previous day's close
        if len(df) > 1:
            prev_day_close = float(df['Close'].iloc[-2])
            returns['Daily'] = ((current_price - prev_day_close) / prev_day_close) * 100
        else:
            returns['Daily'] = None
        
        # Weekly: vs previous week's last trading day close
        try:
            # Get current week number
            current_week = current_date.isocalendar()[1]
            current_year = current_date.year
            
            # Find last trading day of previous week
            df['week'] = df['Date'].apply(lambda x: x.isocalendar()[1])
            df['year'] = df['Date'].apply(lambda x: x.year)
            
            prev_week_data = df[
                (df['week'] < current_week) | 
                (df['year'] < current_year)
            ]
            if not prev_week_data.empty:
                prev_week_close = float(prev_week_data['Close'].iloc[-1])
                returns['Weekly'] = ((current_price - prev_week_close) / prev_week_close) * 100
            else:
                returns['Weekly'] = None
        except Exception:
            returns['Weekly'] = None
        
        # Monthly: vs previous month's last trading day close
        try:
            current_month = current_date.month
            current_year = current_date.year
            
            df['month'] = df['Date'].apply(lambda x: x.month)
            df['year'] = df['Date'].apply(lambda x: x.year)
            
            # Find last trading day of previous month
            prev_month_data = df[
                (df['month'] < current_month) | 
                (df['year'] < current_year)
            ]
            if not prev_month_data.empty:
                prev_month_close = float(prev_month_data['Close'].iloc[-1])
                returns['Monthly'] = ((current_price - prev_month_close) / prev_month_close) * 100
            else:
                returns['Monthly'] = None
        except Exception:
            returns['Monthly'] = None
        
        # Quarterly (3 Month): vs 3 months ago last trading day close
        try:
            three_months_ago = current_date - pd.DateOffset(months=3)
            prev_quarter_data = df[df['Date'] <= three_months_ago]
            if not prev_quarter_data.empty:
                prev_quarter_close = float(prev_quarter_data['Close'].iloc[-1])
                returns['3 Month'] = ((current_price - prev_quarter_close) / prev_quarter_close) * 100
            else:
                returns['3 Month'] = None
        except Exception:
            returns['3 Month'] = None
        
        return returns
    
    def calculate_intraday_returns(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Calculate returns for intraday timeframes
        
        - 1 Hour: Current close vs 1 hour ago close
        - 4 Hour: Current close vs 4 hours ago close
        
        Returns:
            Dict with returns for each intraday period
        """
        if df.empty or len(df) < 2:
            return {}
        
        returns = {}
        df = df.copy()
        
        current_price = float(df['Close'].iloc[-1])
        
        # 1 Hour: vs 1 hour ago close
        if len(df) > 1:
            one_hour_ago_close = float(df['Close'].iloc[-2])
            returns['1 Hour'] = ((current_price - one_hour_ago_close) / one_hour_ago_close) * 100
        else:
            returns['1 Hour'] = None
        
        # 4 Hour: vs 4 hours ago close
        if len(df) > 4:
            four_hour_ago_close = float(df['Close'].iloc[-5])
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
    
    def analyze_all_sectors(self, progress_callback=None, include_intraday: bool = True) -> List[Dict]:
        """
        Analyze all sectors and calculate relative strength
        
        Compares with previous period's closing prices:
        - 1 Hour: vs 1 hour ago close
        - 4 Hour: vs 4 hours ago close
        - Daily: vs previous day close
        - Weekly: vs previous week's last close
        - Monthly: vs previous month's last close
        - 3 Month: vs 3 months ago close
        
        Returns:
            List of dicts with sector analysis
        """
        results = []
        
        # Fetch benchmark data first
        benchmark_df = self.fetch_index_data(self.benchmark_symbol, period="6mo")
        benchmark_returns = self.calculate_returns(benchmark_df)
        
        # Fetch intraday benchmark data
        benchmark_intraday_returns = {}
        if include_intraday:
            benchmark_intraday_df = self.fetch_intraday_data(self.benchmark_symbol)
            benchmark_intraday_returns = self.calculate_intraday_returns(benchmark_intraday_df)
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
            'is_benchmark': True
        })
        
        # Analyze each sector
        sector_items = [(k, v) for k, v in self.sectors.items() if k != self.benchmark]
        
        for i, (name, symbol) in enumerate(sector_items):
            if progress_callback:
                progress_callback((i + 1) / len(sector_items), f"Analyzing {name}...")
            
            df = self.fetch_index_data(symbol, period="6mo")
            
            if df.empty:
                continue
            
            returns = self.calculate_returns(df)
            
            # Add intraday returns
            if include_intraday:
                intraday_df = self.fetch_intraday_data(symbol)
                intraday_returns = self.calculate_intraday_returns(intraday_df)
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
    
    def calculate_returns(self, df: pd.DataFrame) -> Dict[str, float]:
        """Calculate returns for different timeframes"""
        if df.empty or len(df) < 2:
            return {}
        
        returns = {}
        df = df.copy()
        df = df.reset_index()
        df['Date'] = pd.to_datetime(df['Date']) if 'Date' in df.columns else pd.to_datetime(df.index)
        
        current_price = float(df['Close'].iloc[-1])
        current_date = df['Date'].iloc[-1]
        
        # Daily
        if len(df) > 1:
            prev_close = float(df['Close'].iloc[-2])
            returns['Daily'] = ((current_price - prev_close) / prev_close) * 100
        
        # Weekly
        try:
            current_week = current_date.isocalendar()[1]
            current_year = current_date.year
            df['week'] = df['Date'].apply(lambda x: x.isocalendar()[1])
            df['year'] = df['Date'].apply(lambda x: x.year)
            prev_week_data = df[(df['week'] < current_week) | (df['year'] < current_year)]
            if not prev_week_data.empty:
                prev_close = float(prev_week_data['Close'].iloc[-1])
                returns['Weekly'] = ((current_price - prev_close) / prev_close) * 100
        except:
            pass
        
        # Monthly
        try:
            current_month = current_date.month
            df['month'] = df['Date'].apply(lambda x: x.month)
            prev_month_data = df[(df['month'] < current_month) | (df['year'] < current_year)]
            if not prev_month_data.empty:
                prev_close = float(prev_month_data['Close'].iloc[-1])
                returns['Monthly'] = ((current_price - prev_close) / prev_close) * 100
        except:
            pass
        
        return returns
    
    def calculate_intraday_returns(self, df: pd.DataFrame) -> Dict[str, float]:
        """Calculate intraday returns"""
        if df.empty or len(df) < 2:
            return {}
        
        returns = {}
        current_price = float(df['Close'].iloc[-1])
        
        if len(df) > 1:
            returns['1 Hour'] = ((current_price - float(df['Close'].iloc[-2])) / float(df['Close'].iloc[-2])) * 100
        if len(df) > 4:
            returns['4 Hour'] = ((current_price - float(df['Close'].iloc[-5])) / float(df['Close'].iloc[-5])) * 100
        
        return returns
    
    def analyze_sector_stocks(self, sector_name: str, stocks: List[str], 
                              progress_callback=None, include_intraday: bool = True) -> Dict:
        """
        Analyze all stocks in a sector and compare with NIFTY 50
        
        Returns:
            Dict with benchmark, sector stocks analysis
        """
        from backend.core.sector_stocks import SECTOR_STOCKS_MAP
        
        results = {
            'sector_name': sector_name,
            'benchmark': None,
            'stocks': [],
            'outperforming': [],
            'underperforming': [],
            'neutral': []
        }
        
        # Fetch benchmark data
        benchmark_df = self.fetch_stock_data(self.benchmark_symbol, period="6mo")
        benchmark_returns = self.calculate_returns(benchmark_df)
        
        if include_intraday:
            intraday_df = self.fetch_intraday_data(self.benchmark_symbol)
            intraday_returns = self.calculate_intraday_returns(intraday_df)
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
                
                returns = self.calculate_returns(df)
                
                if include_intraday:
                    intraday_df = self.fetch_intraday_data(symbol)
                    intraday_returns = self.calculate_intraday_returns(intraday_df)
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
