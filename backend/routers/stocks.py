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
