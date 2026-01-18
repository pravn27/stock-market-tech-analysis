"""
Stock Analysis API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from services.scanner import ScannerService

router = APIRouter(prefix="/stocks", tags=["Stocks"])


@router.get("/sector/{sector_name}")
async def get_sector_stocks(
    sector_name: str,
    timeframe: str = Query("weekly", description="Timeframe: 1h, 4h, daily, weekly, monthly"),
    lookback: int = Query(1, ge=1, le=99, description="Lookback periods: 1=previous period, 2=2 periods back, etc.")
):
    """
    Get stocks in a sector with performance relative to NIFTY 50
    
    Returns stocks categorized as outperforming, neutral, underperforming
    
    - **lookback=1**: Compare current price vs previous period (default)
    - **lookback=2**: Compare current price vs 2 periods back
    - **lookback=3**: Compare current price vs 3 periods back
    """
    try:
        result = ScannerService.analyze_sector_stocks(sector_name, timeframe, lookback)
        if not result:
            raise HTTPException(
                status_code=404, 
                detail=f"Sector '{sector_name}' not found or no data available"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sector/{sector_name}/list")
async def get_sector_stock_list(sector_name: str):
    """Get list of stock symbols in a sector"""
    stocks = ScannerService.get_sector_stocks(sector_name)
    if not stocks:
        raise HTTPException(status_code=404, detail=f"Sector '{sector_name}' not found")
    return {
        "sector": sector_name,
        "stocks": stocks,
        "total": len(stocks)
    }


@router.get("/nifty50/heavyweights")
async def get_nifty50_heavyweights(
    timeframe: str = Query("weekly", description="Timeframe: 1h, 4h, daily, weekly, monthly"),
    lookback: int = Query(1, ge=1, le=99, description="Lookback periods: 1=previous, 2=2 periods back"),
    top_only: bool = Query(False, description="If true, only top 20 heavyweights")
):
    """
    Get Nifty 50 heavyweight stocks with weightage and relative performance
    
    Shows which stocks are driving the NIFTY 50 index movement.
    Stocks are sorted by weightage (heaviest first).
    
    Returns:
    - Weightage percentage for each stock
    - Performance relative to NIFTY 50
    - Total weightage of outperforming/underperforming stocks
    """
    try:
        result = ScannerService.analyze_nifty50_heavyweights(timeframe, lookback, top_only)
        if not result:
            raise HTTPException(
                status_code=500, 
                detail="Failed to analyze Nifty 50 heavyweights"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/banknifty/heavyweights")
async def get_banknifty_heavyweights(
    timeframe: str = Query("weekly", description="Timeframe: 1h, 4h, daily, weekly, monthly"),
    lookback: int = Query(1, ge=1, le=99, description="Lookback periods: 1=previous, 2=2 periods back"),
    compare_to: str = Query("banknifty", description="Benchmark: banknifty or nifty50")
):
    """
    Get Bank Nifty heavyweight stocks with weightage and relative performance
    
    Shows which banking stocks are driving the BANK NIFTY index movement.
    Stocks are sorted by weightage (heaviest first).
    
    - **compare_to=banknifty**: Compare stocks vs Bank Nifty index (default)
    - **compare_to=nifty50**: Compare stocks vs Nifty 50 index
    
    Returns:
    - Weightage percentage for each stock
    - Performance relative to selected benchmark
    - Total weightage of outperforming/underperforming stocks
    """
    try:
        result = ScannerService.analyze_banknifty_heavyweights(timeframe, lookback, compare_to)
        if not result:
            raise HTTPException(
                status_code=500, 
                detail="Failed to analyze Bank Nifty heavyweights"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
