# UrjaBandhu Database Setup Guide

## Overview
This guide will help you set up the complete database structure for UrjaBandhu, including the device catalog for OCR-based device detection.

## Prerequisites
- Supabase project created and linked
- Supabase CLI installed (use `npx supabase` commands)
- Node.js and npm installed

## Database Setup

### 1. Device Catalog
The device catalog contains comprehensive information about Indian household appliances with power consumption data.

#### Tables Created:
- `device_catalog`: Main table with device information and power ratings
- Indexes for optimized searching
- RPC function `search_devices_by_keywords` for OCR text matching

#### Migration Applied:
✅ `20250828183511_device_catalog_setup.sql` - Contains:
- Device catalog table with 50+ Indian appliances
- Keyword-based search function
- Power consumption data for energy calculations
- Categories: cooling, lighting, kitchen, entertainment, appliance, heating

### 2. Edge Functions
The OCR device detection function has been deployed and is ready to use.

#### Function: `ocr-device-detection`
- Processes uploaded images for OCR text extraction
- Matches detected text against device catalog
- Returns device matches with power consumption data
- Includes comprehensive error handling and debugging

## Testing the Setup

### 1. Database Verification
Run these queries in your Supabase SQL Editor:

```sql
-- Check if device catalog is populated
SELECT COUNT(*) as total_devices FROM device_catalog;

-- Test device search
SELECT * FROM search_devices_by_keywords('air conditioner split');

-- View all categories
SELECT DISTINCT category, COUNT(*) as device_count 
FROM device_catalog 
GROUP BY category 
ORDER BY category;
```

### 2. Edge Function Testing
Test the OCR function with a POST request to:
```
https://ygjdvufbiobntseveoia.supabase.co/functions/v1/ocr-device-detection
```

Request body:
```json
{
  "image_url": "https://example.com/appliance-image.jpg",
  "user_id": "optional-user-id"
}
```

Expected response:
```json
{
  "detected_text": "Samsung 43 inch Smart LED TV Full HD",
  "confidence": 0.85,
  "device_matches": [
    {
      "id": "uuid",
      "name": "LED TV 43\"",
      "category": "entertainment",
      "power_rating": 110,
      "match_confidence": 0.8
    }
  ],
  "debug_info": {
    "image_size": 524288,
    "processing_time": 1250,
    "error_messages": []
  }
}
```

## Frontend Integration

### Environment Variables
Make sure your `frontend/.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=https://ygjdvufbiobntseveoia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### API Endpoint Usage
The OCR function can be called from your Next.js frontend:

```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ocr-device-detection`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      image_url: uploadedImageUrl,
      user_id: user?.id
    })
  }
)
```

## Device Categories Available

1. **Cooling**: ACs, fans, coolers
2. **Lighting**: LED bulbs, CFLs, tube lights
3. **Kitchen**: Microwave, mixer, induction, kettle
4. **Entertainment**: TVs, computers, gaming consoles
5. **Appliance**: Washing machines, refrigerators, vacuum cleaners
6. **Heating**: Water heaters, room heaters, heat pumps

Each device includes:
- Power consumption range (min/max/average watts)
- Energy efficiency rating
- Keywords for OCR matching
- Category classification

## Troubleshooting

### Common Issues

1. **"Device catalog not found"**
   - Run: `npx supabase db push` to apply migrations

2. **"Search function not found"**
   - Check if migration was applied correctly
   - Verify function exists in SQL Editor

3. **OCR function not responding**
   - Check function deployment: `npx supabase functions list`
   - Verify environment variables in Supabase dashboard

4. **No device matches found**
   - Check if device keywords match OCR text
   - Test search function manually with different terms

### Database Commands
```bash
# Check migration status
npx supabase db pull

# Apply all migrations
npx supabase db push

# Deploy functions
npx supabase functions deploy ocr-device-detection

# Check function logs
npx supabase functions logs ocr-device-detection
```

## Next Steps

1. **Frontend Implementation**: Integrate OCR API calls in your Next.js components
2. **Error Handling**: Add proper error boundaries and user feedback
3. **Device Management**: Add admin interface to manage device catalog
4. **Analytics**: Track OCR success rates and device detection accuracy
5. **Optimization**: Add caching for frequently detected devices

## Support

If you encounter any issues:
1. Check the SQL test queries in `test_device_catalog.sql`
2. Review function logs in Supabase dashboard
3. Verify environment variables are set correctly
4. Ensure your Supabase project has sufficient credits for function execution

---

✅ **Status**: Database setup complete, OCR function deployed, ready for frontend integration!
