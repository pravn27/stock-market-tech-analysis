"""
Dow Theory Trend Analysis
Detects swing highs/lows and classifies trend as:
- HH-HL (Higher High, Higher Low) = Uptrend
- LL-LH (Lower Low, Lower High) = Downtrend
- HLs-LHs (Sideways/Consolidation)

Multi-Timeframe Analysis:
- Super TIDE: Monthly, Weekly
- TIDE: Daily, 4Hr
- WAVE: 4Hr, 1Hr
- RIPPLE: 1Hr, 15Min
"""

import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum


class TrendType(Enum):
    UPTREND = "HH-HL"      # Higher High, Higher Low
    DOWNTREND = "LL-LH"    # Lower Low, Lower High
    SIDEWAYS = "HLs-LHs"   # Sideways / Consolidation
    WEAK_UP = "HH-HL (Weak)"
    WEAK_DOWN = "LL-LH (Weak)"


# Timeframe configurations
TIMEFRAMES = {
    'monthly': {'interval': '1mo', 'period': '5y', 'label': 'M', 'group': 'super_tide'},
    'weekly': {'interval': '1wk', 'period': '2y', 'label': 'W', 'group': 'super_tide'},
    'daily': {'interval': '1d', 'period': '6mo', 'label': 'D', 'group': 'tide'},
    '4h': {'interval': '1h', 'period': '60d', 'label': '4H', 'group': 'tide'},  # Aggregate to 4H
    '1h': {'interval': '1h', 'period': '30d', 'label': '1H', 'group': 'wave'},
    '15m': {'interval': '15m', 'period': '7d', 'label': '15M', 'group': 'ripple'},
}

# MTF Groups
MTF_GROUPS = {
    'super_tide': {'name': 'Super TIDE', 'timeframes': ['monthly', 'weekly'], 'purpose': 'Primary Trend'},
    'tide': {'name': 'TIDE', 'timeframes': ['daily', '4h'], 'purpose': 'Medium-term Trend'},
    'wave': {'name': 'WAVE', 'timeframes': ['4h', '1h'], 'purpose': 'Trading Timeframe'},
    'ripple': {'name': 'RIPPLE', 'timeframes': ['1h', '15m'], 'purpose': 'Entry Timeframe'},
}


