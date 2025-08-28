# How to Add Databases/Tables to Supabase

## Method 1: Using Supabase Dashboard (Web Interface)

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (UrjaBandhu)

### Step 2: Navigate to Table Editor
1. Click on **"Table Editor"** in the left sidebar
2. Click **"New Table"** button

### Step 3: Create a New Table
1. **Table Name**: Enter your table name (e.g., `energy_alerts`)
2. **Description**: Optional description
3. **Enable Row Level Security (RLS)**: ✅ Check this box
4. **Enable Realtime**: ✅ Check if you want real-time updates

### Step 4: Add Columns
Click **"Add Column"** for each field you need:

**Example: Creating an Energy Alerts Table**
```
Column Name     | Type        | Default Value              | Settings
--------------- | ----------- | -------------------------- | --------
id              | uuid        | uuid_generate_v4()         | Primary Key
user_id         | uuid        |                            | Foreign Key → auth.users(id)
alert_type      | text        |                            | Not Null
title           | text        |                            | Not Null
message         | text        |                            | Not Null
threshold_value | decimal     |                            | 
is_read         | boolean     | false                      | Not Null
priority        | text        | 'medium'                   | 
created_at      | timestamptz | now()                      | Not Null
```

### Step 5: Set Up Foreign Keys
1. For `user_id` column:
   - Click the **settings icon** next to the column
   - Check **"Is Foreign Key"**
   - **Reference Table**: `auth.users`
   - **Reference Column**: `id`
   - **On Delete**: Cascade

### Step 6: Add Constraints (Optional)
For columns like `priority`, you can add CHECK constraints:
```sql
priority IN ('high', 'medium', 'low')
```

### Step 7: Save the Table
Click **"Save"** to create your table.

---

## Method 2: Using SQL Editor (Recommended for Developers)

### Step 1: Access SQL Editor
1. In Supabase Dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**

### Step 2: Write Your SQL
```sql
-- Example: Creating an Energy Goals table
CREATE TABLE energy_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly')),
  target_consumption DECIMAL(10, 2) NOT NULL,
  target_cost DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE energy_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own energy goals" 
  ON energy_goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own energy goals" 
  ON energy_goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own energy goals" 
  ON energy_goals FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own energy goals" 
  ON energy_goals FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX energy_goals_user_id_idx ON energy_goals(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_energy_goals_updated_at 
  BEFORE UPDATE ON energy_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Run the Query
Click **"Run"** to execute your SQL commands.

---

## Method 3: Using Supabase CLI (For Advanced Users)

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login and Link Project
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 3: Create Migration File
```bash
supabase migration new create_energy_goals_table
```

### Step 4: Edit Migration File
This creates a file in `supabase/migrations/`. Add your SQL:
```sql
-- File: supabase/migrations/20240828120000_create_energy_goals_table.sql
CREATE TABLE energy_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- ... rest of your table structure
);
```

### Step 5: Apply Migration
```bash
supabase db push
```

---

## Method 4: Using Your Existing Schema Files

### Your Current Schema Structure
You already have a great setup in `supabase/schema.sql`. To add new tables:

### Step 1: Add to schema.sql
```sql
-- Add this to your existing schema.sql file

-- Create energy_goals table
CREATE TABLE energy_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly')),
  target_consumption DECIMAL(10, 2) NOT NULL,
  target_cost DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies (same as above)
```

### Step 2: Create Migration File
Create a new file in `supabase/migrations/`:
```sql
-- supabase/migrations/add_energy_goals_table.sql
-- (Copy the new table SQL here)
```

### Step 3: Apply via Dashboard
Copy the SQL and run it in the Supabase SQL Editor.

---

## 🎯 **Quick Examples for Common Tables**

### Example 1: User Notifications Table
```sql
CREATE TABLE user_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Example 2: Device Categories Table
```sql
CREATE TABLE device_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  average_power_range TEXT,
  tips JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Example 3: Energy Tariffs Table
```sql
CREATE TABLE energy_tariffs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_name TEXT NOT NULL,
  tariff_type TEXT NOT NULL CHECK (tariff_type IN ('fixed', 'time_of_use', 'tiered')),
  rate_per_kwh DECIMAL(10, 4) NOT NULL,
  peak_hours JSONB,
  effective_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔧 **Best Practices**

### 1. Always Enable RLS
```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

### 2. Create Proper Policies
```sql
-- Read policy
CREATE POLICY "policy_name" ON table_name FOR SELECT 
  USING (auth.uid() = user_id);

-- Write policy  
CREATE POLICY "policy_name" ON table_name FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

### 3. Add Indexes for Performance
```sql
CREATE INDEX table_user_id_idx ON table_name(user_id);
CREATE INDEX table_created_at_idx ON table_name(created_at DESC);
```

### 4. Use Proper Data Types
- **UUID**: For IDs and foreign keys
- **TIMESTAMPTZ**: For timestamps with timezone
- **DECIMAL**: For monetary values and precise numbers
- **JSONB**: For structured data
- **TEXT**: For strings (preferred over VARCHAR)

### 5. Add Triggers for Updated At
```sql
CREATE TRIGGER update_table_updated_at 
  BEFORE UPDATE ON table_name
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🚀 **Ready-to-Use SQL for Your Project**

Based on your UrjaBandhu project, here are some useful tables you might want to add:
