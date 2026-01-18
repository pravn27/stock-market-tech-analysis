"""
Sector Analysis API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.scanner import ScannerService
from core.data_validator import validate_all_indices
from core.sector_scanner import NIFTY_SECTORS_MAIN, NIFTY_BROAD_INDICES, NIFTY_ALL_SECTORS

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


@router.get("/top-performers")
async def get_top_performers(
    limit: int = Query(3, ge=1, le=20, description="Number of top items per category (1-20)"),
    include: str = Query("all", description="Include: sectorial, broad_market, thematic, or all"),
    lookback: int = Query(1, ge=1, le=99, description="Lookback periods: 1=current, 2=2 periods back, etc.")
):
    """
    Get top N outperforming, underperforming, and neutral sectors/indices
    across ALL timeframes (3M, M, W, D, 4H, 1H) in a single view.
    
    - **limit**: Number of top items to show per category (default 3)
    - **include**: Which indices to include (default all)
    - **lookback**: Compare current vs N periods back (default 1)
    """
    try:
        result = ScannerService.get_top_performers(limit, include, lookback)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to fetch top performers data")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/validate")
async def validate_data_sources(
    group: str = Query("sectorial", description="Index group to validate: sectorial, broad_market, all")
):
    """
    Validate data sources for all indices.
    
    Use this endpoint to check if Yahoo Finance symbols are returning valid data.
    Run periodically to catch data source issues early.
    """
    try:
        indices_map = {
            'sectorial': NIFTY_SECTORS_MAIN,
            'broad_market': NIFTY_BROAD_INDICES,
            'all': NIFTY_ALL_SECTORS
        }
        indices = indices_map.get(group, NIFTY_SECTORS_MAIN)
        result = validate_all_indices(indices)
        
        return {
            'group': group,
            'valid_count': len(result['valid']),
            'invalid_count': len(result['invalid']),
            'nse_fallback_count': len(result['nse_fallback']),
            'valid': result['valid'],
            'invalid': result['invalid'],
            'nse_fallback': result['nse_fallback'],
            'timestamp': result['timestamp'],
            'health': 'OK' if len(result['invalid']) == 0 else 'WARNING'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
