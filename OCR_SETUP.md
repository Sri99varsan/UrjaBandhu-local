# OCR Device Detection Setup Instructions

## Overview
This guide will help you set up the OCR device detection feature, including:
- Device catalog database
- Supabase Storage for images
- Edge Function for OCR processing
- Frontend integration

## Prerequisites
- Supabase project set up and running
- Supabase CLI installed (`npm i -g supabase`)
- Project linked to your Supabase project

## Step 1: Set up Database Schema

1. **Apply the main schema** (if not already done):
   ```bash
   cd supabase
   supabase db reset
   ```

2. **Add the device catalog**:
   ```bash
   # Apply the device catalog schema
   supabase db push
   ```
   
   Or manually run the SQL from `supabase/device-catalog.sql` in your Supabase dashboard.

## Step 2: Set up Storage

1. **Create the storage bucket and policies**:
   ```bash
   # Apply storage setup
   psql -h localhost -p 54322 -d postgres -U postgres -f supabase/storage-setup.sql
   ```
   
   Or run the SQL from `supabase/storage-setup.sql` in your Supabase SQL editor.

## Step 3: Deploy Edge Function

1. **Deploy the OCR function**:
   ```bash
   supabase functions deploy ocr-device-detection
   ```

2. **Set environment variables** in your Supabase dashboard:
   - Go to Settings → Edge Functions
   - Add the following secrets:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (from Settings → API)

## Step 4: Configure Frontend Environment

1. **Update your `.env.local` file**:
   ```env
   # Add these if not already present
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   
   # Optional: For real OCR services (future enhancement)
   GOOGLE_VISION_API_KEY=your_google_vision_key
   AZURE_COMPUTER_VISION_KEY=your_azure_key
   ```

## Step 5: Test the Feature

1. **Start your Next.js development server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test the feature**:
   - Sign in to your app
   - Go to the Devices page
   - Click "Detect with Camera/Image"
   - Upload an image of an electrical device
   - Verify that OCR detection and device matching works

## Step 6: Integrating Real OCR (Optional)

The current implementation uses simulated OCR for demo purposes. To integrate real OCR:

### Option A: Google Vision API
1. Enable Google Vision API in Google Cloud Console
2. Get API key and add to environment variables
3. Update the Edge Function to use Google Vision API:
   ```typescript
   const response = await fetch(
     `https://vision.googleapis.com/v1/images:annotate?key=${Deno.env.get('GOOGLE_VISION_API_KEY')}`,
     {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         requests: [{
           image: { content: base64Image },
           features: [{ type: 'TEXT_DETECTION' }]
         }]
       })
     }
   )
   ```

### Option B: Tesseract.js (Client-side)
1. Install Tesseract.js in frontend:
   ```bash
   npm install tesseract.js
   ```
2. Process OCR on the client-side before sending to Edge Function

### Option C: Azure Computer Vision
1. Create Azure Computer Vision resource
2. Get endpoint and key
3. Update Edge Function to use Azure API

## Database Schema Overview

The device catalog includes:
- **device_catalog**: Comprehensive database of electrical devices
- **search_devices_by_keywords()**: PostgreSQL function for fuzzy device matching
- **RLS policies**: Secure access to user data
- **Storage bucket**: For device images with proper permissions

## Troubleshooting

### Common Issues:

1. **Edge Function not found**:
   - Ensure function is deployed: `supabase functions list`
   - Check function logs: `supabase functions logs ocr-device-detection`

2. **Storage upload fails**:
   - Verify storage bucket exists and has correct policies
   - Check RLS is properly configured

3. **Device detection returns no results**:
   - Check if device catalog is populated
   - Verify the search function exists in database
   - Check Edge Function logs for errors

4. **OCR confidence too low**:
   - Current implementation uses simulated OCR
   - For production, integrate with real OCR service
   - Adjust confidence thresholds as needed

### Debug Commands:

```bash
# Check Supabase status
supabase status

# View function logs
supabase functions logs ocr-device-detection --follow

# Test function locally
supabase functions serve ocr-device-detection

# Reset database
supabase db reset
```

## Production Considerations

1. **Performance**:
   - Consider caching device catalog data
   - Optimize image compression before OCR
   - Use CDN for image storage

2. **Security**:
   - Implement rate limiting for OCR requests
   - Validate image file types and sizes
   - Monitor for abuse

3. **Accuracy**:
   - Train custom OCR model for electrical devices
   - Implement user feedback system for device detection
   - Regularly update device catalog

4. **Scaling**:
   - Consider separate OCR microservice for high volume
   - Implement batch processing for multiple images
   - Use queue system for processing

## Next Steps

After setting up OCR device detection, you can continue with:
1. Time series data collection and analysis
2. Smart analytics and optimization recommendations
3. NILM (Non-Intrusive Load Monitoring) integration
4. AI chatbot with multilingual support
5. Real-time energy monitoring dashboard
