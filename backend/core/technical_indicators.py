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


class MACDSignal(Enum):
    """MACD Signal Types"""
    PCO_ABOVE_ZERO = "PCO Above Zero"       # Positive crossover above zero line - Strong Buy
    PCO_BELOW_ZERO = "PCO Below Zero"       # Positive crossover below zero line - Early Buy
    PCO_NEAR_ZERO = "PCO Near Zero"         # Positive crossover near zero line - Buy Signal
    NCO_BELOW_ZERO = "NCO Below Zero"       # Negative crossover below zero line - Strong Sell
    NCO_ABOVE_ZERO = "NCO Above Zero"       # Negative crossover above zero line - Early Sell
    NCO_NEAR_ZERO = "NCO Near Zero"         # Negative crossover near zero line - Sell Signal
    UPTICK_ABOVE_ZERO = "Up Tick Above Zero"    # MACD rising above zero - Bullish Momentum
    UPTICK_BELOW_ZERO = "Up Tick Below Zero"    # MACD rising below zero - Potential Reversal
    DOWNTICK_ABOVE_ZERO = "Down Tick Above Zero" # MACD falling above zero - Weakening
    DOWNTICK_BELOW_ZERO = "Down Tick Below Zero" # MACD falling below zero - Bearish Momentum
    NEUTRAL = "Neutral"
    NO_DATA = "No Data"


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


# ============================================================================
# MACD (Moving Average Convergence Divergence)
# ============================================================================

def calculate_ema(data: np.ndarray, period: int) -> np.ndarray:
    """
    Calculate Exponential Moving Average (EMA)
    EMA = price * multiplier + EMA_prev * (1 - multiplier)
    multiplier = 2 / (period + 1)
    """
    n = len(data)
    ema = np.zeros(n)
    
    if n < period:
        return ema
    
    # First EMA value is SMA
    ema[period-1] = np.mean(data[:period])
    
    # Calculate EMA
    multiplier = 2.0 / (period + 1)
    for i in range(period, n):
        ema[i] = data[i] * multiplier + ema[i-1] * (1 - multiplier)
    
    return ema


