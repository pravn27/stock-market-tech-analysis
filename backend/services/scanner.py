"""
Scanner Service - Business logic for sector and stock analysis
"""

from core.sector_scanner import (
    SectorRelativeStrength, StockRelativeStrength,
    NIFTY_SECTORS_MAIN, NIFTY_BROAD_INDICES, NIFTY_ALL_SECTORS, NIFTY_THEMATIC
)
from core.sector_stocks import SECTOR_STOCKS_MAP

from typing import Dict, List
from datetime import datetime


def convert_returns(returns: Dict) -> Dict:
    """Convert returns dict to API format"""
    return {
        'one_hour': returns.get('1 Hour'),
        'four_hour': returns.get('4 Hour'),
        'daily': returns.get('Daily'),
        'weekly': returns.get('Weekly'),
        'monthly': returns.get('Monthly'),
        'three_month': returns.get('3 Month')
    }


def get_status(relative: Dict, timeframe: str = 'Weekly') -> str:
    """Get status based on relative strength"""
    tf_map = {
        '1h': '1 Hour', '4h': '4 Hour', 'daily': 'Daily',
        'weekly': 'Weekly', 'monthly': 'Monthly', '3m': '3 Month'
    }
    tf = tf_map.get(timeframe.lower(), 'Weekly')
    rs = relative.get(tf, 0) or 0
    
    if rs > 1:
        return 'outperforming'
    elif rs < -1:
        return 'underperforming'
    return 'neutral'


