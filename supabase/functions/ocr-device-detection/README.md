# OCR Device Detection Edge Function

A Supabase Edge Function that performs OCR (Optical Character Recognition) on device images and matches detected text against a device catalog.

## Features

- 🔍 OCR text extraction from device images
- 📊 Device matching against a catalog database
- ⚡ Fast response with intelligent caching
- 🛡️ Comprehensive error handling and validation
- 📈 Detailed debug information and logging

## API Usage

### Endpoint
```
POST /functions/v1/ocr-device-detection
```

### Request Body
```json
{
  "image_url": "https://example.com/device-image.jpg",
  "user_id": "optional-user-id"
}
```

### Response
```json
{
  "detected_text": "Samsung 43 inch Smart LED TV Full HD",
  "confidence": 0.85,
  "device_matches": [
    {
      "id": "device-123",
      "name": "Samsung Smart TV 43 inch",
      "category": "entertainment",
      "power_rating": 120,
      "match_confidence": 0.92
    }
  ],
  "debug_info": {
    "image_size": 524288,
    "processing_time": 1250,
    "error_messages": []
  }
}
```

## Requirements

1. **Database Setup**: Run the `device-catalog.sql` script to create the required tables and functions
2. **Environment Variables**: 
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Error Handling

The function includes comprehensive error handling for:
- Invalid image URLs or formats
- Network timeouts (15 second limit)
- Image size validation (1KB - 10MB)
- Database connection issues
- Missing catalog tables/functions

## Deployment

```bash
# Deploy to Supabase
supabase functions deploy ocr-device-detection

# Set environment variables
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
```

## Development

```bash
# Serve locally
supabase functions serve ocr-device-detection

# Test the function
curl -X POST "http://localhost:54321/functions/v1/ocr-device-detection" \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/device.jpg"}'
```

## Version

Current version: 1.0.0
