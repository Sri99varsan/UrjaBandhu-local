# API Documentation

## UrjaBandhu Backend API

### Base URL
```
Development: http://localhost:8000
Production: https://api.urjabandhu.com
```

### Authentication
The API uses JWT-based authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check
```http
GET /health
```
Returns the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-08-28T10:30:00Z",
  "version": "1.0.0"
}
```

### Dashboard Endpoints

#### Get Dashboard Statistics
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "current_consumption": 2.45,
  "monthly_usage": 456.78,
  "monthly_cost": 3840.50,
  "devices_active": 8,
  "efficiency_score": 85,
  "savings_potential": 15.2,
  "last_updated": "2024-08-28T10:30:00Z"
}
```

#### Get Connected Devices
```http
GET /api/dashboard/devices
```

**Response:**
```json
{
  "devices": [
    {
      "id": 1,
      "name": "Air Conditioner",
      "type": "cooling",
      "power_rating": 1500,
      "current_consumption": 1.45,
      "status": "active",
      "room": "Living Room",
      "efficiency": 78
    }
  ],
  "total_devices": 5,
  "active_devices": 4
}
```

### Analytics Endpoints

#### Get Consumption Data
```http
GET /api/analytics/consumption
```

**Query Parameters:**
- `period` (optional): time period for data (`24h`, `7d`, `30d`)
- `granularity` (optional): data granularity (`hourly`, `daily`, `weekly`)

**Response:**
```json
{
  "hourly_data": [
    {
      "timestamp": "2024-08-28T10:00:00Z",
      "consumption": 2.45,
      "cost": 20.83
    }
  ],
  "period": "24h",
  "total_consumption": 58.8,
  "total_cost": 499.8
}
```

### Recommendations Endpoints

#### Get AI Recommendations
```http
GET /api/recommendations
```

**Response:**
```json
{
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
    }
  ],
  "total_potential_savings": 750,
  "generated_at": "2024-08-28T10:30:00Z"
}
```

## Future Endpoints (Coming Soon)

### OCR Endpoints
- `POST /api/ocr/detect-device` - Upload device image for detection
- `GET /api/ocr/device-catalog` - Get device power consumption database

### NILM Endpoints
- `POST /api/nilm/analyze` - Analyze electricity data for load disaggregation
- `GET /api/nilm/appliances` - Get individual appliance consumption

### Chat Endpoints
- `POST /api/chat/message` - Send message to AI chatbot
- `GET /api/chat/history` - Get chat conversation history
- `POST /api/chat/voice` - Voice input for chatbot

### Time Series Endpoints
- `POST /api/timeseries/predict` - Get consumption predictions
- `GET /api/timeseries/anomalies` - Detect consumption anomalies
- `POST /api/timeseries/train` - Train custom prediction models

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request parameters are invalid",
    "details": "Field 'period' must be one of: 24h, 7d, 30d"
  },
  "timestamp": "2024-08-28T10:30:00Z"
}
```

### Error Codes
- `INVALID_REQUEST` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

API requests are limited to:
- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```
