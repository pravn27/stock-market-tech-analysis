"""
Global Markets API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
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
async def get_commodities(
    timeframe: str = Query("daily", description="Timeframe: 1h, 4h, daily, weekly, monthly, 3m"),
    multi: bool = Query(False, description="Return all timeframes")
):
    """
    Get commodity futures with price data grouped by category
    
    Includes:
    - Precious Metals (Gold, Silver, Platinum, Copper) - COMEX/NYMEX
    - Energy (Crude Oil WTI, Brent, Natural Gas, Gasoline) - NYMEX/ICE
    - Agricultural (Corn, Wheat, Soybean, Coffee, Sugar, Cocoa, Cotton) - CBOT/ICE
    - MCX Commodities (Indian Exchange) - Gold, Silver, Crude, Natural Gas, Copper, Zinc, Lead, Aluminium
    
    Parameters:
    - **timeframe**: Single timeframe to fetch
    - **multi**: If true, returns data for all timeframes
    """
    try:
        from core.global_markets import PRECIOUS_METALS, ENERGY_COMMODITIES, AGRICULTURAL_COMMODITIES, MCX_COMMODITIES
        
        commodity_groups = {
            'precious_metals': PRECIOUS_METALS,
            'energy_commodities': ENERGY_COMMODITIES,
            'agricultural_commodities': AGRICULTURAL_COMMODITIES,
            'mcx_commodities': MCX_COMMODITIES
        }
        
        if multi:
            # Multi-timeframe logic
            timeframes = ['1h', '4h', 'daily', 'weekly', 'monthly', '3m']
            all_timeframe_data = {}
            sentiments = {}
            
            # Fetch data for each timeframe and group
            for tf in timeframes:
                tf_data = {}
                all_commodities = []
                
                for group_key, group_list in commodity_groups.items():
                    group_result = GlobalMarketsService.fetch_market_group(group_list, tf)
                    tf_data[group_key] = group_result
                    all_commodities.extend(group_result)
                
                all_timeframe_data[tf] = tf_data
                
                # Calculate overall sentiment for this timeframe
                valid_results = [c for c in all_commodities if c.get('change_pct') is not None and not c.get('error', False)]
                total = len(valid_results)
                bullish = sum(1 for c in valid_results if c.get('change_pct', 0) > 0)
                bearish = sum(1 for c in valid_results if c.get('change_pct', 0) < 0)
                neutral = total - bullish - bearish
                bullish_pct = round((bullish / total * 100) if total > 0 else 0, 1)
                
                sentiments[tf] = {
                    'breadth': {
                        'positive': bullish,
                        'negative': bearish,
                        'neutral': neutral,
                        'total': total,
                        'percentage': bullish_pct
                    }
                }
            
            # Restructure for multi-timeframe display by group
            result = {}
            for group_key in commodity_groups.keys():
                commodities_list = []
                base_commodities = all_timeframe_data['daily'][group_key]
                
                for commodity in base_commodities:
                    symbol = commodity['symbol']
                    commodity_data = {
                        'symbol': symbol,
                        'name': commodity['name'],
                        'short': commodity['short'],
                        'price': commodity.get('price'),
                        'timeframes': {}
                    }
                    
                    for tf in timeframes:
                        tf_commodity = next((c for c in all_timeframe_data[tf][group_key] if c['symbol'] == symbol), None)
                        if tf_commodity:
                            commodity_data['timeframes'][tf] = {
                                'change': tf_commodity.get('change'),
                                'change_pct': tf_commodity.get('change_pct'),
                                'error': tf_commodity.get('error', False)
                            }
                    
                    commodities_list.append(commodity_data)
                
                result[group_key] = commodities_list
            
            return {
                **result,
                'sentiments': sentiments,
                'timestamp': datetime.now().isoformat(),
                'mode': 'multi_timeframe'
            }
        else:
            # Single timeframe logic
            result = {}
            all_commodities = []
            
            for group_key, group_list in commodity_groups.items():
                group_result = GlobalMarketsService.fetch_market_group(group_list, timeframe)
                result[group_key] = group_result
                all_commodities.extend(group_result)
            
            # Calculate overall sentiment
            valid_results = [c for c in all_commodities if c.get('change_pct') is not None and not c.get('error', False)]
            total = len(valid_results)
            bullish = sum(1 for c in valid_results if c.get('change_pct', 0) > 0)
            bearish = sum(1 for c in valid_results if c.get('change_pct', 0) < 0)
            neutral = total - bullish - bearish
            bullish_pct = round((bullish / total * 100) if total > 0 else 0, 1)
            
            sentiment = {
                'breadth': {
                    'positive': bullish,
                    'negative': bearish,
                    'neutral': neutral,
                    'total': total,
                    'percentage': bullish_pct
                }
            }
            
            return {
                **result,
                'sentiment': sentiment,
                'timeframe': timeframe,
                'timestamp': datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
