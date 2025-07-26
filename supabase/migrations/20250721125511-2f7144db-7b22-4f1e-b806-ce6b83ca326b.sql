
-- First, let's check if there are any duplicate IDs and fix the primary key constraint
-- Add primary key to the Investor Network table
ALTER TABLE "Investor Network" ADD PRIMARY KEY ("ID");

-- Now we can safely create the properties and matches tables
-- Create properties table for storing property leads
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  city text,
  state text,
  zip_code text,
  county text,
  zillow_url text,
  zillow_zpid text,
  
  -- Property details
  property_type text, -- 'single_family', 'duplex', 'triplex', 'fourplex', 'multifamily', 'condo', 'townhouse'
  bedrooms integer,
  bathrooms numeric,
  square_feet integer,
  year_built integer,
  lot_size numeric,
  
  -- Pricing and valuation
  asking_price numeric,
  zillow_estimate numeric,
  list_price numeric,
  
  -- Property condition
  property_condition text, -- 'turn_key', 'light_rehab', 'heavy_rehab', 'tear_down'
  condition_notes text,
  
  -- Seller information
  seller_name text,
  seller_motivation text,
  selling_reason text,
  timeline text, -- 'asap', 'fast', 'standard', 'flexible'
  
  -- Lead tracking
  lead_source text DEFAULT 'hubspot',
  lead_status text DEFAULT 'new', -- 'new', 'qualifying', 'matched', 'under_contract', 'closed', 'dead'
  
  -- Notes and additional info
  notes text,
  additional_notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matches table for tracking property-investor matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  investor_id bigint REFERENCES "Investor Network"("ID") ON DELETE CASCADE,
  
  -- Match scoring
  match_score integer DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  
  -- Match criteria flags
  location_match boolean DEFAULT false,
  property_type_match boolean DEFAULT false,
  price_match boolean DEFAULT false,
  condition_match boolean DEFAULT false,
  timeline_match boolean DEFAULT false,
  strategy_match boolean DEFAULT false,
  
  -- Match status and communication
  match_status text DEFAULT 'pending', -- 'pending', 'contacted', 'interested', 'not_interested', 'offer_made', 'accepted', 'rejected'
  contacted_at timestamptz,
  response_at timestamptz,
  
  -- Notes
  notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(property_id, investor_id)
);

-- Add RLS policies for properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on properties" ON properties
  FOR ALL USING (true);

-- Add RLS policies for matches table  
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on matches" ON matches
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_asking_price ON properties(asking_price);
CREATE INDEX IF NOT EXISTS idx_matches_property_id ON matches(property_id);
CREATE INDEX IF NOT EXISTS idx_matches_investor_id ON matches(investor_id);
CREATE INDEX IF NOT EXISTS idx_matches_match_score ON matches(match_score DESC);
