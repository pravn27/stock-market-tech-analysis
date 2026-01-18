"""
Scanner Router - Dow Theory and Technical Analysis Scanners
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from core.dow_theory import DowTheoryAnalyzer, DowTheoryScanner
from core.nifty50_stocks import NIFTY50_STOCKS

router = APIRouter(prefix="/scanner", tags=["Scanner"])

# Get Nifty 50 symbols
NIFTY50_SYMBOLS = [stock['symbol'] for stock in NIFTY50_STOCKS]


@router.get("/dow-theory/{symbol}")
async def get_dow_theory_analysis(
    symbol: str,
):
    """
    Get Dow Theory trend analysis for a single stock across all timeframes.
    
    Returns trend classification (HH-HL, LL-LH, Sideways) for:
    - Super TIDE: Monthly, Weekly
    - TIDE: Daily, 4Hr
    - WAVE: 4Hr, 1Hr
    - RIPPLE: 1Hr, 15Min
    """
    try:
        analyzer = DowTheoryAnalyzer()
        result = analyzer.analyze_stock(symbol.upper())
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Could not analyze {symbol}")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dow-theory")
async def scan_dow_theory(
    universe: str = Query("nifty50", description="Stock universe: nifty50, custom"),
    symbols: Optional[str] = Query(None, description="Comma-separated symbols for custom universe"),
    filter_type: str = Query("all", description="Filter: all, strong_buy, pullback_buy, intraday_buy, bearish, wait"),
    limit: int = Query(50, ge=1, le=100, description="Max stocks to return")
):
    """
    Scan multiple stocks using Dow Theory analysis.
    
    Filters:
    - all: Return all stocks
    - strong_buy: All timeframes aligned bullish
    - pullback_buy: Super TIDE bullish, experiencing pullback
    - intraday_buy: WAVE + RIPPLE aligned bullish
    - bearish: Bearish opportunities
    - wait: No clear setup
    """
    try:
        # Determine symbols to scan
        if universe == "custom" and symbols:
            stock_symbols = [s.strip().upper() for s in symbols.split(",")]
        else:
            stock_symbols = NIFTY50_SYMBOLS[:limit]
        
        scanner = DowTheoryScanner()
        results = scanner.scan_with_filter(stock_symbols, filter_type)
        
        return {
            "universe": universe,
            "filter": filter_type,
            "total": len(results),
            "stocks": results[:limit]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dow-theory/summary")
async def get_dow_theory_summary():
    """
    Get summary of Dow Theory scan for Nifty 50.
    Returns count of stocks in each opportunity category.
    """
    try:
        scanner = DowTheoryScanner()
        results = scanner.scan_stocks(NIFTY50_SYMBOLS)
        
        # Count by opportunity type
        summary = {
            'strong_buy': 0,
            'pullback_buy': 0,
            'intraday_buy': 0,
            'strong_sell': 0,
            'bounce_sell': 0,
            'intraday_sell': 0,
            'wait': 0
        }
        
        type_map = {
            'STRONG BUY': 'strong_buy',
            'PULLBACK BUY': 'pullback_buy',
            'INTRADAY BUY': 'intraday_buy',
            'STRONG SELL / AVOID': 'strong_sell',
            'BOUNCE SELL': 'bounce_sell',
            'INTRADAY SELL': 'intraday_sell',
            'WAIT / NO TRADE': 'wait'
        }
        
        for result in results:
            opp_type = result.get('opportunity', {}).get('type', 'WAIT / NO TRADE')
            key = type_map.get(opp_type, 'wait')
            summary[key] += 1
        
        return {
            "total_stocks": len(results),
            "summary": summary,
            "timestamp": results[0].get('timestamp') if results else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