class DowTheoryAnalyzer:
    """Analyzes price action using Dow Theory principles"""
    
    def __init__(self, swing_lookback: int = 5):
        """
        Initialize analyzer
        
        Args:
            swing_lookback: Number of candles to look back for swing detection
        """
        self.swing_lookback = swing_lookback
    
    def detect_swing_highs(self, highs: pd.Series, lookback: int = None) -> pd.Series:
        """
        Detect swing highs (local maxima)
        A swing high is a high that is higher than 'lookback' candles on each side
        """
        lookback = lookback or self.swing_lookback
        swing_highs = pd.Series(index=highs.index, dtype=float)
        
        for i in range(lookback, len(highs) - lookback):
            window = highs.iloc[i - lookback:i + lookback + 1]
            if highs.iloc[i] == window.max():
                swing_highs.iloc[i] = highs.iloc[i]
        
        return swing_highs.dropna()
    
    def detect_swing_lows(self, lows: pd.Series, lookback: int = None) -> pd.Series:
        """
        Detect swing lows (local minima)
        A swing low is a low that is lower than 'lookback' candles on each side
        """
        lookback = lookback or self.swing_lookback
        swing_lows = pd.Series(index=lows.index, dtype=float)
        
        for i in range(lookback, len(lows) - lookback):
            window = lows.iloc[i - lookback:i + lookback + 1]
            if lows.iloc[i] == window.min():
                swing_lows.iloc[i] = lows.iloc[i]
        
        return swing_lows.dropna()
    
    def classify_trend(self, df: pd.DataFrame, lookback: int = None) -> Dict:
        """
        Classify the trend based on swing highs and lows
        
        Returns:
            Dict with trend type, swings, and confidence
        """
        if df is None or len(df) < 20:
            return {
                'trend': TrendType.SIDEWAYS.value,
                'color': 'yellow',
                'confidence': 0,
                'swings': {'highs': [], 'lows': []},
                'description': 'Insufficient data'
            }
        
        # Detect swings
        swing_highs = self.detect_swing_highs(df['High'], lookback)
        swing_lows = self.detect_swing_lows(df['Low'], lookback)
        
        # Need at least 2 swing highs and 2 swing lows
        if len(swing_highs) < 2 or len(swing_lows) < 2:
            return {
                'trend': TrendType.SIDEWAYS.value,
                'color': 'yellow',
                'confidence': 50,
                'swings': {
                    'highs': swing_highs.tolist()[-3:] if len(swing_highs) > 0 else [],
                    'lows': swing_lows.tolist()[-3:] if len(swing_lows) > 0 else []
                },
                'description': 'Not enough swings to determine trend'
            }
        
        # Get last 2-3 swings for analysis
        recent_highs = swing_highs.tail(3).values
        recent_lows = swing_lows.tail(3).values
        
        # Compare highs
        higher_highs = all(recent_highs[i] < recent_highs[i+1] for i in range(len(recent_highs)-1))
        lower_highs = all(recent_highs[i] > recent_highs[i+1] for i in range(len(recent_highs)-1))
        
        # Compare lows
        higher_lows = all(recent_lows[i] < recent_lows[i+1] for i in range(len(recent_lows)-1))
        lower_lows = all(recent_lows[i] > recent_lows[i+1] for i in range(len(recent_lows)-1))
        
        # Determine trend
        if higher_highs and higher_lows:
            trend = TrendType.UPTREND
            color = 'green'
            confidence = 85
            description = 'Strong Uptrend - Making Higher Highs and Higher Lows'
        elif lower_highs and lower_lows:
            trend = TrendType.DOWNTREND
            color = 'red'
            confidence = 85
            description = 'Strong Downtrend - Making Lower Lows and Lower Highs'
        elif higher_highs and not higher_lows:
            trend = TrendType.WEAK_UP
            color = 'lightgreen'
            confidence = 60
            description = 'Weak Uptrend - Higher Highs but no Higher Lows'
        elif lower_lows and not lower_highs:
            trend = TrendType.WEAK_DOWN
            color = 'orange'
            confidence = 60
            description = 'Weak Downtrend - Lower Lows but no Lower Highs'
        else:
            trend = TrendType.SIDEWAYS
            color = 'yellow'
            confidence = 70
            description = 'Sideways/Consolidation - No clear trend direction'
        
        return {
            'trend': trend.value,
            'color': color,
            'confidence': confidence,
            'swings': {
                'highs': [round(h, 2) for h in recent_highs.tolist()],
                'lows': [round(l, 2) for l in recent_lows.tolist()]
            },
            'description': description
        }
    
    def fetch_data(self, symbol: str, interval: str, period: str) -> Optional[pd.DataFrame]:
        """Fetch OHLC data from Yahoo Finance"""
        try:
            # Add .NS suffix for NSE stocks
            yf_symbol = f"{symbol}.NS" if not symbol.endswith('.NS') else symbol
            
            ticker = yf.Ticker(yf_symbol)
            df = ticker.history(period=period, interval=interval)
            
            if df.empty:
                return None
            
            return df
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
            return None
    
    def aggregate_to_4h(self, df: pd.DataFrame) -> pd.DataFrame:
        """Aggregate 1-hour data to 4-hour candles"""
        if df is None or df.empty:
            return None
        
        df_4h = df.resample('4H').agg({
            'Open': 'first',
            'High': 'max',
            'Low': 'min',
            'Close': 'last',
            'Volume': 'sum'
        }).dropna()
        
        return df_4h
    
    def analyze_stock(self, symbol: str) -> Dict:
        """
        Analyze a single stock across all timeframes
        
        Returns:
            Dict with trend analysis for each timeframe and MTF groups
        """
        result = {
            'symbol': symbol,
            'timestamp': datetime.now().isoformat(),
            'timeframes': {},
            'mtf_groups': {},
            'opportunity': None
        }
        
        # Analyze each timeframe
        for tf_key, tf_config in TIMEFRAMES.items():
            interval = tf_config['interval']
            period = tf_config['period']
            
            # Fetch data
            df = self.fetch_data(symbol, interval, period)
            
            # Special handling for 4H (aggregate from 1H)
            if tf_key == '4h' and df is not None:
                df = self.aggregate_to_4h(df)
            
            # Classify trend
            # Use smaller lookback for shorter timeframes
            lookback = 3 if tf_key in ['15m', '1h'] else 5
            trend_data = self.classify_trend(df, lookback)
            
            result['timeframes'][tf_key] = {
                'label': tf_config['label'],
                'group': tf_config['group'],
                **trend_data
            }
        
        # Aggregate MTF groups
        for group_key, group_config in MTF_GROUPS.items():
            group_trends = []
            for tf in group_config['timeframes']:
                if tf in result['timeframes']:
                    group_trends.append(result['timeframes'][tf])
            
            # Determine group trend
            if group_trends:
                bullish_count = sum(1 for t in group_trends if 'HH-HL' in t['trend'])
                bearish_count = sum(1 for t in group_trends if 'LL-LH' in t['trend'])
                
                if bullish_count == len(group_trends):
                    group_trend = 'BULLISH'
                    group_color = 'green'
                elif bearish_count == len(group_trends):
                    group_trend = 'BEARISH'
                    group_color = 'red'
                elif bullish_count > bearish_count:
                    group_trend = 'BULLISH (Mixed)'
                    group_color = 'lightgreen'
                elif bearish_count > bullish_count:
                    group_trend = 'BEARISH (Mixed)'
                    group_color = 'orange'
                else:
                    group_trend = 'NEUTRAL'
                    group_color = 'yellow'
                
                result['mtf_groups'][group_key] = {
                    'name': group_config['name'],
                    'purpose': group_config['purpose'],
                    'trend': group_trend,
                    'color': group_color,
                    'timeframes': group_config['timeframes']
                }
        
        # Determine opportunity
        result['opportunity'] = self._determine_opportunity(result['mtf_groups'])
        
        return result
    
    def _determine_opportunity(self, mtf_groups: Dict) -> Dict:
        """Determine trading opportunity based on MTF alignment"""
        super_tide = mtf_groups.get('super_tide', {}).get('trend', '')
        tide = mtf_groups.get('tide', {}).get('trend', '')
        wave = mtf_groups.get('wave', {}).get('trend', '')
        ripple = mtf_groups.get('ripple', {}).get('trend', '')
        
        # All aligned bullish
        if all('BULLISH' in t for t in [super_tide, tide, wave, ripple] if t):
            return {
                'type': 'STRONG BUY',
                'color': 'green',
                'strategy': 'Positional / Swing',
                'description': 'All timeframes aligned BULLISH - Strong uptrend'
            }
        
        # All aligned bearish
        if all('BEARISH' in t for t in [super_tide, tide, wave, ripple] if t):
            return {
                'type': 'STRONG SELL / AVOID',
                'color': 'red',
                'strategy': 'Avoid Long / Short',
                'description': 'All timeframes aligned BEARISH - Strong downtrend'
            }
        
        # Super TIDE bullish, TIDE/WAVE pullback
        if 'BULLISH' in super_tide and 'BEARISH' in tide:
            return {
                'type': 'PULLBACK BUY',
                'color': 'lightgreen',
                'strategy': 'Positional',
                'description': 'Primary trend UP, experiencing pullback - Watch for reversal'
            }
        
        # Super TIDE bearish, TIDE/WAVE bounce
        if 'BEARISH' in super_tide and 'BULLISH' in tide:
            return {
                'type': 'BOUNCE SELL',
                'color': 'orange',
                'strategy': 'Short on bounce',
                'description': 'Primary trend DOWN, experiencing bounce - Watch for rejection'
            }
        
        # WAVE and RIPPLE aligned for intraday
        if 'BULLISH' in wave and 'BULLISH' in ripple:
            return {
                'type': 'INTRADAY BUY',
                'color': 'cyan',
                'strategy': 'Intraday',
                'description': 'Short-term bullish alignment - Good for intraday long'
            }
        
        if 'BEARISH' in wave and 'BEARISH' in ripple:
            return {
                'type': 'INTRADAY SELL',
                'color': 'pink',
                'strategy': 'Intraday',
                'description': 'Short-term bearish alignment - Good for intraday short'
            }
        
        # No clear opportunity
        return {
            'type': 'WAIT / NO TRADE',
            'color': 'gray',
            'strategy': 'Wait',
            'description': 'No clear alignment - Wait for better setup'
        }


