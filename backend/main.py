"""
ASTA - Stock Market Technical Analysis API
FastAPI Backend Service
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from routers import sectors, stocks, markets

# Create FastAPI app
app = FastAPI(
    title="ASTA - Stock Market TA",
    description="Stock Market Technical Analysis API - Sector & Stock Relative Strength Scanner",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - Allow React frontend
# Get additional origins from environment variable
extra_origins = os.getenv("CORS_ORIGINS", "").split(",")
extra_origins = [o.strip() for o in extra_origins if o.strip()]

allowed_origins = [
    "http://localhost:3000",      # React dev server
    "http://localhost:5173",      # Vite dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://pravn27.github.io",  # GitHub Pages
    *extra_origins
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sectors.router, prefix="/api")
app.include_router(stocks.router, prefix="/api")
app.include_router(markets.router, prefix="/api")


@app.get("/")
async def root():
    """API Root - Health check and info"""
    return {
        "name": "ASTA - Stock Market TA",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
