# 🚀 Quick Start: Adding Tables to Your Supabase Database

## Method 1: Using Supabase Dashboard (Easiest)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Sign in and select your **UrjaBandhu** project

### Step 2: Use SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**

### Step 3: Copy and Paste SQL
Copy the SQL from `ADDITIONAL_TABLES.sql` and paste it into the editor, then click **"Run"**.

Or run individual tables one by one:

```sql
-- Example: Add Energy Alerts Table
CREATE TABLE energy_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('high_consumption', 'unusual_pattern', 'device_offline', 'cost_threshold')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(10, 2),
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable security
ALTER TABLE energy_alerts ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own energy alerts" ON energy_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own energy alerts" ON energy_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own energy alerts" ON energy_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own energy alerts" ON energy_alerts FOR DELETE USING (auth.uid() = user_id);

-- Add index
CREATE INDEX energy_alerts_user_id_idx ON energy_alerts(user_id);
```

---

## Method 2: Using Table Editor (Visual Interface)

### Step 1: Create New Table
1. Click **"Table Editor"** → **"New Table"**
2. Enter table name: `energy_alerts`
3. ✅ Enable Row Level Security
4. ✅ Enable Realtime (optional)

### Step 2: Add Columns
Click **"Add Column"** for each field:

| Column Name | Type | Default | Constraints |
|------------|------|---------|-------------|
| id | uuid | `uuid_generate_v4()` | Primary Key |
| user_id | uuid | | Foreign Key → auth.users(id), Not Null |
| alert_type | text | | Not Null |
| title | text | | Not Null |
| message | text | | Not Null |
| threshold_value | numeric | | |
| is_read | boolean | `false` | Not Null |
| priority | text | `'medium'` | |
| created_at | timestamptz | `now()` | Not Null |

### Step 3: Set Foreign Key
1. Click settings icon next to `user_id`
2. ✅ Check "Is Foreign Key"
3. Reference Table: `auth.users`
4. Reference Column: `id`
5. On Delete: `Cascade`

### Step 4: Add Check Constraints
For `alert_type` column:
```sql
alert_type IN ('high_consumption', 'unusual_pattern', 'device_offline', 'cost_threshold')
```

For `priority` column:
```sql
priority IN ('high', 'medium', 'low')
```

---

## 📋 Ready-to-Use Tables for UrjaBandhu

### 1. Energy Alerts
For notifications about high usage, cost thresholds, etc.

### 2. Energy Goals  
For users to set daily/monthly consumption targets.

### 3. Device Categories
Reference table for device types and efficiency tips.

### 4. User Notifications
In-app notification system.

### 5. Energy Tariffs
Store different electricity pricing plans.

### 6. Device Schedules
Timer-based device control.

### 7. Energy Reports
Automated periodic consumption reports.

### 8. User Preferences
Extended user settings and dashboard preferences.

---

## 🔧 Testing Your New Tables

### 1. Check in Table Editor
- Go to **Table Editor**
- Verify your new tables are listed
- Check that RLS is enabled (🔒 icon)

### 2. Insert Test Data
```sql
-- Test inserting data
INSERT INTO energy_alerts (user_id, alert_type, title, message) VALUES
(auth.uid(), 'high_consumption', 'Test Alert', 'This is a test alert.');
```

### 3. Query from Frontend
Update your frontend code to use the new tables:

```typescript
// Example: Fetch energy alerts
const { data: alerts } = await supabase
  .from('energy_alerts')
  .select('*')
  .order('created_at', { ascending: false });
```

---

## 🚨 Common Issues & Solutions

### Issue: "relation does not exist"
**Solution**: Make sure you ran the CREATE TABLE command in the SQL editor.

### Issue: "permission denied"
**Solution**: Check that Row Level Security policies are created correctly.

### Issue: "foreign key constraint fails"
**Solution**: Ensure the referenced table and column exist (e.g., auth.users table).

### Issue: "function uuid_generate_v4() does not exist"
**Solution**: Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📊 Your Current Tables
Based on your schema.sql, you already have:
- ✅ profiles
- ✅ devices  
- ✅ consumption_data
- ✅ recommendations
- ✅ device_images
- ✅ chat_sessions
- ✅ chat_messages

## 🎯 Recommended Next Tables
1. **energy_alerts** - High priority alerts
2. **energy_goals** - User targets
3. **user_notifications** - In-app notifications
4. **device_categories** - Reference data

---

## 🎉 That's it!
Your new tables are ready to use in your UrjaBandhu application!