def calculate_macd(df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict:
    """
    Calculate MACD (Moving Average Convergence Divergence)
    
    Components:
    - MACD Line = EMA(fast) - EMA(slow)  [typically 12 - 26]
    - Signal Line = EMA(signal) of MACD Line  [typically 9]
    - Histogram = MACD Line - Signal Line
    
    Returns dict with macd_line, signal_line, histogram arrays
    """
    if df is None or len(df) < slow + signal:
        return None
    
    close = df['Close'].values
    n = len(close)
    
    # Calculate EMAs
    ema_fast = calculate_ema(close, fast)
    ema_slow = calculate_ema(close, slow)
    
    # MACD Line = EMA(fast) - EMA(slow)
    macd_line = np.zeros(n)
    macd_line[slow-1:] = ema_fast[slow-1:] - ema_slow[slow-1:]
    
    # Signal Line = EMA of MACD Line
    # Start calculating after we have valid MACD values
    signal_line = np.zeros(n)
    valid_macd_start = slow - 1
    macd_for_signal = macd_line[valid_macd_start:]
    
    if len(macd_for_signal) >= signal:
        ema_signal = calculate_ema(macd_for_signal, signal)
        signal_line[valid_macd_start:] = ema_signal
    
    # Histogram = MACD - Signal
    histogram = macd_line - signal_line
    
    return {
        'macd_line': macd_line,
        'signal_line': signal_line,
        'histogram': histogram,
        'ema_fast': ema_fast,
        'ema_slow': ema_slow
    }


def classify_macd(macd_data: Dict, zero_threshold: float = 2.0) -> Dict:
    """
    Classify MACD into trading signals based on:
    - Crossover (PCO/NCO)
    - Position relative to zero line
    - Tick direction (up/down)
    
    Args:
        macd_data: Dict with macd_line, signal_line, histogram
        zero_threshold: Range around zero to consider "near zero" (default ±2)
    
    Returns:
        Dict with signal classification
    """
    if macd_data is None:
        return {
            'macd_value': None,
            'signal_value': None,
            'histogram': None,
            'signal': MACDSignal.NO_DATA.value,
            'color': 'gray',
            'action': 'No Data',
            'description': 'MACD data not available'
        }
    
    macd_line = macd_data['macd_line']
    signal_line = macd_data['signal_line']
    histogram = macd_data['histogram']
    
    n = len(macd_line)
    if n < 2:
        return {
            'macd_value': None,
            'signal_value': None,
            'histogram': None,
            'signal': MACDSignal.NO_DATA.value,
            'color': 'gray',
            'action': 'No Data',
            'description': 'Insufficient MACD data'
        }
    
    # Current and previous values
    macd_curr = round(macd_line[-1], 2)
    macd_prev = round(macd_line[-2], 2)
    signal_curr = round(signal_line[-1], 2)
    signal_prev = round(signal_line[-2], 2)
    hist_curr = round(histogram[-1], 2)
    
    # Detect crossover
    # PCO: MACD crosses above Signal (prev: MACD <= Signal, curr: MACD > Signal)
    pco = macd_prev <= signal_prev and macd_curr > signal_curr
    # NCO: MACD crosses below Signal (prev: MACD >= Signal, curr: MACD < Signal)
    nco = macd_prev >= signal_prev and macd_curr < signal_curr
    
    # Tick direction
    uptick = macd_curr > macd_prev
    downtick = macd_curr < macd_prev
    
    # Position relative to zero
    above_zero = macd_curr > zero_threshold
    below_zero = macd_curr < -zero_threshold
    near_zero = -zero_threshold <= macd_curr <= zero_threshold
    
    # Determine signal based on priority: Crossover > Tick
    
    # POSITIVE CROSSOVER (PCO) cases
    if pco:
        if above_zero:
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.PCO_ABOVE_ZERO.value,
                'crossover': 'PCO',
                'tick': 'UP' if uptick else 'DOWN',
                'zone': 'Above Zero',
                'color': 'green',
                'action': 'Strong Buy Signal',
                'description': f'PCO above zero line - Strong bullish confirmation'
            }
        elif near_zero:
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.PCO_NEAR_ZERO.value,
                'crossover': 'PCO',
                'tick': 'UP' if uptick else 'DOWN',
                'zone': 'Near Zero',
                'color': 'cyan',
                'action': 'Buy Signal',
                'description': f'PCO near zero line - Bullish crossover'
            }
        else:  # below_zero
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.PCO_BELOW_ZERO.value,
                'crossover': 'PCO',
                'tick': 'UP' if uptick else 'DOWN',
                'zone': 'Below Zero',
                'color': 'yellow',
                'action': 'Early Buy Signal',
                'description': f'PCO below zero line - Potential reversal forming'
            }
    
    # NEGATIVE CROSSOVER (NCO) cases
    if nco:
        if below_zero:
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.NCO_BELOW_ZERO.value,
                'crossover': 'NCO',
                'tick': 'UP' if uptick else 'DOWN',
                'zone': 'Below Zero',
                'color': 'red',
                'action': 'Strong Sell Signal',
                'description': f'NCO below zero line - Strong bearish confirmation'
            }
        elif near_zero:
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.NCO_NEAR_ZERO.value,
                'crossover': 'NCO',
                'tick': 'UP' if uptick else 'DOWN',
                'zone': 'Near Zero',
                'color': 'pink',
                'action': 'Sell Signal',
                'description': f'NCO near zero line - Bearish crossover'
            }
        else:  # above_zero
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.NCO_ABOVE_ZERO.value,
                'crossover': 'NCO',
                'tick': 'UP' if uptick else 'DOWN',
                'zone': 'Above Zero',
                'color': 'orange',
                'action': 'Early Sell Signal',
                'description': f'NCO above zero line - Momentum weakening'
            }
    
    # NO CROSSOVER - Check tick direction
    if uptick:
        if above_zero:
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.UPTICK_ABOVE_ZERO.value,
                'crossover': None,
                'tick': 'UP',
                'zone': 'Above Zero',
                'color': 'green',
                'action': 'Bullish Momentum',
                'description': f'MACD rising above zero - Strong bullish momentum'
            }
        elif near_zero:
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.UPTICK_BELOW_ZERO.value,
                'crossover': None,
                'tick': 'UP',
                'zone': 'Near Zero',
                'color': 'yellow',
                'action': 'Buy Signal (Near Zero)',
                'description': f'MACD rising near zero - Watch for breakout'
            }
        else:  # below_zero
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.UPTICK_BELOW_ZERO.value,
                'crossover': None,
                'tick': 'UP',
                'zone': 'Below Zero',
                'color': 'yellow',
                'action': 'Potential Reversal',
                'description': f'MACD rising below zero - Bearish pressure easing'
            }
    
    if downtick:
        if below_zero:
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.DOWNTICK_BELOW_ZERO.value,
                'crossover': None,
                'tick': 'DOWN',
                'zone': 'Below Zero',
                'color': 'red',
                'action': 'Bearish Momentum',
                'description': f'MACD falling below zero - Strong bearish momentum'
            }
        elif near_zero:
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.DOWNTICK_ABOVE_ZERO.value,
                'crossover': None,
                'tick': 'DOWN',
                'zone': 'Near Zero',
                'color': 'orange',
                'action': 'Sell Signal (Near Zero)',
                'description': f'MACD falling near zero - Watch for breakdown'
            }
        else:  # above_zero
            return {
                'macd_value': macd_curr,
                'signal_value': signal_curr,
                'histogram': hist_curr,
                'signal': MACDSignal.DOWNTICK_ABOVE_ZERO.value,
                'crossover': None,
                'tick': 'DOWN',
                'zone': 'Above Zero',
                'color': 'orange',
                'action': 'Weakening',
                'description': f'MACD falling above zero - Bullish momentum weakening'
            }
    
    # Neutral (no significant movement)
    return {
        'macd_value': macd_curr,
        'signal_value': signal_curr,
        'histogram': hist_curr,
        'signal': MACDSignal.NEUTRAL.value,
        'crossover': None,
        'tick': 'FLAT',
        'zone': 'Above Zero' if above_zero else ('Below Zero' if below_zero else 'Near Zero'),
        'color': 'gray',
        'action': 'Neutral',
        'description': f'MACD neutral - No clear signal'
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
    
    def append_current_period(self, df: pd.DataFrame, symbol: str, interval: str) -> pd.DataFrame:
        """
        Append current incomplete period (week/month) to match TradingView's live RSI.
        Yahoo Finance only returns completed candles, but TradingView shows RSI 
        including the current incomplete candle.
        
        Weekly candles: Start from Monday (like TradingView)
        Monthly candles: Start from 1st of month
        """
        if df is None or df.empty:
            return df
        
        try:
            yf_symbol = f"{symbol}.NS" if not symbol.endswith('.NS') else symbol
            ticker = yf.Ticker(yf_symbol)
            
            if interval == '1wk':
                # Get daily data for the last 2 weeks to ensure we capture current week
                daily_df = ticker.history(period='14d', interval='1d')
                if daily_df.empty:
                    return df
                
                # Find current week's Monday
                # TradingView weekly candles start on Monday
                from datetime import datetime, timedelta
                import pytz
                
                # Get today's date in IST
                ist = pytz.timezone('Asia/Kolkata')
                today = datetime.now(ist).date()
                
                # Find this week's Monday (weekday() returns 0 for Monday)
                days_since_monday = today.weekday()
                current_week_monday = today - timedelta(days=days_since_monday)
                
                # Convert daily_df index to dates for comparison
                daily_df_dates = daily_df.index.tz_convert('Asia/Kolkata').date if daily_df.index.tz else daily_df.index.date
                
                # Filter daily data from this week's Monday onwards
                current_week_mask = [d >= current_week_monday for d in daily_df_dates]
                current_week_data = daily_df[current_week_mask]
                
                if len(current_week_data) > 0:
                    # Check if the last weekly candle in df already includes this week
                    last_weekly_date = df.index[-1]
                    if hasattr(last_weekly_date, 'tz_convert'):
                        last_weekly_date = last_weekly_date.tz_convert('Asia/Kolkata')
                    last_weekly_monday = last_weekly_date.date() - timedelta(days=last_weekly_date.weekday())
                    
                    # Only append if this is a new week not in the existing data
                    if current_week_monday > last_weekly_monday:
                        # Create current week's candle (Monday-based)
                        current_candle = pd.DataFrame({
                            'Open': [current_week_data['Open'].iloc[0]],
                            'High': [current_week_data['High'].max()],
                            'Low': [current_week_data['Low'].min()],
                            'Close': [current_week_data['Close'].iloc[-1]],
                            'Volume': [current_week_data['Volume'].sum()]
                        }, index=[current_week_data.index[-1]])
                        
                        df = pd.concat([df, current_candle])
                    else:
                        # Update the last candle with current week's data
                        # This handles the case where Yahoo's week boundary differs from Monday
                        all_this_week = daily_df[[d >= last_weekly_monday for d in daily_df_dates]]
                        if len(all_this_week) > 0:
                            df.iloc[-1, df.columns.get_loc('High')] = max(df.iloc[-1]['High'], all_this_week['High'].max())
                            df.iloc[-1, df.columns.get_loc('Low')] = min(df.iloc[-1]['Low'], all_this_week['Low'].min())
                            df.iloc[-1, df.columns.get_loc('Close')] = all_this_week['Close'].iloc[-1]
            
            elif interval == '1mo':
                # Get daily data for current month
                daily_df = ticker.history(period='1mo', interval='1d')
                if daily_df.empty:
                    return df
                
                from datetime import datetime
                import pytz
                
                # Get current month's first day
                ist = pytz.timezone('Asia/Kolkata')
                today = datetime.now(ist).date()
                current_month_start = today.replace(day=1)
                
                # Convert daily_df index to dates
                daily_df_dates = daily_df.index.tz_convert('Asia/Kolkata').date if daily_df.index.tz else daily_df.index.date
                
                # Filter daily data from this month
                current_month_mask = [d >= current_month_start for d in daily_df_dates]
                current_month_data = daily_df[current_month_mask]
                
                if len(current_month_data) > 0:
                    # Check if last monthly candle already includes this month
                    last_monthly_date = df.index[-1]
                    if hasattr(last_monthly_date, 'tz_convert'):
                        last_monthly_date = last_monthly_date.tz_convert('Asia/Kolkata')
                    last_month_start = last_monthly_date.date().replace(day=1)
                    
                    if current_month_start > last_month_start:
                        # Create new month's candle
                        current_candle = pd.DataFrame({
                            'Open': [current_month_data['Open'].iloc[0]],
                            'High': [current_month_data['High'].max()],
                            'Low': [current_month_data['Low'].min()],
                            'Close': [current_month_data['Close'].iloc[-1]],
                            'Volume': [current_month_data['Volume'].sum()]
                        }, index=[current_month_data.index[-1]])
                        
                        df = pd.concat([df, current_candle])
                    else:
                        # Update last candle with current month's latest data
                        df.iloc[-1, df.columns.get_loc('High')] = max(df.iloc[-1]['High'], current_month_data['High'].max())
                        df.iloc[-1, df.columns.get_loc('Low')] = min(df.iloc[-1]['Low'], current_month_data['Low'].min())
                        df.iloc[-1, df.columns.get_loc('Close')] = current_month_data['Close'].iloc[-1]
            
            return df
        except Exception as e:
            print(f"Error appending current period: {e}")
            return df
    
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
            
            # For weekly and monthly, append current incomplete period to match TradingView
            if tf_key in ['weekly', 'monthly'] and df is not None:
                df = self.append_current_period(df, symbol, interval)
            
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
    
    def get_macd_analysis(self, symbol: str, fast: int = 12, slow: int = 26, signal_period: int = 9) -> Dict:
        """
        Get MACD analysis across all timeframes
        
        Args:
            symbol: Stock symbol
            fast: Fast EMA period (default 12)
            slow: Slow EMA period (default 26)
            signal_period: Signal line EMA period (default 9)
        """
        result = {
            'symbol': symbol,
            'indicator': 'MACD',
            'params': f'({fast},{slow},{signal_period})',
            'timeframes': {}
        }
        
        for tf_key, tf_config in self.TIMEFRAMES.items():
            interval = tf_config['interval']
            period = tf_config['period']
            
            # Fetch data
            df = self.fetch_data(symbol, interval, period)
            
            # For weekly and monthly, append current incomplete period
            if tf_key in ['weekly', 'monthly'] and df is not None:
                df = self.append_current_period(df, symbol, interval)
            
            # Special handling for 4H (aggregate from 1H)
            if tf_key == '4h' and df is not None:
                df = self.aggregate_to_4h(df)
            
            if df is not None and len(df) >= slow + signal_period:
                # Calculate MACD
                macd_data = calculate_macd(df, fast, slow, signal_period)
                
                # Classify MACD
                classification = classify_macd(macd_data)
                
                result['timeframes'][tf_key] = {
                    'label': tf_config['label'],
                    'group': tf_config['group'],
                    **classification
                }
            else:
                result['timeframes'][tf_key] = {
                    'label': tf_config['label'],
                    'group': tf_config['group'],
                    'macd_value': None,
                    'signal_value': None,
                    'histogram': None,
                    'signal': 'No Data',
                    'color': 'gray',
                    'action': 'N/A',
                    'description': 'Insufficient data'
                }
        
        return result
    
    def get_full_analysis(self, symbol: str, dow_theory_data: Dict = None) -> Dict:
        """
        Get complete technical analysis for a stock
        Including Dow Theory + RSI + MACD (and future indicators)
        """
        result = {
            'symbol': symbol,
            'checklist': {
                '1_dow_theory': dow_theory_data,
                '6_indicators': {
                    'rsi': self.get_rsi_analysis(symbol),
                    'macd': self.get_macd_analysis(symbol)
                }
            }
        }
        
        return result
