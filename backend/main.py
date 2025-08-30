from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime
from typing import List, Optional
import os

# Import routers (we'll create these)
# from app.routers import auth, dashboard, devices, analytics, chat

app = FastAPI(
    title="UrjaBandhu API",
    description="Smart Electricity Bill Optimization Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://urjabandhu.vercel.app", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to UrjaBandhu API",
        "description": "Smart Electricity Bill Optimization Platform",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Sample data endpoints for Phase 1
@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics - Sample data for Phase 1"""
    return {
        "current_consumption": 2.45,  # kW
        "monthly_usage": 456.78,      # kWh
        "monthly_cost": 3840.50,      # ₹
        "devices_active": 8,
        "efficiency_score": 85,
        "savings_potential": 15.2,    # %
        "last_updated": datetime.now().isoformat()
    }

@app.get("/api/dashboard/devices")
async def get_devices():
    """Get connected devices - Sample data for Phase 1"""
    return {
        "devices": [
            {
                "id": 1,
                "name": "Air Conditioner",
                "type": "cooling",
                "power_rating": 1500,  # watts
                "current_consumption": 1.45,  # kW
                "status": "active",
                "room": "Living Room",
                "efficiency": 78
            },
            {
                "id": 2,
                "name": "Refrigerator",
                "type": "appliance",
                "power_rating": 200,
                "current_consumption": 0.18,
                "status": "active",
                "room": "Kitchen",
                "efficiency": 92
            },
            {
                "id": 3,
                "name": "LED Lights",
                "type": "lighting",
                "power_rating": 120,
                "current_consumption": 0.12,
                "status": "active",
                "room": "All Rooms",
                "efficiency": 95
            },
            {
                "id": 4,
                "name": "Washing Machine",
                "type": "appliance",
                "power_rating": 800,
                "current_consumption": 0.0,
                "status": "inactive",
                "room": "Utility Room",
                "efficiency": 88
            },
            {
                "id": 5,
                "name": "Television",
                "type": "entertainment",
                "power_rating": 150,
                "current_consumption": 0.15,
                "status": "active",
                "room": "Living Room",
                "efficiency": 82
            }
        ],
        "total_devices": 5,
        "active_devices": 4
    }

@app.get("/api/analytics/consumption")
async def get_consumption_data():
    """Get consumption analytics - Sample data for Phase 1"""
    from datetime import timedelta
    
    # Generate sample hourly data for the last 24 hours
    now = datetime.now()
    data = []
    
    for i in range(24):
        timestamp = now - timedelta(hours=23-i)
        # Simulate realistic consumption patterns
        base_consumption = 1.5
        if 6 <= timestamp.hour <= 9:  # Morning peak
            consumption = base_consumption + 0.8
        elif 18 <= timestamp.hour <= 22:  # Evening peak
            consumption = base_consumption + 1.2
        elif 23 <= timestamp.hour or timestamp.hour <= 5:  # Night low
            consumption = base_consumption - 0.5
        else:  # Day moderate
            consumption = base_consumption
            
        data.append({
            "timestamp": timestamp.isoformat(),
            "consumption": round(consumption, 2),
            "cost": round(consumption * 8.5, 2)  # ₹8.5 per kWh
        })
    
    return {
        "hourly_data": data,
        "period": "24h",
        "total_consumption": sum(d["consumption"] for d in data),
        "total_cost": sum(d["cost"] for d in data)
    }

@app.get("/api/recommendations")
async def get_recommendations():
    """Get AI recommendations - Sample data for Phase 1"""
    return {
        "recommendations": [
            {
                "id": 1,
                "type": "efficiency",
                "priority": "high",
                "title": "Optimize AC Temperature",
                "description": "Set your AC to 24°C instead of 22°C to save ₹450/month",
                "potential_savings": 450,
                "category": "cooling",
                "action": "Increase AC temperature by 2°C"
            },
            {
                "id": 2,
                "type": "timing",
                "priority": "medium",
                "title": "Shift Washing Schedule",
                "description": "Run washing machine during off-peak hours (11 PM - 6 AM) to save ₹180/month",
                "potential_savings": 180,
                "category": "appliance",
                "action": "Use timer function for night operation"
            },
            {
                "id": 3,
                "type": "upgrade",
                "priority": "low",
                "title": "LED Bulb Replacement",
                "description": "Replace remaining incandescent bulbs with LEDs to save ₹120/month",
                "potential_savings": 120,
                "category": "lighting",
                "action": "Upgrade to LED lighting"
            }
        ],
        "total_potential_savings": 750,
        "generated_at": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
