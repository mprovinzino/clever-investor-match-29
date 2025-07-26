
-- Create custom types/enums for consistent data validation
CREATE TYPE public.property_type AS ENUM (
    'single_family',
    'duplex',
    'triplex',
    'fourplex',
    'small_multifamily',
    'large_multifamily',
    'commercial',
    'retail',
    'office',
    'industrial',
    'land',
    'mobile_home',
    'condo',
    'townhouse'
);

CREATE TYPE public.investment_strategy AS ENUM (
    'fix_flip',
    'buy_hold',
    'wholesale',
    'development',
    'commercial',
    'land_banking',
    'subject_to',
    'owner_finance',
    'lease_option'
);

CREATE TYPE public.property_status AS ENUM (
    'active',
    'under_contract',
    'sold',
    'withdrawn',
    'expired',
    'pending'
);

CREATE TYPE public.match_status AS ENUM (
    'pending',
    'contacted',
    'interested',
    'not_interested',
    'under_contract',
    'closed',
    'rejected'
);

CREATE TYPE public.communication_type AS ENUM (
    'email',
    'phone',
    'text',
    'meeting',
    'site_visit',
    'proposal',
    'contract',
    'closing'
);

CREATE TYPE public.coverage_type AS ENUM (
    'local',
    'state',
    'multi_state',
    'national'
);

-- Enhance the existing Investor Network table with additional fields
ALTER TABLE public."Investor Network" 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS investment_strategies public.investment_strategy[],
ADD COLUMN IF NOT EXISTS property_types public.property_type[],
ADD COLUMN IF NOT EXISTS min_price DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS max_price DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS min_sqft INTEGER,
ADD COLUMN IF NOT EXISTS max_sqft INTEGER,
ADD COLUMN IF NOT EXISTS min_bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS max_bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS min_bathrooms DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS max_bathrooms DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS max_year_built INTEGER,
ADD COLUMN IF NOT EXISTS min_year_built INTEGER,
ADD COLUMN IF NOT EXISTS max_rehab_budget DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS cash_available DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS financing_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS proof_of_funds BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS close_timeline_days INTEGER,
ADD COLUMN IF NOT EXISTS commission_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deals_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_close_days INTEGER,
ADD COLUMN IF NOT EXISTS preferred_contact_method public.communication_type;

-- Create Properties table for seller leads
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    county TEXT,
    property_type public.property_type NOT NULL,
    list_price DECIMAL(12,2),
    estimated_value DECIMAL(12,2),
    estimated_repairs DECIMAL(12,2),
    square_feet INTEGER,
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    year_built INTEGER,
    lot_size DECIMAL(8,2),
    garage_spaces INTEGER,
    
    -- Seller information
    seller_name TEXT,
    seller_phone TEXT,
    seller_email TEXT,
    seller_motivation TEXT,
    days_on_market INTEGER,
    
    -- Property condition and details
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
    renovation_needed BOOLEAN DEFAULT false,
    occupied BOOLEAN DEFAULT false,
    tenant_lease_end DATE,
    monthly_rent DECIMAL(10,2),
    
    -- Financial details
    current_mortgage_balance DECIMAL(12,2),
    monthly_payment DECIMAL(10,2),
    property_taxes_annual DECIMAL(10,2),
    insurance_annual DECIMAL(10,2),
    hoa_fees_monthly DECIMAL(10,2),
    
    -- Marketing and photos
    photos TEXT[], -- Array of photo URLs
    description TEXT,
    key_features TEXT[],
    
    -- Lead source and tracking
    lead_source TEXT,
    lead_quality_score INTEGER CHECK (lead_quality_score >= 1 AND lead_quality_score <= 5),
    
    -- Status and timestamps
    status public.property_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional fields
    notes TEXT,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0
);

-- Create Matches table to track property-investor pairs
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    investor_id BIGINT REFERENCES public."Investor Network"("ID") ON DELETE CASCADE,
    
    -- Match scoring and criteria
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    price_match BOOLEAN DEFAULT false,
    location_match BOOLEAN DEFAULT false,
    property_type_match BOOLEAN DEFAULT false,
    strategy_match BOOLEAN DEFAULT false,
    
    -- Communication and status
    status public.match_status DEFAULT 'pending',
    contacted_at TIMESTAMP WITH TIME ZONE,
    response_at TIMESTAMP WITH TIME ZONE,
    
    -- Deal tracking
    offered_price DECIMAL(12,2),
    negotiated_price DECIMAL(12,2),
    contract_date DATE,
    closing_date DATE,
    commission_earned DECIMAL(10,2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Notes and tracking
    notes TEXT,
    follow_up_date DATE,
    
    UNIQUE(property_id, investor_id)
);

