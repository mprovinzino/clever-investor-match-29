
-- Create the missing ENUM types first
CREATE TYPE public.coverage_type AS ENUM (
    'Regional',
    'National', 
    'Local',
    'Multi-State',
    'Statewide'
);

CREATE TYPE public.investment_strategy AS ENUM (
    'Fix & Flip',
    'Buy & Hold',
    'Wholesale',
    'BRRRR',
    'Short Term Rental',
    'Long Term Rental',
    'Commercial',
    'Land Development',
    'Note Investing'
);

CREATE TYPE public.property_type AS ENUM (
    'single_family',
    'duplex',
    'triplex',
    'fourplex',
    'multifamily',
    'condo',
    'townhouse',
    'commercial',
    'land',
    'mobile_home'
);

CREATE TYPE public.communication_type AS ENUM (
    'Email',
    'Phone',
    'Text',
    'WhatsApp',
    'Slack',
    'In-Person'
);

-- Now create the main investor table with proper ENUM references
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
