"""
Scanner Router - Dow Theory and Technical Analysis Scanners
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from core.dow_theory import DowTheoryAnalyzer, DowTheoryScanner
from core.technical_indicators import TechnicalAnalyzer
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


@router.get("/stock/{symbol}/analysis")
async def get_stock_full_analysis(
    symbol: str,
):
    """
    Get FULL technical analysis for a single stock (PAPA + SMM Checklist).
    
    Returns:
    - Dow Theory trend analysis (all timeframes)
    - RSI analysis (all timeframes)
    - (Future: MACD, Stochastic, ADX, DMI, Bollinger, EMAs)
    
    Timeframe Groups:
    - Super TIDE: Monthly, Weekly
    - TIDE: Daily, 4Hr
    - WAVE: 4Hr, 1Hr
    - RIPPLE: 1Hr, 15Min
    """
    try:
        symbol = symbol.upper()
        
        # Get Dow Theory analysis
        dow_analyzer = DowTheoryAnalyzer()
        dow_result = dow_analyzer.analyze_stock(symbol)
        
        # Get Technical Indicators
        tech_analyzer = TechnicalAnalyzer()
        rsi_result = tech_analyzer.get_rsi_analysis(symbol)
        macd_result = tech_analyzer.get_macd_analysis(symbol)
        
        # Get stock info
        stock_info = next((s for s in NIFTY50_STOCKS if s['symbol'] == symbol), None)
        
        return {
            "symbol": symbol,
            "name": stock_info['name'] if stock_info else symbol,
            "sector": stock_info.get('sector', 'Unknown') if stock_info else 'Unknown',
            "checklist": {
                "1_dow_theory": {
                    "name": "Overall Context / Dow Theory",
                    "description": "Where do you stand in overall trend?",
                    "data": dow_result
                },
                "6_indicators": {
                    "name": "Technical Indicators",
                    "indicators": {
                        "rsi": {
                            "name": "RSI (14)",
                            "description": "Relative Strength Index",
                            "data": rsi_result
                        },
                        "macd": {
                            "name": "MACD (12,26,9)",
                            "description": "Moving Average Convergence Divergence",
                            "data": macd_result
                        }
                        # Future: Stochastic, ADX, DMI, Bollinger, EMAs
                    }
                }
            },
            "opportunity": dow_result.get('opportunity'),
            "mtf_groups": dow_result.get('mtf_groups')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rsi/{symbol}")
async def get_rsi_analysis(
    symbol: str,
):
    """
    Get RSI analysis for a single stock across all timeframes.
    """
    try:
        analyzer = TechnicalAnalyzer()
        result = analyzer.get_rsi_analysis(symbol.upper())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/macd/{symbol}")
async def get_macd_analysis(
    symbol: str,
    fast: int = Query(12, description="Fast EMA period"),
    slow: int = Query(26, description="Slow EMA period"),
    signal: int = Query(9, description="Signal line EMA period"),
):
    """
    Get MACD analysis for a single stock across all timeframes.
    
    MACD Components:
    - MACD Line = EMA(fast) - EMA(slow)
    - Signal Line = EMA(signal) of MACD Line
    - Histogram = MACD Line - Signal Line
    
    Signal Types:
    - PCO (Positive Crossover): MACD crosses above Signal - Buy signal
    - NCO (Negative Crossover): MACD crosses below Signal - Sell signal
    - Up/Down Tick: Direction of MACD movement
    - Zone: Position relative to zero line
    """
    try:
        analyzer = TechnicalAnalyzer()
        result = analyzer.get_macd_analysis(symbol.upper(), fast, slow, signal)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
