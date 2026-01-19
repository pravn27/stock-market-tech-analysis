#!/usr/bin/env python3
"""
Stock Market TA Backend - Run the FastAPI server

Usage:
    cd backend
    uv run python run.py
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Enable auto-reload during development
    )