-- Create Communications table for CRM functionality
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    investor_id BIGINT REFERENCES public."Investor Network"("ID"),
    property_id UUID REFERENCES public.properties(id),
    
    -- Communication details
    communication_type public.communication_type NOT NULL,
    subject TEXT,
    message TEXT,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    
    -- Contact information
    contact_method TEXT, -- email address, phone number, etc.
    
    -- Status and scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    
    -- Attachments and references
    attachments TEXT[], -- Array of file URLs
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Notes
    notes TEXT
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_investors_active ON public."Investor Network"(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_investors_markets ON public."Investor Network" USING GIN("Primary Markets", "Secondary Markets");
CREATE INDEX IF NOT EXISTS idx_investors_price_range ON public."Investor Network"(min_price, max_price);
CREATE INDEX IF NOT EXISTS idx_investors_property_types ON public."Investor Network" USING GIN(property_types);
CREATE INDEX IF NOT EXISTS idx_investors_investment_strategies ON public."Investor Network" USING GIN(investment_strategies);

CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(city, state);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(list_price);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_created ON public.properties(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_matches_property ON public.matches(property_id);
CREATE INDEX IF NOT EXISTS idx_matches_investor ON public.matches(investor_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_score ON public.matches(match_score DESC);

CREATE INDEX IF NOT EXISTS idx_communications_match ON public.communications(match_id);
CREATE INDEX IF NOT EXISTS idx_communications_investor ON public.communications(investor_id);
CREATE INDEX IF NOT EXISTS idx_communications_property ON public.communications(property_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON public.communications(communication_type);
CREATE INDEX IF NOT EXISTS idx_communications_follow_up ON public.communications(follow_up_date) WHERE follow_up_required = true;

-- Enable Row Level Security
ALTER TABLE public."Investor Network" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Authenticated users can view investors" ON public."Investor Network"
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert investors" ON public."Investor Network"
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update investors" ON public."Investor Network"
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete investors" ON public."Investor Network"
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view properties" ON public.properties
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert properties" ON public.properties
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update properties" ON public.properties
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete properties" ON public.properties
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view matches" ON public.matches
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert matches" ON public.matches
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update matches" ON public.matches
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete matches" ON public.matches
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view communications" ON public.communications
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert communications" ON public.communications
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update communications" ON public.communications
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete communications" ON public.communications
    FOR DELETE TO authenticated USING (true);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_investors_updated_at
    BEFORE UPDATE ON public."Investor Network"
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_communications_updated_at
    BEFORE UPDATE ON public.communications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create function for automatic match scoring
CREATE OR REPLACE FUNCTION public.calculate_match_score(
    p_property_id UUID,
    p_investor_id BIGINT
)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    prop RECORD;
    inv RECORD;
BEGIN
    -- Get property details
    SELECT * INTO prop FROM public.properties WHERE id = p_property_id;
    
    -- Get investor details
    SELECT * INTO inv FROM public."Investor Network" WHERE "ID" = p_investor_id;
    
    -- Price matching (30 points max)
    IF prop.list_price IS NOT NULL AND inv.min_price IS NOT NULL AND inv.max_price IS NOT NULL THEN
        IF prop.list_price >= inv.min_price AND prop.list_price <= inv.max_price THEN
            score := score + 30;
        ELSIF prop.list_price < inv.max_price * 1.1 AND prop.list_price > inv.min_price * 0.9 THEN
            score := score + 15; -- Close to range
        END IF;
    END IF;
    
    -- Property type matching (25 points max)
    IF inv.property_types IS NOT NULL AND prop.property_type = ANY(inv.property_types) THEN
        score := score + 25;
    END IF;
    
    -- Location matching (20 points max)
    IF inv."Primary Markets" LIKE '%' || prop.city || '%' OR inv."Primary Markets" LIKE '%' || prop.state || '%' THEN
        score := score + 20;
    ELSIF inv."Secondary Markets" LIKE '%' || prop.city || '%' OR inv."Secondary Markets" LIKE '%' || prop.state || '%' THEN
        score := score + 10;
    END IF;
    
    -- Square footage matching (10 points max)
    IF prop.square_feet IS NOT NULL AND inv.min_sqft IS NOT NULL AND inv.max_sqft IS NOT NULL THEN
        IF prop.square_feet >= inv.min_sqft AND prop.square_feet <= inv.max_sqft THEN
            score := score + 10;
        END IF;
    END IF;
    
    -- Bedroom matching (10 points max)
    IF prop.bedrooms IS NOT NULL AND inv.min_bedrooms IS NOT NULL AND inv.max_bedrooms IS NOT NULL THEN
        IF prop.bedrooms >= inv.min_bedrooms AND prop.bedrooms <= inv.max_bedrooms THEN
            score := score + 10;
        END IF;
    END IF;
    
    -- Year built matching (5 points max)
    IF prop.year_built IS NOT NULL AND inv.min_year_built IS NOT NULL THEN
        IF prop.year_built >= inv.min_year_built THEN
            score := score + 5;
        END IF;
    END IF;
    
    RETURN LEAST(score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate match scores when matches are created
CREATE OR REPLACE FUNCTION public.auto_calculate_match_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.match_score := public.calculate_match_score(NEW.property_id, NEW.investor_id);
    
    -- Set match criteria flags
    SELECT 
        CASE WHEN p.list_price >= i.min_price AND p.list_price <= i.max_price THEN true ELSE false END,
        CASE WHEN i."Primary Markets" LIKE '%' || p.city || '%' OR i."Secondary Markets" LIKE '%' || p.city || '%' THEN true ELSE false END,
        CASE WHEN i.property_types IS NOT NULL AND p.property_type = ANY(i.property_types) THEN true ELSE false END
    INTO 
        NEW.price_match,
        NEW.location_match,
        NEW.property_type_match
    FROM public.properties p, public."Investor Network" i
    WHERE p.id = NEW.property_id AND i."ID" = NEW.investor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_match_score_trigger
    BEFORE INSERT OR UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.auto_calculate_match_score();
