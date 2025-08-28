-- Device Catalog Table
CREATE TABLE IF NOT EXISTS device_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  power_rating_min INTEGER, -- Minimum power consumption in watts
  power_rating_max INTEGER, -- Maximum power consumption in watts
  power_rating_avg INTEGER, -- Average power consumption in watts
  energy_star_rating INTEGER, -- Energy efficiency rating (1-5)
  keywords TEXT[], -- Array of keywords for OCR matching
  description TEXT,
  image_url TEXT,
  country VARCHAR(10) DEFAULT 'IN', -- Country code
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_device_catalog_category ON device_catalog(category);
CREATE INDEX IF NOT EXISTS idx_device_catalog_keywords ON device_catalog USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_device_catalog_brand ON device_catalog(brand);

-- Insert comprehensive device data for Indian market
INSERT INTO device_catalog (name, category, subcategory, brand, power_rating_min, power_rating_max, power_rating_avg, energy_star_rating, keywords, description) VALUES

-- Air Conditioners
('Split AC 1 Ton', 'cooling', 'air_conditioner', 'Generic', 900, 1200, 1000, 3, ARRAY['split', 'ac', 'air conditioner', '1 ton'], '1 Ton Split Air Conditioner'),
('Split AC 1.5 Ton', 'cooling', 'air_conditioner', 'Generic', 1200, 1800, 1500, 3, ARRAY['split', 'ac', 'air conditioner', '1.5 ton'], '1.5 Ton Split Air Conditioner'),
('Split AC 2 Ton', 'cooling', 'air_conditioner', 'Generic', 1800, 2500, 2200, 3, ARRAY['split', 'ac', 'air conditioner', '2 ton'], '2 Ton Split Air Conditioner'),
('Window AC 1 Ton', 'cooling', 'air_conditioner', 'Generic', 800, 1200, 1000, 2, ARRAY['window', 'ac', 'air conditioner', '1 ton'], '1 Ton Window Air Conditioner'),
('Window AC 1.5 Ton', 'cooling', 'air_conditioner', 'Generic', 1000, 1500, 1300, 2, ARRAY['window', 'ac', 'air conditioner', '1.5 ton'], '1.5 Ton Window Air Conditioner'),

-- Refrigerators
('Single Door Refrigerator', 'appliance', 'refrigerator', 'Generic', 100, 200, 150, 3, ARRAY['refrigerator', 'fridge', 'single door'], 'Single Door Refrigerator'),
('Double Door Refrigerator', 'appliance', 'refrigerator', 'Generic', 150, 300, 220, 3, ARRAY['refrigerator', 'fridge', 'double door'], 'Double Door Refrigerator'),
('Side by Side Refrigerator', 'appliance', 'refrigerator', 'Generic', 250, 400, 320, 4, ARRAY['refrigerator', 'fridge', 'side by side'], 'Side by Side Refrigerator'),
('French Door Refrigerator', 'appliance', 'refrigerator', 'Generic', 300, 500, 400, 4, ARRAY['refrigerator', 'fridge', 'french door'], 'French Door Refrigerator'),

-- Lighting
('LED Bulb 9W', 'lighting', 'bulb', 'Generic', 8, 12, 9, 5, ARRAY['led', 'bulb', '9w'], '9W LED Bulb'),
('LED Bulb 12W', 'lighting', 'bulb', 'Generic', 10, 15, 12, 5, ARRAY['led', 'bulb', '12w'], '12W LED Bulb'),
('LED Bulb 18W', 'lighting', 'bulb', 'Generic', 15, 22, 18, 5, ARRAY['led', 'bulb', '18w'], '18W LED Bulb'),
('CFL 15W', 'lighting', 'bulb', 'Generic', 13, 18, 15, 3, ARRAY['cfl', 'bulb', '15w'], '15W CFL Bulb'),
('CFL 20W', 'lighting', 'bulb', 'Generic', 18, 25, 20, 3, ARRAY['cfl', 'bulb', '20w'], '20W CFL Bulb'),
('Tube Light 18W', 'lighting', 'tube', 'Generic', 16, 22, 18, 3, ARRAY['tube', 'light', '18w'], '18W Tube Light'),
('Tube Light 36W', 'lighting', 'tube', 'Generic', 32, 40, 36, 3, ARRAY['tube', 'light', '36w'], '36W Tube Light'),

-- Kitchen Appliances
('Microwave Oven', 'kitchen', 'microwave', 'Generic', 700, 1200, 900, 3, ARRAY['microwave', 'oven'], 'Microwave Oven'),
('Convection Oven', 'kitchen', 'oven', 'Generic', 1000, 2500, 1800, 3, ARRAY['convection', 'oven'], 'Convection Oven'),
('OTG', 'kitchen', 'oven', 'Generic', 1000, 2000, 1500, 3, ARRAY['otg', 'oven', 'toaster'], 'Oven Toaster Griller'),
('Mixer Grinder', 'kitchen', 'mixer', 'Generic', 500, 750, 600, 3, ARRAY['mixer', 'grinder'], 'Mixer Grinder'),
('Juicer', 'kitchen', 'juicer', 'Generic', 300, 600, 450, 3, ARRAY['juicer'], 'Juicer'),
('Blender', 'kitchen', 'blender', 'Generic', 300, 600, 450, 3, ARRAY['blender'], 'Blender'),
('Electric Kettle', 'kitchen', 'kettle', 'Generic', 1000, 2000, 1500, 3, ARRAY['electric', 'kettle'], 'Electric Kettle'),
('Induction Cooktop', 'kitchen', 'cooktop', 'Generic', 1200, 2100, 1800, 4, ARRAY['induction', 'cooktop'], 'Induction Cooktop'),
('Rice Cooker', 'kitchen', 'cooker', 'Generic', 300, 700, 500, 3, ARRAY['rice', 'cooker'], 'Rice Cooker'),

-- Entertainment
('LED TV 32"', 'entertainment', 'television', 'Generic', 60, 120, 80, 4, ARRAY['led', 'tv', '32'], '32 inch LED TV'),
('LED TV 43"', 'entertainment', 'television', 'Generic', 80, 150, 110, 4, ARRAY['led', 'tv', '43'], '43 inch LED TV'),
('LED TV 55"', 'entertainment', 'television', 'Generic', 120, 200, 150, 4, ARRAY['led', 'tv', '55'], '55 inch LED TV'),
('Desktop Computer', 'entertainment', 'computer', 'Generic', 200, 500, 350, 3, ARRAY['desktop', 'computer', 'pc'], 'Desktop Computer'),
('Laptop', 'entertainment', 'computer', 'Generic', 45, 100, 65, 4, ARRAY['laptop'], 'Laptop Computer'),
('Gaming Console', 'entertainment', 'gaming', 'Generic', 100, 200, 150, 3, ARRAY['gaming', 'console', 'playstation', 'xbox'], 'Gaming Console'),
('Sound System', 'entertainment', 'audio', 'Generic', 50, 200, 100, 3, ARRAY['sound', 'system', 'speaker'], 'Sound System'),