class ScannerService:
    """Service class for scanner operations"""
    
    @staticmethod
    def get_index_groups() -> Dict[str, List[str]]:
        """Get available index groups"""
        return {
            'sectorial': list(NIFTY_SECTORS_MAIN.keys()),
            'broad_market': list(NIFTY_BROAD_INDICES.keys()),
            'thematic': list(NIFTY_THEMATIC.keys()),
            'all': list(NIFTY_ALL_SECTORS.keys())
        }
    
    @staticmethod
    def get_available_sectors() -> List[str]:
        """Get list of available sectors for stock analysis"""
        return list(SECTOR_STOCKS_MAP.keys())
    
    @staticmethod
    def get_sector_stocks(sector_name: str) -> List[str]:
        """Get stocks in a sector"""
        return SECTOR_STOCKS_MAP.get(sector_name, [])
    
    @staticmethod
    def analyze_sectors(index_group: str = 'sectorial', timeframe: str = 'weekly', lookback: int = 1) -> Dict:
        """
        Analyze sector performance vs NIFTY 50
        
        Args:
            index_group: 'sectorial', 'broad_market', 'thematic', or 'all'
            timeframe: '1h', '4h', 'daily', 'weekly', 'monthly', '3m'
            lookback: Number of periods back to compare (1 = previous, 2 = 2 periods back, etc.)
        """
        # Select index group
        indices_map = {
            'sectorial': NIFTY_SECTORS_MAIN,
            'broad_market': NIFTY_BROAD_INDICES,
            'thematic': NIFTY_THEMATIC,
            'all': NIFTY_ALL_SECTORS
        }
        indices = indices_map.get(index_group, NIFTY_SECTORS_MAIN)
        
        # Run scanner
        scanner = SectorRelativeStrength(indices)
        results = scanner.analyze_all_sectors(include_intraday=True, lookback=lookback)
        
        if not results:
            return None
        
        # Process results
        benchmark = None
        sectors = []
        outperforming = []
        neutral = []
        underperforming = []
        
        for i, sector in enumerate(results):
            returns_data = convert_returns(sector['returns'])
            relative_data = convert_returns(sector['relative'])
            status = get_status(sector['relative'], timeframe)
            
            sector_data = {
                'name': sector['name'],
                'symbol': sector['symbol'],
                'price': sector['price'],
                'returns': returns_data,
                'relative_strength': relative_data,
                'status': status,
                'rank': i + 1 if not sector['is_benchmark'] else None
            }
            
            if sector['is_benchmark']:
                benchmark = {
                    'name': sector['name'],
                    'symbol': sector['symbol'],
                    'price': sector['price'],
                    'returns': returns_data,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                sectors.append(sector_data)
                if status == 'outperforming':
                    outperforming.append(sector_data)
                elif status == 'underperforming':
                    underperforming.append(sector_data)
                else:
                    neutral.append(sector_data)
        
        # Sort by relative strength
        tf_key = {'1h': 'one_hour', '4h': 'four_hour', 'daily': 'daily',
                  'weekly': 'weekly', 'monthly': 'monthly', '3m': 'three_month'}.get(timeframe.lower(), 'weekly')
        
        sectors.sort(key=lambda x: x['relative_strength'].get(tf_key) or -999, reverse=True)
        outperforming.sort(key=lambda x: x['relative_strength'].get(tf_key) or -999, reverse=True)
        underperforming.sort(key=lambda x: x['relative_strength'].get(tf_key) or -999)
        
        # Update ranks
        for i, s in enumerate(sectors, 1):
            s['rank'] = i
        
        return {
            'benchmark': benchmark,
            'sectors': sectors,
            'outperforming': outperforming,
            'neutral': neutral,
            'underperforming': underperforming,
            'timestamp': datetime.now().isoformat(),
            'timeframe': timeframe,
            'lookback': lookback
        }
    
    @staticmethod
    def analyze_sector_stocks(sector_name: str, timeframe: str = 'weekly', lookback: int = 1) -> Dict:
        """
        Analyze stocks within a sector vs NIFTY 50
        
        Args:
            sector_name: Name of the sector
            timeframe: '1h', '4h', 'daily', 'weekly', 'monthly'
            lookback: Number of periods back to compare (1 = previous, 2 = 2 periods back, etc.)
        """
        stocks = SECTOR_STOCKS_MAP.get(sector_name)
        if not stocks:
            return None
        
        scanner = StockRelativeStrength()
        results = scanner.analyze_sector_stocks(sector_name, stocks, include_intraday=True, lookback=lookback)
        
        if not results or not results.get('stocks'):
            return None
        
        # Process benchmark
        benchmark = None
        if results.get('benchmark'):
            b = results['benchmark']
            benchmark = {
                'name': b['name'],
                'symbol': b['symbol'],
                'price': b['price'],
                'returns': convert_returns(b['returns']),
                'timestamp': datetime.now().isoformat()
            }
        
        # Process stocks
        stocks_data = []
        outperforming = []
        neutral = []
        underperforming = []
        
        for stock in results['stocks']:
            returns_data = convert_returns(stock['returns'])
            relative_data = convert_returns(stock['relative'])
            status = get_status(stock['relative'], timeframe)
            
            stock_data = {
                'symbol': stock['symbol'],
                'name': stock['name'],
                'price': stock['price'],
                'returns': returns_data,
                'relative_strength': relative_data,
                'status': status,
                'rank': None
            }
            
            stocks_data.append(stock_data)
            if status == 'outperforming':
                outperforming.append(stock_data)
            elif status == 'underperforming':
                underperforming.append(stock_data)
            else:
                neutral.append(stock_data)
        
        # Sort and rank
        tf_key = {'1h': 'one_hour', '4h': 'four_hour', 'daily': 'daily',
                  'weekly': 'weekly', 'monthly': 'monthly'}.get(timeframe.lower(), 'weekly')
        
        stocks_data.sort(key=lambda x: x['relative_strength'].get(tf_key) or -999, reverse=True)
        for i, s in enumerate(stocks_data, 1):
            s['rank'] = i
        
        outperforming.sort(key=lambda x: x['relative_strength'].get(tf_key) or -999, reverse=True)
        underperforming.sort(key=lambda x: x['relative_strength'].get(tf_key) or -999)
        
        return {
            'sector_name': sector_name,
            'benchmark': benchmark,
            'stocks': stocks_data,
            'outperforming': outperforming,
            'neutral': neutral,
            'underperforming': underperforming,
            'total_stocks': len(stocks_data),
            'timestamp': datetime.now().isoformat(),
            'timeframe': timeframe,
            'lookback': lookback
        }
