"""
Scanner Service - Business logic for sector and stock analysis
"""

from core.sector_scanner import (
    SectorRelativeStrength, StockRelativeStrength,
    NIFTY_SECTORS_MAIN, NIFTY_BROAD_INDICES, NIFTY_ALL_SECTORS, NIFTY_THEMATIC
)
from core.sector_stocks import SECTOR_STOCKS_MAP
from core.nifty50_stocks import NIFTY50_STOCKS, NIFTY50_TOP_HEAVYWEIGHTS
from core.banknifty_stocks import BANKNIFTY_STOCKS

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
    
    @staticmethod
    def analyze_nifty50_heavyweights(timeframe: str = 'weekly', lookback: int = 1, top_only: bool = False) -> Dict:
        """
        Analyze Nifty 50 heavyweight stocks vs NIFTY 50 index
        Shows which stocks are driving the index movement
        
        Args:
            timeframe: '1h', '4h', 'daily', 'weekly', 'monthly'
            lookback: Number of periods back to compare
            top_only: If True, only returns top 20 heavyweights
        """
        # Get stocks list with weightage
        stocks_list = NIFTY50_TOP_HEAVYWEIGHTS if top_only else NIFTY50_STOCKS
        stock_symbols = [s["symbol"] for s in stocks_list]
        
        # Create weightage lookup
        weightage_map = {s["symbol"]: s["weightage"] for s in stocks_list}
        name_map = {s["symbol"]: s["name"] for s in stocks_list}
        
        # Run analysis
        scanner = StockRelativeStrength()
        results = scanner.analyze_sector_stocks("Nifty 50", stock_symbols, include_intraday=True, lookback=lookback)
        
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
        
        # Process stocks with weightage
        stocks_data = []
        outperforming = []
        neutral = []
        underperforming = []
        
        for stock in results['stocks']:
            symbol = stock['symbol']
            returns_data = convert_returns(stock['returns'])
            relative_data = convert_returns(stock['relative'])
            status = get_status(stock['relative'], timeframe)
            weightage = weightage_map.get(symbol, 0)
            
            stock_data = {
                'symbol': symbol,
                'name': name_map.get(symbol, stock['name']),
                'price': stock['price'],
                'weightage': weightage,
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
        
        # Sort by weightage (heaviest first)
        stocks_data.sort(key=lambda x: x['weightage'], reverse=True)
        for i, s in enumerate(stocks_data, 1):
            s['rank'] = i
        
        # Sort categories by weightage too
        outperforming.sort(key=lambda x: x['weightage'], reverse=True)
        neutral.sort(key=lambda x: x['weightage'], reverse=True)
        underperforming.sort(key=lambda x: x['weightage'], reverse=True)
        
        # Calculate impact metrics
        total_weightage = sum(s['weightage'] for s in stocks_data)
        outperforming_weightage = sum(s['weightage'] for s in outperforming)
        underperforming_weightage = sum(s['weightage'] for s in underperforming)
        
        return {
            'benchmark': benchmark,
            'stocks': stocks_data,
            'outperforming': outperforming,
            'neutral': neutral,
            'underperforming': underperforming,
            'total_stocks': len(stocks_data),
            'total_weightage': round(total_weightage, 2),
            'outperforming_weightage': round(outperforming_weightage, 2),
            'underperforming_weightage': round(underperforming_weightage, 2),
            'timestamp': datetime.now().isoformat(),
            'timeframe': timeframe,
            'lookback': lookback
        }
    
    @staticmethod
    def analyze_banknifty_heavyweights(timeframe: str = 'weekly', lookback: int = 1, compare_to: str = 'banknifty') -> Dict:
        """
        Analyze Bank Nifty heavyweight stocks vs selected benchmark
        Shows which banking stocks are driving the index movement
        
        Args:
            timeframe: '1h', '4h', 'daily', 'weekly', 'monthly'
            lookback: Number of periods back to compare
            compare_to: 'banknifty' or 'nifty50' - benchmark to compare against
        """
        import yfinance as yf
        
        # Select benchmark based on compare_to parameter
        if compare_to == 'nifty50':
            benchmark_symbol = "^NSEI"
            benchmark_name = "NIFTY 50"
        else:  # default to banknifty
            benchmark_symbol = "^NSEBANK"
            benchmark_name = "NIFTY BANK"
        
        # Get stocks list with weightage
        stocks_list = BANKNIFTY_STOCKS
        stock_symbols = [s["symbol"] for s in stocks_list]
        
        # Create weightage lookup
        weightage_map = {s["symbol"]: s["weightage"] for s in stocks_list}
        name_map = {s["symbol"]: s["name"] for s in stocks_list}
        
        # Run analysis using StockRelativeStrength with selected benchmark
        scanner = StockRelativeStrength()
        
        # Override benchmark based on selection
        scanner.benchmark_symbol = benchmark_symbol
        scanner.benchmark_name = benchmark_name
        
        results = scanner.analyze_sector_stocks("Bank Nifty", stock_symbols, include_intraday=True, lookback=lookback)
        
        if not results or not results.get('stocks'):
            return None
        
        # Process benchmark (Bank Nifty)
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
        
        # Process stocks with weightage
        stocks_data = []
        outperforming = []
        neutral = []
        underperforming = []
        
        for stock in results['stocks']:
            symbol = stock['symbol']
            returns_data = convert_returns(stock['returns'])
            relative_data = convert_returns(stock['relative'])
            status = get_status(stock['relative'], timeframe)
            weightage = weightage_map.get(symbol, 0)
            
            stock_data = {
                'symbol': symbol,
                'name': name_map.get(symbol, stock['name']),
                'price': stock['price'],
                'weightage': weightage,
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
        
        # Sort by weightage (heaviest first)
        stocks_data.sort(key=lambda x: x['weightage'], reverse=True)
        for i, s in enumerate(stocks_data, 1):
            s['rank'] = i
        
        # Sort categories by weightage too
        outperforming.sort(key=lambda x: x['weightage'], reverse=True)
        neutral.sort(key=lambda x: x['weightage'], reverse=True)
        underperforming.sort(key=lambda x: x['weightage'], reverse=True)
        
        # Calculate impact metrics
        total_weightage = sum(s['weightage'] for s in stocks_data)
        outperforming_weightage = sum(s['weightage'] for s in outperforming)
        underperforming_weightage = sum(s['weightage'] for s in underperforming)
        
        return {
            'benchmark': benchmark,
            'stocks': stocks_data,
            'outperforming': outperforming,
            'neutral': neutral,
            'underperforming': underperforming,
            'total_stocks': len(stocks_data),
            'total_weightage': round(total_weightage, 2),
            'outperforming_weightage': round(outperforming_weightage, 2),
            'underperforming_weightage': round(underperforming_weightage, 2),
            'timestamp': datetime.now().isoformat(),
            'timeframe': timeframe,
            'lookback': lookback
        }
    
    @staticmethod
    def get_top_performers(limit: int = 3, include: str = 'all', lookback: int = 1) -> Dict:
        """
        Get top N outperforming, underperforming, and neutral sectors/indices
        across ALL timeframes (3M, M, W, D, 4H, 1H)
        
        Args:
            limit: Number of top items per category (default 3)
            include: 'sectorial', 'broad_market', 'thematic', or 'all'
            lookback: Number of periods back to compare (1 = previous, 2 = 2 periods back, etc.)
        """
        # Select index group
        indices_map = {
            'sectorial': NIFTY_SECTORS_MAIN,
            'broad_market': NIFTY_BROAD_INDICES,
            'thematic': NIFTY_THEMATIC,
            'all': NIFTY_ALL_SECTORS
        }
        indices = indices_map.get(include, NIFTY_ALL_SECTORS)
        
        # Timeframes to analyze
        timeframes = ['3m', 'monthly', 'weekly', 'daily', '4h', '1h']
        tf_keys = {
            '3m': 'three_month', 'monthly': 'monthly', 'weekly': 'weekly',
            'daily': 'daily', '4h': 'four_hour', '1h': 'one_hour'
        }
        tf_labels = {
            '3m': '3M', 'monthly': 'M', 'weekly': 'W',
            'daily': 'D', '4h': '4H', '1h': '1H'
        }
        
        # Run scanner once to get all data
        scanner = SectorRelativeStrength(indices)
        results = scanner.analyze_all_sectors(include_intraday=True, lookback=lookback)
        
        if not results:
            return None
        
        # Process results - exclude benchmark
        sectors = []
        benchmark = None
        for sector in results:
            if sector['is_benchmark']:
                benchmark = {
                    'name': sector['name'],
                    'symbol': sector['symbol'],
                    'price': sector['price'],
                    'returns': convert_returns(sector['returns'])
                }
                continue
            
            sectors.append({
                'name': sector['name'],
                'symbol': sector['symbol'],
                'price': sector['price'],
                'returns': convert_returns(sector['returns']),
                'relative_strength': convert_returns(sector['relative'])
            })
        
        # Build response for each timeframe
        result = {
            'outperforming': {},
            'underperforming': {},
            'neutral': {},
            'benchmark': benchmark,
            'timeframes': list(tf_labels.values()),
            'limit': limit,
            'include': include,
            'lookback': lookback,
            'timestamp': datetime.now().isoformat()
        }
        
        for tf in timeframes:
            tf_key = tf_keys[tf]
            tf_label = tf_labels[tf]
            
            # Sort by relative strength for this timeframe
            sorted_sectors = sorted(
                sectors,
                key=lambda x: x['relative_strength'].get(tf_key) or -999,
                reverse=True
            )
            
            # Categorize
            outperforming = []
            underperforming = []
            neutral = []
            
            for s in sorted_sectors:
                rs = s['relative_strength'].get(tf_key) or 0
                ret = s['returns'].get(tf_key)
                
                item = {
                    'name': s['name'],
                    'symbol': s['symbol'],
                    'return': ret,
                    'rs': rs
                }
                
                if rs > 1:
                    outperforming.append(item)
                elif rs < -1:
                    underperforming.append(item)
                else:
                    neutral.append(item)
            
            # Sort underperforming by RS ascending (worst first)
            underperforming.sort(key=lambda x: x['rs'])
            
            # Take top N for each category
            result['outperforming'][tf_label] = outperforming[:limit]
            result['underperforming'][tf_label] = underperforming[:limit]
            result['neutral'][tf_label] = neutral[:limit]
        
        return result
