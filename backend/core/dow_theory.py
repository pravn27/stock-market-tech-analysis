"""
Dow Theory Trend Analysis - Enhanced Version
Based on LonesomeTheBlue's Higher High Lower Low indicator logic

Detects pivot highs/lows and classifies each as:
- HH (Higher High) / LH (Lower High)
- HL (Higher Low) / LL (Lower Low)

Then determines overall trend based on the pattern.

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
    SIDEWAYS = "Sideways"  # No clear direction
    TRANSITION_UP = "LL→HL"   # Transitioning to uptrend
    TRANSITION_DOWN = "HH→LH" # Transitioning to downtrend


# Timeframe configurations
# Note: For accurate calculations, we need sufficient historical data
TIMEFRAMES = {
    'monthly': {'interval': '1mo', 'period': '5y', 'label': 'M', 'group': 'super_tide', 'pivot_len': 3},
    'weekly': {'interval': '1wk', 'period': '2y', 'label': 'W', 'group': 'super_tide', 'pivot_len': 3},
    'daily': {'interval': '1d', 'period': '1y', 'label': 'D', 'group': 'tide', 'pivot_len': 5},
    '4h': {'interval': '1h', 'period': '730d', 'label': '4H', 'group': 'tide', 'pivot_len': 5},  # Max for 1H
    '1h': {'interval': '1h', 'period': '60d', 'label': '1H', 'group': 'wave', 'pivot_len': 5},
    '15m': {'interval': '15m', 'period': '60d', 'label': '15M', 'group': 'ripple', 'pivot_len': 5},
}

# MTF Groups
MTF_GROUPS = {
    'super_tide': {'name': 'Super TIDE', 'timeframes': ['monthly', 'weekly'], 'purpose': 'Primary Trend'},
    'tide': {'name': 'TIDE', 'timeframes': ['daily', '4h'], 'purpose': 'Medium-term Trend'},
    'wave': {'name': 'WAVE', 'timeframes': ['4h', '1h'], 'purpose': 'Trading Timeframe'},
    'ripple': {'name': 'RIPPLE', 'timeframes': ['1h', '15m'], 'purpose': 'Entry Timeframe'},
}


class DowTheoryAnalyzer:
    """
    Enhanced Dow Theory Analysis using Pivot-based approach
    Similar to LonesomeTheBlue's TradingView indicator
    """
    
    def __init__(self, pivot_left: int = 5, pivot_right: int = 5):
        """
        Initialize analyzer
        
        Args:
            pivot_left: Number of bars to the left for pivot confirmation
            pivot_right: Number of bars to the right for pivot confirmation
        """
        self.pivot_left = pivot_left
        self.pivot_right = pivot_right
    
    def find_pivot_highs(self, df: pd.DataFrame, left: int = None, right: int = None) -> List[Dict]:
        """
        Find pivot highs (local maxima)
        A pivot high requires the high to be greater than 'left' bars before
        and 'right' bars after.
        
        Returns list of dicts with index, price, and date
        """
        left = left or self.pivot_left
        right = right or self.pivot_right
        pivots = []
        
        highs = df['High'].values
        
        for i in range(left, len(highs) - right):
            is_pivot = True
            current_high = highs[i]
            
            # Check left side - must be higher than all left bars
            for j in range(1, left + 1):
                if highs[i - j] >= current_high:
                    is_pivot = False
                    break
            
            if not is_pivot:
                continue
            
            # Check right side - must be higher than all right bars
            for j in range(1, right + 1):
                if highs[i + j] >= current_high:
                    is_pivot = False
                    break
            
            if is_pivot:
                pivots.append({
                    'index': i,
                    'price': round(current_high, 2),
                    'date': df.index[i].strftime('%Y-%m-%d') if hasattr(df.index[i], 'strftime') else str(df.index[i])
                })
        
        return pivots
    
    def find_pivot_lows(self, df: pd.DataFrame, left: int = None, right: int = None) -> List[Dict]:
        """
        Find pivot lows (local minima)
        A pivot low requires the low to be less than 'left' bars before
        and 'right' bars after.
        """
        left = left or self.pivot_left
        right = right or self.pivot_right
        pivots = []
        
        lows = df['Low'].values
        
        for i in range(left, len(lows) - right):
            is_pivot = True
            current_low = lows[i]
            
            # Check left side - must be lower than all left bars
            for j in range(1, left + 1):
                if lows[i - j] <= current_low:
                    is_pivot = False
                    break
            
            if not is_pivot:
                continue
            
            # Check right side - must be lower than all right bars
            for j in range(1, right + 1):
                if lows[i + j] <= current_low:
                    is_pivot = False
                    break
            
            if is_pivot:
                pivots.append({
                    'index': i,
                    'price': round(current_low, 2),
                    'date': df.index[i].strftime('%Y-%m-%d') if hasattr(df.index[i], 'strftime') else str(df.index[i])
                })
        
        return pivots
    
    def label_pivots(self, pivot_highs: List[Dict], pivot_lows: List[Dict]) -> Dict:
        """
        Label each pivot as HH, LH, HL, or LL by comparing to previous pivot of same type.
        
        Returns dict with labeled highs and lows
        """
        labeled_highs = []
        labeled_lows = []
        
        # Label highs
        for i, ph in enumerate(pivot_highs):
            if i == 0:
                labeled_highs.append({**ph, 'label': 'H', 'type': 'initial'})
            else:
                prev_high = pivot_highs[i - 1]['price']
                if ph['price'] > prev_high:
                    labeled_highs.append({**ph, 'label': 'HH', 'type': 'higher_high'})
                else:
                    labeled_highs.append({**ph, 'label': 'LH', 'type': 'lower_high'})
        
        # Label lows
        for i, pl in enumerate(pivot_lows):
            if i == 0:
                labeled_lows.append({**pl, 'label': 'L', 'type': 'initial'})
            else:
                prev_low = pivot_lows[i - 1]['price']
                if pl['price'] > prev_low:
                    labeled_lows.append({**pl, 'label': 'HL', 'type': 'higher_low'})
                else:
                    labeled_lows.append({**pl, 'label': 'LL', 'type': 'lower_low'})
        
        return {
            'highs': labeled_highs,
            'lows': labeled_lows
        }
    
    def determine_trend(self, labeled_pivots: Dict) -> Dict:
        """
        Determine overall trend based on the pattern of recent pivots.
        
        Logic (like LonesomeTheBlue):
        - UPTREND: Recent pivots show HH and HL pattern
        - DOWNTREND: Recent pivots show LH and LL pattern
        - SIDEWAYS: Mixed signals
        - TRANSITION: Trend changing
        """
        highs = labeled_pivots['highs']
        lows = labeled_pivots['lows']
        
        if len(highs) < 2 or len(lows) < 2:
            return {
                'trend': 'Insufficient Data',
                'color': 'gray',
                'confidence': 0,
                'last_high_label': highs[-1]['label'] if highs else '-',
                'last_low_label': lows[-1]['label'] if lows else '-',
                'description': 'Not enough pivots to determine trend'
            }
        
        # Get last 2-3 labels for analysis
        recent_high_labels = [h['label'] for h in highs[-3:] if h['label'] in ['HH', 'LH']]
        recent_low_labels = [l['label'] for l in lows[-3:] if l['label'] in ['HL', 'LL']]
        
        last_high = highs[-1]
        last_low = lows[-1]
        
        # Count patterns
        hh_count = recent_high_labels.count('HH')
        lh_count = recent_high_labels.count('LH')
        hl_count = recent_low_labels.count('HL')
        ll_count = recent_low_labels.count('LL')
        
        # Determine trend based on most recent pivots
        last_high_label = last_high['label'] if last_high else '-'
        last_low_label = last_low['label'] if last_low else '-'
        
        # Strong Uptrend: HH + HL
        if last_high_label == 'HH' and last_low_label == 'HL':
            return {
                'trend': 'HH-HL',
                'trend_name': 'Uptrend',
                'color': 'green',
                'confidence': 90,
                'last_high_label': last_high_label,
                'last_low_label': last_low_label,
                'last_high_price': last_high['price'],
                'last_low_price': last_low['price'],
                'description': 'Strong Uptrend - Making Higher Highs and Higher Lows'
            }
        
        # Strong Downtrend: LH + LL
        if last_high_label == 'LH' and last_low_label == 'LL':
            return {
                'trend': 'LL-LH',
                'trend_name': 'Downtrend',
                'color': 'red',
                'confidence': 90,
                'last_high_label': last_high_label,
                'last_low_label': last_low_label,
                'last_high_price': last_high['price'],
                'last_low_price': last_low['price'],
                'description': 'Strong Downtrend - Making Lower Highs and Lower Lows'
            }
        
        # Transition to Uptrend: Was making LL, now making HL
        if last_high_label == 'HH' and last_low_label == 'LL':
            return {
                'trend': 'LL→HL',
                'trend_name': 'Transition Up',
                'color': 'lightgreen',
                'confidence': 70,
                'last_high_label': last_high_label,
                'last_low_label': last_low_label,
                'last_high_price': last_high['price'],
                'last_low_price': last_low['price'],
                'description': 'Potential Trend Reversal - Higher High formed, watching for Higher Low'
            }
        
        # Transition to Downtrend: Was making HH, now making LH
        if last_high_label == 'LH' and last_low_label == 'HL':
            return {
                'trend': 'HH→LH',
                'trend_name': 'Transition Down',
                'color': 'orange',
                'confidence': 70,
                'last_high_label': last_high_label,
                'last_low_label': last_low_label,
                'last_high_price': last_high['price'],
                'last_low_price': last_low['price'],
                'description': 'Potential Trend Reversal - Lower High formed, watching for Lower Low'
            }
        
        # Sideways / Consolidation
        return {
            'trend': 'Sideways',
            'trend_name': 'Sideways',
            'color': 'yellow',
            'confidence': 60,
            'last_high_label': last_high_label,
            'last_low_label': last_low_label,
            'last_high_price': last_high['price'] if last_high else None,
            'last_low_price': last_low['price'] if last_low else None,
            'description': f'Sideways/Consolidation - Last High: {last_high_label}, Last Low: {last_low_label}'
        }
    
    def analyze_timeframe(self, df: pd.DataFrame, pivot_len: int = 5) -> Dict:
        """
        Complete analysis for a single timeframe
        """
        if df is None or len(df) < 20:
            return {
                'trend': 'No Data',
                'color': 'gray',
                'confidence': 0,
                'pivots': {'highs': [], 'lows': []},
                'description': 'Insufficient data'
            }
        
        # Find pivots with specified length
        pivot_highs = self.find_pivot_highs(df, left=pivot_len, right=pivot_len)
        pivot_lows = self.find_pivot_lows(df, left=pivot_len, right=pivot_len)
        
        # Label pivots
        labeled = self.label_pivots(pivot_highs, pivot_lows)
        
        # Determine trend
        trend_data = self.determine_trend(labeled)
        
        # Add pivot data
        trend_data['pivots'] = {
            'highs': labeled['highs'][-5:],  # Last 5 pivot highs
            'lows': labeled['lows'][-5:]      # Last 5 pivot lows
        }
        
        return trend_data
    
    def fetch_data(self, symbol: str, interval: str, period: str) -> Optional[pd.DataFrame]:
        """Fetch OHLC data from Yahoo Finance"""
        try:
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
        """
        Aggregate 1-hour data to 4-hour candles - TradingView style
        
        For Indian markets (NSE), TradingView creates 4H candles based on market sessions:
        - Candle 1: 9:15-13:15 (first 4 hours of market)
        - Candle 2: 13:15-close (remaining hours)
        """
        if df is None or df.empty:
            return None
        
        result = []
        df_copy = df.copy()
        df_copy['date'] = df_copy.index.date
        
        for date, group in df_copy.groupby('date'):
            hours = group.index.hour
            
            # First 4H candle: 9:15-13:15 (hours 9, 10, 11, 12)
            first_candle = group[(hours >= 9) & (hours < 13)]
            if len(first_candle) >= 1:
                result.append({
                    'datetime': first_candle.index[0],
                    'Open': first_candle['Open'].iloc[0],
                    'High': first_candle['High'].max(),
                    'Low': first_candle['Low'].min(),
                    'Close': first_candle['Close'].iloc[-1],
                    'Volume': first_candle['Volume'].sum()
                })
            
            # Second 4H candle: 13:15-close (hours 13, 14, 15+)
            second_candle = group[hours >= 13]
            if len(second_candle) >= 1:
                result.append({
                    'datetime': second_candle.index[0],
                    'Open': second_candle['Open'].iloc[0],
                    'High': second_candle['High'].max(),
                    'Low': second_candle['Low'].min(),
                    'Close': second_candle['Close'].iloc[-1],
                    'Volume': second_candle['Volume'].sum()
                })
        
        if not result:
            return None
            
        df_4h = pd.DataFrame(result)
        df_4h.set_index('datetime', inplace=True)
        return df_4h
    
    def analyze_stock(self, symbol: str) -> Dict:
        """
        Analyze a single stock across all timeframes
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
            pivot_len = tf_config.get('pivot_len', 5)
            
            # Fetch data
            df = self.fetch_data(symbol, interval, period)
            
            # Special handling for 4H (aggregate from 1H)
            if tf_key == '4h' and df is not None:
                df = self.aggregate_to_4h(df)
            
            # Analyze timeframe
            trend_data = self.analyze_timeframe(df, pivot_len)
            
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
            
            if group_trends:
                bullish_count = sum(1 for t in group_trends if t.get('trend') in ['HH-HL', 'LL→HL'])
                bearish_count = sum(1 for t in group_trends if t.get('trend') in ['LL-LH', 'HH→LH'])
                
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
        """Scan multiple stocks"""
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
        """Scan stocks with opportunity filter"""
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