class DowTheoryScanner:
    """Scans multiple stocks using Dow Theory"""
    
    def __init__(self):
        self.analyzer = DowTheoryAnalyzer()
    
    def scan_stocks(self, symbols: List[str]) -> List[Dict]:
        """
        Scan multiple stocks
        
        Args:
            symbols: List of stock symbols
            
        Returns:
            List of analysis results
        """
        results = []
        
        for symbol in symbols:
            try:
                analysis = self.analyzer.analyze_stock(symbol)
                results.append(analysis)
            except Exception as e:
                print(f"Error analyzing {symbol}: {e}")
                results.append({
                    'symbol': symbol,
                    'error': str(e)
                })
        
        return results
    
    def scan_with_filter(self, symbols: List[str], filter_type: str = 'all') -> List[Dict]:
        """
        Scan stocks with opportunity filter
        
        Args:
            symbols: List of stock symbols
            filter_type: 'all', 'strong_buy', 'pullback_buy', 'intraday_buy', 'bearish'
            
        Returns:
            Filtered list of analysis results
        """
        results = self.scan_stocks(symbols)
        
        if filter_type == 'all':
            return results
        
        filter_map = {
            'strong_buy': ['STRONG BUY'],
            'pullback_buy': ['PULLBACK BUY', 'STRONG BUY'],
            'intraday_buy': ['INTRADAY BUY', 'STRONG BUY'],
            'bearish': ['STRONG SELL / AVOID', 'BOUNCE SELL', 'INTRADAY SELL'],
            'wait': ['WAIT / NO TRADE']
        }
        
        allowed_types = filter_map.get(filter_type, [])
        
        return [
            r for r in results 
            if r.get('opportunity', {}).get('type') in allowed_types
        ]
