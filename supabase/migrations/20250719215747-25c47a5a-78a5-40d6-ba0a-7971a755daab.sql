
-- First, let's restructure the Investor Network table to reduce index size
-- We'll keep only essential fields in the main table and move large text fields to related tables

-- Create the restructured main investor table
CREATE TABLE IF NOT EXISTS public.investors_new (
    id BIGSERIAL PRIMARY KEY,
    company_name TEXT,
    main_poc TEXT,
    tier BIGINT,
    weekly_cap BIGINT,
    coverage_type public.coverage_type,
    direct_purchase BOOLEAN DEFAULT false,
    hs_company_url TEXT,
    offer_types TEXT,
    
    -- Enhanced matching fields
    email TEXT,
    phone TEXT,
    investment_strategies public.investment_strategy[],
    property_types public.property_type[],
    min_price DECIMAL(12,2),
    max_price DECIMAL(12,2),
    min_sqft INTEGER,
    max_sqft INTEGER,
    min_bedrooms INTEGER,
    max_bedrooms INTEGER,
    min_bathrooms DECIMAL(3,1),
    max_bathrooms DECIMAL(3,1),
    max_year_built INTEGER,
    min_year_built INTEGER,
    max_rehab_budget DECIMAL(12,2),
    cash_available DECIMAL(12,2),
    financing_available BOOLEAN DEFAULT false,
    proof_of_funds BOOLEAN DEFAULT false,
    close_timeline_days INTEGER,
    commission_percentage DECIMAL(5,2),
    
    -- Status and tracking
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contacted TIMESTAMP WITH TIME ZONE,
    deals_completed INTEGER DEFAULT 0,
    average_close_days INTEGER,
    preferred_contact_method public.communication_type
);

