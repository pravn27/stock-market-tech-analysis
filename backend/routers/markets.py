"""
Global Markets API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from services.global_markets import GlobalMarketsService

router = APIRouter(prefix="/markets", tags=["Global Markets"])


@router.get("/global")
async def get_global_markets(
    timeframe: str = Query("daily", description="Timeframe: 1h, 4h, daily, weekly, monthly"),
    multi: bool = Query(False, description="Return all timeframes")
):
    """
    Get global market indices with sentiment analysis
    
    Timeframes:
    - **1h**: Compare with 1 hour ago
    - **4h**: Compare with 4 hours ago
    - **daily**: Compare with previous day close (default)
    - **weekly**: Compare with last week
    - **monthly**: Compare with last month
    - **3m**: Compare with 3 months ago
    
    Parameters:
    - **multi**: If true, returns data for all timeframes (1h, 4h, daily, weekly, monthly, 3m)
    
    Returns data for:
    - US Markets (DJI, S&P 500, NASDAQ, VIX, etc.)
    - European Markets (DAX, FTSE, CAC40, etc.)
    - Asian Markets (Nifty, Sensex, Nikkei, Hang Seng, etc.)
    - India ADRs (Infosys, Wipro, ICICI, HDFC)
    - Overall Market Sentiment Score(s)
    """
    try:
        if multi:
            result = GlobalMarketsService.get_multi_timeframe_overview()
        else:
            result = GlobalMarketsService.get_global_overview(timeframe)
        
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch global market data"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sentiment")
async def get_market_sentiment(
    timeframe: str = Query("daily", description="Timeframe: 1h, 4h, daily, weekly, monthly")
):
    """
    Get only the market sentiment analysis
    
    Returns:
    - Sentiment score (0-100)
    - Label (Bullish/Bearish/Neutral)
    - Breadth (positive/negative markets count)
    - VIX status
    """
    try:
        markets_data = GlobalMarketsService.fetch_all_markets(timeframe)
        sentiment = GlobalMarketsService.calculate_sentiment(markets_data)
        return sentiment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/us")
async def get_us_markets():
    """Get US market indices only"""
    try:
        from core.global_markets import US_MARKETS
        result = GlobalMarketsService.fetch_market_group(US_MARKETS)
        return {"us_markets": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/europe")
async def get_european_markets():
    """Get European market indices only"""
    try:
        from core.global_markets import EUROPEAN_MARKETS
        result = GlobalMarketsService.fetch_market_group(EUROPEAN_MARKETS)
        return {"european_markets": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/asia")
async def get_asian_markets():
    """Get Asian market indices only"""
    try:
        from core.global_markets import ASIAN_MARKETS
        result = GlobalMarketsService.fetch_market_group(ASIAN_MARKETS)
        return {"asian_markets": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/india-adrs")
async def get_india_adrs():
    """Get India ADRs traded on US exchanges"""
    try:
        from core.global_markets import INDIA_ADRS
        result = GlobalMarketsService.fetch_market_group(INDIA_ADRS)
        return {"india_adrs": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/commodities")
async def get_commodities():
    """Get commodity futures (Gold, Crude Oil, Silver)"""
    try:
        from core.global_markets import COMMODITIES
        result = GlobalMarketsService.fetch_market_group(COMMODITIES)
        return {"commodities": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
