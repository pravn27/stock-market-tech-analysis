"""
Technical Indicators Module
Calculates RSI, MACD, Stochastic, ADX, DMI, Bollinger Bands, EMAs

Starting with RSI implementation.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from enum import Enum
import yfinance as yf


class RSIZone(Enum):
    """RSI Classification Zones"""
    UNSUSTAINABLE_BULLS = "Unsustainable Bulls"  # > 78-80
    BULLISH_MOMENTUM = "Bullish Momentum"         # > 60
    NEAR_60 = "Near 60"                           # 55-60
    NEAR_50 = "Near 50"                           # 45-55
    SWING_ZONE = "Swing Zone (40-60)"             # 40-60
    NEAR_40 = "Near 40"                           # 40-45
    BEARISH_MOMENTUM = "Bearish Momentum"         # < 40
    UNSUSTAINABLE_BEARS = "Unsustainable Bears"  # < 22-20
    NOT_CLEAR = "Not Clear"


def calculate_rsi_tradingview(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """
    Calculate RSI (Relative Strength Index) - Exact TradingView/Pine Script method
    
    TradingView uses RMA (Wilder's Moving Average) for RSI calculation:
    - RMA is also called SMMA (Smoothed Moving Average)
    - alpha = 1/length
    - RMA = alpha * value + (1 - alpha) * prev_RMA
    
    Pine Script equivalent:
        u = math.max(src - src[1], 0)
        d = math.max(src[1] - src, 0)
        rs = ta.rma(u, length) / ta.rma(d, length)
        rsi = 100 - 100 / (1 + rs)
    """
    if df is None or len(df) < period + 1:
        return pd.Series()
    
    close = df['Close'].values
    n = len(close)
    
    # Calculate price changes
    delta = np.zeros(n)
    delta[1:] = close[1:] - close[:-1]
    
    # Separate gains and losses (like TradingView)
    gains = np.where(delta > 0, delta, 0.0)
    losses = np.where(delta < 0, -delta, 0.0)
    
    # RMA (Wilder's smoothing) - exactly like TradingView
    # First value is SMA, then use exponential smoothing
    alpha = 1.0 / period
    
    avg_gain = np.zeros(n)
    avg_loss = np.zeros(n)
    
    # Initialize with SMA for first 'period' values
    if n >= period:
        avg_gain[period-1] = np.mean(gains[1:period+1])
        avg_loss[period-1] = np.mean(losses[1:period+1])
        
        # Apply RMA formula: RMA = alpha * value + (1 - alpha) * prev_RMA
        for i in range(period, n):
            avg_gain[i] = alpha * gains[i] + (1 - alpha) * avg_gain[i-1]
            avg_loss[i] = alpha * losses[i] + (1 - alpha) * avg_loss[i-1]
    
    # Calculate RSI
    rsi = np.zeros(n)
    for i in range(period-1, n):
        if avg_loss[i] == 0:
            rsi[i] = 100.0 if avg_gain[i] > 0 else 50.0
        else:
            rs = avg_gain[i] / avg_loss[i]
            rsi[i] = 100.0 - (100.0 / (1.0 + rs))
    
    # Convert to Series with same index
    rsi_series = pd.Series(rsi, index=df.index)
    
    return rsi_series


def calculate_rsi(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """
    Wrapper for RSI calculation - uses TradingView method
    """
    return calculate_rsi_tradingview(df, period)


def classify_rsi(rsi_value: float) -> Dict:
    """
    Classify RSI value into zones with trading implications
    """
    if rsi_value is None or np.isnan(rsi_value):
        return {
            'value': None,
            'zone': RSIZone.NOT_CLEAR.value,
            'color': 'gray',
            'action': 'No Data',
            'description': 'RSI data not available'
        }
    
    rsi_value = round(rsi_value, 2)
    
    # Unsustainable Bulls (> 78-80)
    if rsi_value >= 78:
        return {
            'value': rsi_value,
            'zone': RSIZone.UNSUSTAINABLE_BULLS.value,
            'color': 'red',
            'action': 'Look for Bearish Swing',
            'description': f'RSI {rsi_value} - Overbought, unsustainable for bulls'
        }
    
    # Bullish Momentum (> 60)
    if rsi_value > 60:
        return {
            'value': rsi_value,
            'zone': RSIZone.BULLISH_MOMENTUM.value,
            'color': 'green',
            'action': 'Bullish Bias',
            'description': f'RSI {rsi_value} - Strong bullish momentum'
        }
    
    # Near 60 (55-60)
    if rsi_value >= 55:
        return {
            'value': rsi_value,
            'zone': RSIZone.NEAR_60.value,
            'color': 'lightgreen',
            'action': 'Watch for Breakout',
            'description': f'RSI {rsi_value} - Approaching bullish zone'
        }
    
    # Near 50 (45-55)
    if rsi_value >= 45:
        return {
            'value': rsi_value,
            'zone': RSIZone.NEAR_50.value,
            'color': 'gray',
            'action': 'Neutral',
            'description': f'RSI {rsi_value} - Neutral zone, no clear direction'
        }
    
    # Near 40 (40-45)
    if rsi_value >= 40:
        return {
            'value': rsi_value,
            'zone': RSIZone.NEAR_40.value,
            'color': 'orange',
            'action': 'Watch for Breakdown',
            'description': f'RSI {rsi_value} - Approaching bearish zone'
        }
    
    # Unsustainable Bears (< 22-20)
    if rsi_value <= 22:
        return {
            'value': rsi_value,
            'zone': RSIZone.UNSUSTAINABLE_BEARS.value,
            'color': 'green',
            'action': 'Look for Bullish Swing',
            'description': f'RSI {rsi_value} - Oversold, unsustainable for bears'
        }
    
    # Bearish Momentum (< 40)
    if rsi_value < 40:
        return {
            'value': rsi_value,
            'zone': RSIZone.BEARISH_MOMENTUM.value,
            'color': 'red',
            'action': 'Bearish Bias',
            'description': f'RSI {rsi_value} - Strong bearish momentum'
        }
    
    # Default - Swing Zone
    return {
        'value': rsi_value,
        'zone': RSIZone.SWING_ZONE.value,
        'color': 'yellow',
        'action': 'Range Trading',
        'description': f'RSI {rsi_value} - In swing/range zone'
    }


class TechnicalAnalyzer:
    """
    Analyzes technical indicators across multiple timeframes
    """
    
    # Timeframe configurations
    # Note: For RSI accuracy, we need sufficient historical data for proper convergence
    TIMEFRAMES = {
        'monthly': {'interval': '1mo', 'period': '5y', 'label': 'M', 'group': 'super_tide'},
        'weekly': {'interval': '1wk', 'period': '2y', 'label': 'W', 'group': 'super_tide'},
        'daily': {'interval': '1d', 'period': '1y', 'label': 'D', 'group': 'tide'},
        '4h': {'interval': '1h', 'period': '730d', 'label': '4H', 'group': 'tide'},  # Max for 1H data
        '1h': {'interval': '1h', 'period': '60d', 'label': '1H', 'group': 'wave'},
        '15m': {'interval': '15m', 'period': '60d', 'label': '15M', 'group': 'ripple'},
    }
    
    def __init__(self):
        self.cache = {}
    
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
        
        This matches how TradingView displays 4H candles for Indian stocks.
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
    
    def get_rsi_analysis(self, symbol: str) -> Dict:
        """
        Get RSI analysis across all timeframes
        """
        result = {
            'symbol': symbol,
            'indicator': 'RSI',
            'period': 14,
            'timeframes': {}
        }
        
        for tf_key, tf_config in self.TIMEFRAMES.items():
            interval = tf_config['interval']
            period = tf_config['period']
            
            # Fetch data
            df = self.fetch_data(symbol, interval, period)
            
            # Special handling for 4H (aggregate from 1H)
            if tf_key == '4h' and df is not None:
                df = self.aggregate_to_4h(df)
            
            if df is not None and len(df) >= 15:
                # Calculate RSI
                rsi = calculate_rsi(df, period=14)
                current_rsi = rsi.iloc[-1] if len(rsi) > 0 else None
                
                # Classify RSI
                classification = classify_rsi(current_rsi)
                
                result['timeframes'][tf_key] = {
                    'label': tf_config['label'],
                    'group': tf_config['group'],
                    **classification
                }
            else:
                result['timeframes'][tf_key] = {
                    'label': tf_config['label'],
                    'group': tf_config['group'],
                    'value': None,
                    'zone': 'No Data',
                    'color': 'gray',
                    'action': 'N/A',
                    'description': 'Insufficient data'
                }
        
        return result
    
    def get_full_analysis(self, symbol: str, dow_theory_data: Dict = None) -> Dict:
        """
        Get complete technical analysis for a stock
        Including Dow Theory + RSI (and future indicators)
        """
        result = {
            'symbol': symbol,
            'checklist': {
                '1_dow_theory': dow_theory_data,
                '6_indicators': {
                    'rsi': self.get_rsi_analysis(symbol)
                }
            }
        }
        
        return result