-- Create investor markets table for primary and secondary markets
CREATE TABLE IF NOT EXISTS public.investor_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id BIGINT REFERENCES public.investors_new(id) ON DELETE CASCADE,
    market_name TEXT NOT NULL,
    market_type TEXT CHECK (market_type IN ('primary', 'secondary')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investor buy box details table for large text descriptions
CREATE TABLE IF NOT EXISTS public.investor_buy_box_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id BIGINT REFERENCES public.investors_new(id) ON DELETE CASCADE,
    buy_box_description TEXT,
    investor_tags TEXT,
    reason_for_freeze TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investor notes table for additional large text fields
CREATE TABLE IF NOT EXISTS public.investor_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id BIGINT REFERENCES public.investors_new(id) ON DELETE CASCADE,
    note_type TEXT, -- 'general', 'buy_box', 'contact', etc.
    note_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investor_markets_investor_id ON public.investor_markets(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_markets_type ON public.investor_markets(market_type);
CREATE INDEX IF NOT EXISTS idx_investor_buy_box_investor_id ON public.investor_buy_box_details(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_notes_investor_id ON public.investor_notes(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_notes_type ON public.investor_notes(note_type);

-- Enable RLS on new tables
ALTER TABLE public.investors_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_buy_box_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the new tables
CREATE POLICY "Authenticated users can view investors_new" ON public.investors_new
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert investors_new" ON public.investors_new
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update investors_new" ON public.investors_new
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete investors_new" ON public.investors_new
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view investor_markets" ON public.investor_markets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert investor_markets" ON public.investor_markets
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update investor_markets" ON public.investor_markets
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete investor_markets" ON public.investor_markets
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view investor_buy_box_details" ON public.investor_buy_box_details
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert investor_buy_box_details" ON public.investor_buy_box_details
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update investor_buy_box_details" ON public.investor_buy_box_details
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete investor_buy_box_details" ON public.investor_buy_box_details
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view investor_notes" ON public.investor_notes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert investor_notes" ON public.investor_notes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update investor_notes" ON public.investor_notes
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete investor_notes" ON public.investor_notes
    FOR DELETE TO authenticated USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_investors_new_updated_at
    BEFORE UPDATE ON public.investors_new
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_investor_buy_box_details_updated_at
    BEFORE UPDATE ON public.investor_buy_box_details
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_investor_notes_updated_at
    BEFORE UPDATE ON public.investor_notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update the calculate_match_score function to work with the new structure
CREATE OR REPLACE FUNCTION public.calculate_match_score_new(
    p_property_id UUID,
    p_investor_id BIGINT
)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    prop RECORD;
    inv RECORD;
    location_matched BOOLEAN := false;
    primary_markets TEXT[];
    secondary_markets TEXT[];
BEGIN
    -- Get property details
    SELECT * INTO prop FROM public.properties WHERE id = p_property_id;
    
    -- Get investor details from new structure
    SELECT * INTO inv FROM public.investors_new WHERE id = p_investor_id;
    
    -- Get investor markets
    SELECT array_agg(market_name) INTO primary_markets 
    FROM public.investor_markets 
    WHERE investor_id = p_investor_id AND market_type = 'primary';
    
    SELECT array_agg(market_name) INTO secondary_markets 
    FROM public.investor_markets 
    WHERE investor_id = p_investor_id AND market_type = 'secondary';
    
    -- PHASE 1: Location-First Filtering (HARD CONSTRAINT)
    -- Check primary markets
    IF primary_markets IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM unnest(primary_markets) AS market 
            WHERE market ILIKE '%' || prop.city || '%' OR 
                  market ILIKE '%' || prop.state || '%' OR
                  market ILIKE '%' || prop.county || '%'
        ) THEN
            score := score + 40; -- Primary market: full points
            location_matched := true;
        END IF;
    END IF;
    
    -- Check secondary markets if no primary match
    IF NOT location_matched AND secondary_markets IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM unnest(secondary_markets) AS market 
            WHERE market ILIKE '%' || prop.city || '%' OR 
                  market ILIKE '%' || prop.state || '%' OR
                  market ILIKE '%' || prop.county || '%'
        ) THEN
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
        -- Check for compatible types
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
    IF prop.list_price IS NOT NULL AND inv.min_price IS NOT NULL AND inv.max_price IS NOT NULL THEN
        IF prop.list_price >= inv.min_price AND prop.list_price <= inv.max_price THEN
            score := score + 5; -- Within budget
        ELSIF prop.list_price <= (inv.max_price * 1.2) THEN
            score := score + 3; -- Slightly over budget but potentially negotiable
        END IF;
    END IF;
    
    RETURN LEAST(score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql;

-- Update the matches table to reference the new investor structure
-- First, update the foreign key constraint in matches table
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_investor_id_fkey;
ALTER TABLE public.matches ADD CONSTRAINT matches_investor_id_fkey 
    FOREIGN KEY (investor_id) REFERENCES public.investors_new(id) ON DELETE CASCADE;

-- Update the auto_calculate_match_score trigger function for new structure
CREATE OR REPLACE FUNCTION public.auto_calculate_match_score_new()
RETURNS TRIGGER AS $$
DECLARE
    primary_markets TEXT[];
    secondary_markets TEXT[];
BEGIN
    NEW.match_score := public.calculate_match_score_new(NEW.property_id, NEW.investor_id);
    
    -- Get investor markets for match criteria
    SELECT array_agg(market_name) INTO primary_markets 
    FROM public.investor_markets 
    WHERE investor_id = NEW.investor_id AND market_type = 'primary';
    
    SELECT array_agg(market_name) INTO secondary_markets 
    FROM public.investor_markets 
    WHERE investor_id = NEW.investor_id AND market_type = 'secondary';
    
    -- Set enhanced match criteria flags
    SELECT 
        -- Location match (primary check)
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM unnest(primary_markets) AS market 
                WHERE market ILIKE '%' || p.city || '%' OR 
                      market ILIKE '%' || p.state || '%' OR
                      market ILIKE '%' || p.county || '%'
            ) THEN true
            WHEN EXISTS (
                SELECT 1 FROM unnest(secondary_markets) AS market 
                WHERE market ILIKE '%' || p.city || '%' OR 
                      market ILIKE '%' || p.state || '%' OR
                      market ILIKE '%' || p.county || '%'
            ) THEN true
            ELSE false
        END,
        -- Property type match
        CASE 
            WHEN i.property_types IS NOT NULL AND p.property_type = ANY(i.property_types) THEN true 
            ELSE false 
        END,
        -- Price match (flexible - within 20% of max budget)
        CASE 
            WHEN p.list_price IS NOT NULL AND i.max_price IS NOT NULL AND p.list_price <= (i.max_price * 1.2) THEN true 
            ELSE false 
        END,
        -- Strategy match
        CASE 
            WHEN i.investment_strategies IS NOT NULL THEN true 
            ELSE false 
        END
    INTO 
        NEW.location_match,
        NEW.property_type_match,
        NEW.price_match,
        NEW.strategy_match
    FROM public.properties p, public.investors_new i
    WHERE p.id = NEW.property_id AND i.id = NEW.investor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace the old trigger with the new one
DROP TRIGGER IF EXISTS calculate_match_score_trigger ON public.matches;
CREATE TRIGGER calculate_match_score_trigger_new
    BEFORE INSERT OR UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.auto_calculate_match_score_new();