-- Other Appliances
('Washing Machine Top Load', 'appliance', 'washing', 'Generic', 350, 500, 400, 3, ARRAY['washing', 'machine', 'top load'], 'Top Load Washing Machine'),
('Washing Machine Front Load', 'appliance', 'washing', 'Generic', 500, 800, 650, 4, ARRAY['washing', 'machine', 'front load'], 'Front Load Washing Machine'),
('Semi Automatic Washing Machine', 'appliance', 'washing', 'Generic', 250, 400, 300, 2, ARRAY['washing', 'machine', 'semi automatic'], 'Semi Automatic Washing Machine'),
('Water Heater 15L', 'heating', 'geyser', 'Generic', 2000, 2500, 2200, 3, ARRAY['water', 'heater', 'geyser', '15l'], '15L Water Heater'),
('Water Heater 25L', 'heating', 'geyser', 'Generic', 2500, 3000, 2700, 3, ARRAY['water', 'heater', 'geyser', '25l'], '25L Water Heater'),
('Iron', 'appliance', 'iron', 'Generic', 1000, 1800, 1400, 3, ARRAY['iron'], 'Electric Iron'),
('Hair Dryer', 'appliance', 'hairdryer', 'Generic', 800, 2000, 1200, 3, ARRAY['hair', 'dryer'], 'Hair Dryer'),
('Vacuum Cleaner', 'appliance', 'vacuum', 'Generic', 800, 1400, 1000, 3, ARRAY['vacuum', 'cleaner'], 'Vacuum Cleaner'),

-- Fans
('Ceiling Fan', 'cooling', 'fan', 'Generic', 70, 100, 85, 4, ARRAY['ceiling', 'fan'], 'Ceiling Fan'),
('Table Fan', 'cooling', 'fan', 'Generic', 50, 75, 60, 3, ARRAY['table', 'fan'], 'Table Fan'),
('Pedestal Fan', 'cooling', 'fan', 'Generic', 55, 80, 65, 3, ARRAY['pedestal', 'fan'], 'Pedestal Fan'),
('Exhaust Fan', 'cooling', 'fan', 'Generic', 30, 60, 45, 3, ARRAY['exhaust', 'fan'], 'Exhaust Fan'),

-- Water Appliances
('Water Purifier', 'appliance', 'purifier', 'Generic', 25, 60, 40, 4, ARRAY['water', 'purifier', 'ro'], 'Water Purifier'),
('Water Cooler', 'cooling', 'cooler', 'Generic', 150, 300, 200, 3, ARRAY['water', 'cooler'], 'Water Cooler'),
('Air Cooler', 'cooling', 'cooler', 'Generic', 150, 250, 180, 3, ARRAY['air', 'cooler'], 'Air Cooler'),

-- Heaters
('Room Heater', 'heating', 'heater', 'Generic', 800, 2000, 1400, 3, ARRAY['room', 'heater'], 'Room Heater'),
('Oil Filled Radiator', 'heating', 'radiator', 'Generic', 1000, 2500, 1800, 3, ARRAY['oil', 'radiator', 'heater'], 'Oil Filled Radiator'),
('Heat Pump', 'heating', 'heat_pump', 'Generic', 1500, 3000, 2200, 4, ARRAY['heat', 'pump'], 'Heat Pump')

ON CONFLICT (name) DO NOTHING;

-- Function to search devices by keywords
CREATE OR REPLACE FUNCTION search_devices_by_keywords(search_text TEXT)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  category VARCHAR(100),
  power_rating_avg INTEGER,
  confidence NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.name,
    dc.category,
    dc.power_rating_avg,
    -- Calculate confidence based on keyword matches
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM unnest(dc.keywords) AS keyword 
        WHERE LOWER(search_text) LIKE '%' || keyword || '%'
      ) THEN 0.8
      WHEN LOWER(dc.name) LIKE '%' || LOWER(search_text) || '%' THEN 0.6
      WHEN LOWER(dc.description) LIKE '%' || LOWER(search_text) || '%' THEN 0.4
      ELSE 0.2
    END AS confidence
  FROM device_catalog dc
  WHERE 
    EXISTS (
      SELECT 1 FROM unnest(dc.keywords) AS keyword 
      WHERE LOWER(search_text) LIKE '%' || keyword || '%'
    )
    OR LOWER(dc.name) LIKE '%' || LOWER(search_text) || '%'
    OR LOWER(dc.description) LIKE '%' || LOWER(search_text) || '%'
  ORDER BY confidence DESC, dc.power_rating_avg ASC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;
