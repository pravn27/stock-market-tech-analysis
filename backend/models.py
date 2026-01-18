"""
Pydantic Models for API Request/Response
"""

from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime


# ============ Response Models ============

class ReturnsData(BaseModel):
    """Returns across timeframes"""
    one_hour: Optional[float] = None
    four_hour: Optional[float] = None
    daily: Optional[float] = None
    weekly: Optional[float] = None
    monthly: Optional[float] = None
    three_month: Optional[float] = None


class RelativeStrength(BaseModel):
    """Relative strength vs benchmark"""
    one_hour: Optional[float] = None
    four_hour: Optional[float] = None
    daily: Optional[float] = None
    weekly: Optional[float] = None
    monthly: Optional[float] = None
    three_month: Optional[float] = None


class BenchmarkData(BaseModel):
    """NIFTY 50 benchmark data"""
    name: str
    symbol: str
    price: float
    returns: ReturnsData
    timestamp: str


class SectorData(BaseModel):
    """Sector index data"""
    name: str
    symbol: str
    price: float
    returns: ReturnsData
    relative_strength: RelativeStrength
    status: str  # outperforming, neutral, underperforming
    rank: Optional[int] = None


class SectorPerformanceResponse(BaseModel):
    """Response for sector performance API"""
    benchmark: BenchmarkData
    sectors: List[SectorData]
    outperforming: List[SectorData]
    neutral: List[SectorData]
    underperforming: List[SectorData]
    timestamp: str
    timeframe: str


class StockData(BaseModel):
    """Individual stock data"""
    symbol: str
    name: str
    price: float
    returns: ReturnsData
    relative_strength: RelativeStrength
    status: str
    rank: Optional[int] = None


class SectorStocksResponse(BaseModel):
    """Response for sector stocks API"""
    sector_name: str
    benchmark: BenchmarkData
    stocks: List[StockData]
    outperforming: List[StockData]
    neutral: List[StockData]
    underperforming: List[StockData]
    total_stocks: int
    timestamp: str
    timeframe: str


class SectorListResponse(BaseModel):
    """List of available sectors"""
    sectors: List[str]
    total: int


class IndexGroupsResponse(BaseModel):
    """Available index groups"""
    groups: Dict[str, List[str]]


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    version: str
