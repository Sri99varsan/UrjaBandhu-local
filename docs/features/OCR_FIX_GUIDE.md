# 🔧 OCR Edge Function - Step-by-Step Fix

## 🚨 **MAIN ISSUE IDENTIFIED**

Your OCR Edge Function is failing because the required database components are missing:

1. **`device_catalog` table** - Not created in your Supabase database
2. **`search_devices_by_keywords` function** - Not deployed

## ✅ **STEP-BY-STEP FIX**

### **Step 1: Deploy Device Catalog to Supabase**

1. **Open Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your **UrjaBandhu** project

2. **Open SQL Editor**:
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

3. **Copy Device Catalog SQL**:
   - Open the file: `c:\Users\Arunavo\Desktop\UrjaBandhu\supabase\device-catalog.sql`
   - Copy ALL the contents (Ctrl+A, Ctrl+C)

4. **Paste and Run**:
   - Paste the SQL into the Supabase SQL Editor
   - Click **"Run"** button
   - ✅ Wait for "Success!" message

### **Step 2: Verify Database Setup**

Run this query in SQL Editor to verify:

```sql
-- Check if device_catalog table exists
SELECT COUNT(*) as device_count FROM device_catalog;

-- Check if search function exists
SELECT proname FROM pg_proc WHERE proname = 'search_devices_by_keywords';

-- Test the search function
SELECT * FROM search_devices_by_keywords('Samsung LED TV') LIMIT 3;
```

### **Step 3: Deploy Updated Edge Function**

Open PowerShell in your project directory and run:

```powershell
# Navigate to project
cd "C:\Users\Arunavo\Desktop\UrjaBandhu"

# Deploy the function
supabase functions deploy ocr-device-detection

# Check if deployment was successful
supabase functions list
```

### **Step 4: Test the Function**

```powershell
# Test the function locally first
supabase functions serve ocr-device-detection

# In another terminal, test with curl:
curl -X POST "http://localhost:54321/functions/v1/ocr-device-detection" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"image_url": "https://example.com/sample-device-image.jpg"}'
```

## 🔍 **DEBUGGING COMMANDS**

If you encounter issues:

```powershell
# Check Supabase status
supabase status

# View function logs (most important for debugging)
supabase functions logs ocr-device-detection --follow

# Check environment variables
supabase secrets list
```

## 🎯 **EXPECTED RESULTS**

After completing these steps:

1. **Device Catalog**: ✅ ~80 devices with search capabilities
2. **Search Function**: ✅ Fuzzy matching with confidence scores
3. **OCR Function**: ✅ Enhanced error handling and debugging
4. **Response Format**: ✅ Standardized JSON with debug info

## 📊 **Sample Response**

```json
{
  "detected_text": "Samsung 43 inch Smart LED TV Full HD",
  "confidence": 0.85,
  "device_matches": [
    {
      "id": "uuid-here",
      "name": "LED TV 43\"",
      "category": "entertainment", 
      "power_rating": 110,
      "match_confidence": 0.88
    }
  ],
  "debug_info": {
    "image_size": 524288,
    "processing_time": 2340,
    "error_messages": []
  }
}
```

## 🚀 **QUICK START COMMAND**

Copy this complete sequence:

```powershell
# 1. Deploy device catalog (paste device-catalog.sql in Supabase SQL Editor)
# 2. Deploy function
cd "C:\Users\Arunavo\Desktop\UrjaBandhu"
supabase functions deploy ocr-device-detection

# 3. Test function
supabase functions logs ocr-device-detection --follow
```

---

**🎉 Once you complete Step 1 (database setup), your OCR function will work perfectly!**
