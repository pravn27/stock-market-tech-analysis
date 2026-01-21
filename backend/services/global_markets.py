"""
Global Markets Service - Fetch and analyze global market indices
"""

import yfinance as yf
from typing import Dict, List, Optional
from datetime import datetime
from core.global_markets import (
    US_MARKETS, EUROPEAN_MARKETS, ASIAN_MARKETS, 
    INDIA_ADRS, COMMODITIES, ALL_GLOBAL_MARKETS,
    SENTIMENT_WEIGHTS, VIX_LEVELS
)


class GlobalMarketsService:
    """Service for fetching global market data and calculating sentiment"""
    
    # Timeframe configurations
    TIMEFRAME_CONFIG = {
        '1h': {'period': '5d', 'interval': '1h', 'offset': 1},
        '4h': {'period': '5d', 'interval': '1h', 'offset': 4},
        'daily': {'period': '5d', 'interval': '1d', 'offset': 1},
        'weekly': {'period': '1mo', 'interval': '1d', 'offset': 5},
        'monthly': {'period': '3mo', 'interval': '1d', 'offset': 22},
    }
    
    @staticmethod
    def fetch_index_data(symbol: str, timeframe: str = 'daily') -> Optional[Dict]:
        """Fetch current data for a single index/stock with timeframe support"""
        try:
            ticker = yf.Ticker(symbol)
            
            # Get timeframe config
            tf_config = GlobalMarketsService.TIMEFRAME_CONFIG.get(timeframe, GlobalMarketsService.TIMEFRAME_CONFIG['daily'])
            
            if timeframe in ['1h', '4h']:
                # Intraday - use hourly data
                hist = ticker.history(period=tf_config['period'], interval=tf_config['interval'])
                if hist.empty or len(hist) < tf_config['offset'] + 1:
                    return None
                
                current_price = float(hist['Close'].iloc[-1])
                prev_price = float(hist['Close'].iloc[-(tf_config['offset'] + 1)])
            else:
                # Daily/Weekly/Monthly - use daily data
                hist = ticker.history(period=tf_config['period'], interval=tf_config['interval'])
                if hist.empty or len(hist) < tf_config['offset'] + 1:
                    return None
                
                current_price = float(hist['Close'].iloc[-1])
                # For daily, compare with previous day
                # For weekly, compare with ~5 trading days ago
                # For monthly, compare with ~22 trading days ago
                offset = min(tf_config['offset'], len(hist) - 1)
                prev_price = float(hist['Close'].iloc[-(offset + 1)])
            
            change = current_price - prev_price
            change_pct = (change / prev_price * 100) if prev_price else 0
            
            return {
                'price': round(current_price, 2),
                'change': round(change, 2),
                'change_pct': round(change_pct, 2),
                'prev_close': round(prev_price, 2),
            }
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
            return None
    
    @staticmethod
    def fetch_market_group(markets: List[Dict], timeframe: str = 'daily') -> List[Dict]:
        """Fetch data for a group of markets"""
        results = []
        for market in markets:
            data = GlobalMarketsService.fetch_index_data(market['symbol'], timeframe)
            if data:
                results.append({
                    'symbol': market['symbol'],
                    'name': market['name'],
                    'short': market['short'],
                    **data
                })
            else:
                # Include with null data if fetch fails
                results.append({
                    'symbol': market['symbol'],
                    'name': market['name'],
                    'short': market['short'],
                    'price': None,
                    'change': None,
                    'change_pct': None,
                    'error': True
                })
        return results
    
    @staticmethod
    def fetch_all_markets(timeframe: str = 'daily') -> Dict:
        """Fetch data for all global markets"""
        return {
            'us_markets': GlobalMarketsService.fetch_market_group(US_MARKETS, timeframe),
            'european_markets': GlobalMarketsService.fetch_market_group(EUROPEAN_MARKETS, timeframe),
            'asian_markets': GlobalMarketsService.fetch_market_group(ASIAN_MARKETS, timeframe),
            'india_adrs': GlobalMarketsService.fetch_market_group(INDIA_ADRS, timeframe),
            'commodities': GlobalMarketsService.fetch_market_group(COMMODITIES, timeframe),
            'timeframe': timeframe,
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def calculate_sentiment(markets_data: Dict) -> Dict:
        """
        Calculate global market sentiment based on multiple factors
        
        Returns sentiment score (0-100) and label
        """
        all_indices = []
        vix_value = None
        dxy_change = 0
        
        # Collect all indices (including India ADRs)
        for region in ['us_markets', 'european_markets', 'asian_markets', 'india_adrs']:
            for idx in markets_data.get(region, []):
                if idx.get('change_pct') is not None and not idx.get('error', False):
                    all_indices.append(idx)
                    
                    # Capture VIX value
                    if idx['symbol'] == '^VIX':
                        vix_value = idx['price']
                    
                    # Capture DXY change
                    if idx['symbol'] == 'DX-Y.NYB':
                        dxy_change = idx['change_pct']
        
        if not all_indices:
            return {
                'score': 50,
                'label': 'Neutral',
                'color': 'yellow',
                'breadth': {'positive': 0, 'negative': 0, 'total': 0},
                'vix': {'value': None, 'status': 'Unknown'},
                'factors': {}
            }
        
        # 1. Breadth Score (40% weight)
        # Using ±0.5% threshold for meaningful categorization
        positive_count = sum(1 for idx in all_indices if idx['change_pct'] > 0.5)
        negative_count = sum(1 for idx in all_indices if idx['change_pct'] < -0.5)
        neutral_count = sum(1 for idx in all_indices if -0.5 <= idx['change_pct'] <= 0.5)
        total_count = len(all_indices)
        breadth_pct = (positive_count / total_count) * 100 if total_count > 0 else 50
        breadth_score = breadth_pct  # 0-100
        
        # 2. Weighted Return Score (40% weight)
        weighted_return = 0
        total_weight = 0
        for idx in all_indices:
            symbol = idx['symbol']
            if symbol in SENTIMENT_WEIGHTS:
                weight = SENTIMENT_WEIGHTS[symbol]
                # For VIX and DXY, inverse relationship (negative weight already in config)
                weighted_return += idx['change_pct'] * weight
                total_weight += abs(weight)
        
        # Normalize weighted return to 0-100 scale
        # Assume -3% to +3% maps to 0-100
        normalized_return = ((weighted_return + 3) / 6) * 100
        normalized_return = max(0, min(100, normalized_return))
        
        # 3. VIX Score (20% weight)
        if vix_value is not None:
            if vix_value >= VIX_LEVELS['extreme_fear']:
                vix_score = 10  # Extreme fear
                vix_status = 'Extreme Fear'
            elif vix_value >= VIX_LEVELS['fear']:
                vix_score = 30  # Fear
                vix_status = 'Fear'
            elif vix_value >= VIX_LEVELS['neutral']:
                vix_score = 50  # Neutral
                vix_status = 'Neutral'
            elif vix_value >= VIX_LEVELS['greed']:
                vix_score = 70  # Greed
                vix_status = 'Greed'
            else:
                vix_score = 90  # Extreme greed
                vix_status = 'Extreme Greed'
        else:
            vix_score = 50
            vix_status = 'Unknown'
        
        # Calculate final sentiment score
        final_score = (breadth_score * 0.40) + (normalized_return * 0.40) + (vix_score * 0.20)
        final_score = round(final_score, 1)
        
        # Determine label and color
        if final_score >= 70:
            label = 'Bullish'
            color = 'green'
        elif final_score >= 55:
            label = 'Slightly Bullish'
            color = 'lightgreen'
        elif final_score >= 45:
            label = 'Neutral'
            color = 'yellow'
        elif final_score >= 30:
            label = 'Slightly Bearish'
            color = 'orange'
        else:
            label = 'Bearish'
            color = 'red'
        
        return {
            'score': final_score,
            'label': label,
            'color': color,
            'breadth': {
                'positive': positive_count,
                'negative': negative_count,
                'neutral': neutral_count,
                'total': total_count,
                'percentage': round(breadth_pct, 1)
            },
            'vix': {
                'value': vix_value,
                'status': vix_status
            },
            'factors': {
                'breadth_score': round(breadth_score, 1),
                'weighted_return_score': round(normalized_return, 1),
                'vix_score': round(vix_score, 1)
            }
        }
    
    @staticmethod
    def get_global_overview(timeframe: str = 'daily') -> Dict:
        """Get complete global market overview with sentiment"""
        markets_data = GlobalMarketsService.fetch_all_markets(timeframe)
        sentiment = GlobalMarketsService.calculate_sentiment(markets_data)
        
        return {
            **markets_data,
            'sentiment': sentiment
        }
    
    @staticmethod
    def get_multi_timeframe_overview() -> Dict:
        """
        Get global market data for all timeframes simultaneously
        Returns data structure with all 6 timeframes and sentiment for each
        """
        timeframes = ['1h', '4h', 'daily', 'weekly', 'monthly', '3m']
        
        # Fetch data for all timeframes
        all_timeframe_data = {}
        sentiments = {}
        
        for tf in timeframes:
            markets_data = GlobalMarketsService.fetch_all_markets(tf)
            sentiment = GlobalMarketsService.calculate_sentiment(markets_data)
            
            all_timeframe_data[tf] = markets_data
            sentiments[tf] = sentiment
        
        # Restructure data to group by market with all timeframes
        # Market groups
        market_groups = ['us_markets', 'european_markets', 'asian_markets', 'india_adrs']
        
        result = {}
        for group in market_groups:
            markets_list = []
            
            # Get unique markets from the first timeframe
            base_markets = all_timeframe_data['daily'].get(group, [])
            
            for market in base_markets:
                symbol = market['symbol']
                market_data = {
                    'symbol': symbol,
                    'name': market['name'],
                    'short': market['short'],
                    'price': market.get('price'),  # Use current price from daily
                    'timeframes': {}
                }
                
                # Add data for each timeframe
                for tf in timeframes:
                    tf_markets = all_timeframe_data[tf].get(group, [])
                    tf_market = next((m for m in tf_markets if m['symbol'] == symbol), None)
                    
                    if tf_market:
                        market_data['timeframes'][tf] = {
                            'change': tf_market.get('change'),
                            'change_pct': tf_market.get('change_pct'),
                            'error': tf_market.get('error', False)
                        }
                
                markets_list.append(market_data)
            
            result[group] = markets_list
        
        return {
            **result,
            'sentiments': sentiments,
            'timestamp': datetime.now().isoformat(),
            'mode': 'multi_timeframe'
        }
