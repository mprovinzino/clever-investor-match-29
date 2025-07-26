
-- Add structured buy box criteria columns to the Investor Network table
ALTER TABLE "Investor Network" 
ADD COLUMN property_types text[],
ADD COLUMN min_price numeric,
ADD COLUMN max_price numeric,
ADD COLUMN property_conditions text[],
ADD COLUMN min_sqft numeric,
ADD COLUMN max_sqft numeric,
ADD COLUMN min_year_built integer,
ADD COLUMN max_year_built integer,
ADD COLUMN timeline_preferences text[],
ADD COLUMN investment_strategies text[];

-- Create properties table for storing property leads
CREATE TABLE properties (
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
CREATE TABLE matches (
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

-- Create function to calculate match score with structured criteria
CREATE OR REPLACE FUNCTION calculate_match_score(p_property_id uuid, p_investor_id bigint)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    score INTEGER := 0;
    prop RECORD;
    inv RECORD;
    location_matched BOOLEAN := false;
BEGIN
    -- Get property details
    SELECT * INTO prop FROM properties WHERE id = p_property_id;
    
    -- Get investor details
    SELECT * INTO inv FROM "Investor Network" WHERE "ID" = p_investor_id;
    
    -- PHASE 1: Location-First Filtering (HARD CONSTRAINT)
    -- If no location match, return 0 (eliminate from consideration)
    IF inv."Primary Markets" IS NOT NULL THEN
        IF inv."Primary Markets" ILIKE '%' || prop.city || '%' OR 
           inv."Primary Markets" ILIKE '%' || prop.state || '%' OR
           inv."Primary Markets" ILIKE '%' || prop.county || '%' THEN
            score := score + 40; -- Primary market: full points
            location_matched := true;
        END IF;
    END IF;
    
    -- Check secondary markets if no primary match
    IF NOT location_matched AND inv."Secondary Markets" IS NOT NULL THEN
        IF inv."Secondary Markets" ILIKE '%' || prop.city || '%' OR 
           inv."Secondary Markets" ILIKE '%' || prop.state || '%' OR
           inv."Secondary Markets" ILIKE '%' || prop.county || '%' THEN
            score := score + 30; -- Secondary market: reduced points
            location_matched := true;
        END IF;
    END IF;
    
    -- If no location match at all, eliminate (return 0)
    IF NOT location_matched THEN
        RETURN 0;
    END IF;
    
    -- PHASE 2: Additional Scoring (only if location matched)
    
    -- Property type matching (25 points max)
    IF inv.property_types IS NOT NULL AND prop.property_type = ANY(inv.property_types) THEN
        score := score + 25;
    ELSIF inv.property_types IS NOT NULL THEN
        -- Check for compatible types (e.g., SFH compatible with small multifamily for some investors)
        IF (prop.property_type = 'single_family' AND 'duplex' = ANY(inv.property_types)) OR
           (prop.property_type = 'duplex' AND 'single_family' = ANY(inv.property_types)) THEN
            score := score + 15; -- Compatible type: partial points
        END IF;
    END IF;
    
    -- Year built matching (20 points max)
    IF prop.year_built IS NOT NULL THEN
        IF inv.min_year_built IS NOT NULL AND inv.max_year_built IS NOT NULL THEN
            IF prop.year_built >= inv.min_year_built AND prop.year_built <= inv.max_year_built THEN
                score := score + 20; -- Within preferred range
            ELSIF prop.year_built >= (inv.min_year_built - 5) AND prop.year_built <= (inv.max_year_built + 5) THEN
                score := score + 10; -- Close to range (±5 years)
            END IF;
        ELSIF inv.min_year_built IS NOT NULL AND prop.year_built >= inv.min_year_built THEN
            score := score + 20; -- Meets minimum requirement
        END IF;
    END IF;
    
    -- Square footage matching (10 points max)
    IF prop.square_feet IS NOT NULL AND inv.min_sqft IS NOT NULL AND inv.max_sqft IS NOT NULL THEN
        IF prop.square_feet >= inv.min_sqft AND prop.square_feet <= inv.max_sqft THEN
            score := score + 10; -- Within range
        ELSIF prop.square_feet >= (inv.min_sqft * 0.9) AND prop.square_feet <= (inv.max_sqft * 1.1) THEN
            score := score + 5; -- Close to range (±10%)
        END IF;
    END IF;
    
    -- Price matching (5 points max - lowest priority, most flexible)
    IF prop.asking_price IS NOT NULL AND inv.min_price IS NOT NULL AND inv.max_price IS NOT NULL THEN
        IF prop.asking_price >= inv.min_price AND prop.asking_price <= inv.max_price THEN
            score := score + 5; -- Within budget
        ELSIF prop.asking_price <= (inv.max_price * 1.2) THEN
            score := score + 3; -- Slightly over budget but potentially negotiable
        END IF;
    END IF;
    
    RETURN LEAST(score, 100); -- Cap at 100
END;
$$;

-- Create trigger to auto-calculate match scores
CREATE OR REPLACE FUNCTION auto_calculate_match_score()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.match_score := calculate_match_score(NEW.property_id, NEW.investor_id);
    
    -- Set enhanced match criteria flags
    SELECT 
        -- Location match (primary check)
        CASE 
            WHEN i."Primary Markets" ILIKE '%' || p.city || '%' OR 
                 i."Primary Markets" ILIKE '%' || p.state || '%' OR
                 i."Primary Markets" ILIKE '%' || p.county || '%' THEN true
            WHEN i."Secondary Markets" ILIKE '%' || p.city || '%' OR 
                 i."Secondary Markets" ILIKE '%' || p.state || '%' OR
                 i."Secondary Markets" ILIKE '%' || p.county || '%' THEN true
            ELSE false
        END,
        -- Property type match
        CASE 
            WHEN i.property_types IS NOT NULL AND p.property_type = ANY(i.property_types) THEN true 
            ELSE false 
        END,
        -- Price match (flexible - within 20% of max budget)
        CASE 
            WHEN p.asking_price IS NOT NULL AND i.max_price IS NOT NULL AND p.asking_price <= (i.max_price * 1.2) THEN true 
            ELSE false 
        END,
        -- Strategy match (placeholder - can be enhanced based on property condition vs investor strategy)
        CASE 
            WHEN i.investment_strategies IS NOT NULL THEN true 
            ELSE false 
        END
    INTO 
        NEW.location_match,
        NEW.property_type_match,
        NEW.price_match,
        NEW.strategy_match
    FROM properties p, "Investor Network" i
    WHERE p.id = NEW.property_id AND i."ID" = NEW.investor_id;
    
    RETURN NEW;
END;
$$;

-- Create trigger for auto-calculating match scores
CREATE TRIGGER calculate_match_score_trigger
    BEFORE INSERT OR UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_match_score();

-- Create indexes for better performance
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_asking_price ON properties(asking_price);
CREATE INDEX idx_matches_property_id ON matches(property_id);
CREATE INDEX idx_matches_investor_id ON matches(investor_id);
CREATE INDEX idx_matches_match_score ON matches(match_score DESC);
