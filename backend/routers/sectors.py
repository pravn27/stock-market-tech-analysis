"""
Sector Analysis API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.services.scanner import ScannerService

router = APIRouter(prefix="/sectors", tags=["Sectors"])


@router.get("/groups")
async def get_index_groups():
    """Get available index groups (sectorial, broad_market, all)"""
    return ScannerService.get_index_groups()


@router.get("/performance")
async def get_sector_performance(
    group: str = Query("sectorial", description="Index group: sectorial, broad_market, all"),
    timeframe: str = Query("weekly", description="Timeframe: 1h, 4h, daily, weekly, monthly, 3m"),
    lookback: int = Query(1, ge=1, le=99, description="Lookback periods: 1=previous period, 2=2 periods back, etc.")
):
    """
    Get sector performance relative to NIFTY 50
    
    Returns sectors categorized as outperforming, neutral, underperforming
    
    - **lookback=1**: Compare current price vs previous period (default)
    - **lookback=2**: Compare current price vs 2 periods back
    - **lookback=3**: Compare current price vs 3 periods back
    """
    try:
        result = ScannerService.analyze_sectors(group, timeframe, lookback)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to fetch sector data")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def get_sectors_list():
    """Get list of available sectors for stock analysis"""
    sectors = ScannerService.get_available_sectors()
    return {
        "sectors": sectors,
        "total": len(sectors)
    }
