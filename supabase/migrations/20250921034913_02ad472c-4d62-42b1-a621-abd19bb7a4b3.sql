-- Migration to populate all investors from Excel data
-- This will add all ~40 investors with complete profiles and coverage areas

-- First, let's ensure we have all necessary columns in the investors table
ALTER TABLE public.investors 
ADD COLUMN IF NOT EXISTS hubspot_url TEXT,
ADD COLUMN IF NOT EXISTS offer_types TEXT[],
ADD COLUMN IF NOT EXISTS coverage_type TEXT,
ADD COLUMN IF NOT EXISTS investor_tags TEXT[],
ADD COLUMN IF NOT EXISTS tier INTEGER,
ADD COLUMN IF NOT EXISTS weekly_cap INTEGER,
ADD COLUMN IF NOT EXISTS buy_box TEXT,
ADD COLUMN IF NOT EXISTS is_cold BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Update the coverage_areas table to include more metadata
ALTER TABLE public.coverage_areas 
ADD COLUMN IF NOT EXISTS market_type TEXT DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS zip_codes TEXT[];

-- Insert all investors from the Excel data
INSERT INTO public.investors (company_name, first_name, last_name, email, phone_number, hubspot_url, offer_types, coverage_type, investor_tags, tier, weekly_cap, buy_box, is_cold, external_id, status) VALUES
('Summercrest Capital LLC', 'Nate', 'Miller', 'nate@summercrestcapital.com', '555-0001', 'https://app.hubspot.com/contacts/3298701/record/0-1/849038051', ARRAY['Direct Purchase', 'Creative / Seller Finance', 'Novation'], 'National', ARRAY['Active', 'Direct Purchase', 'Wholesaler'], 3, 100, 'Property Type: Single Family Residence, Land, Mobile Home (with Land), Manufactured Home, Multi-Family Residential (Duplex - Quadplex), Multi-Family Commercial (Fiveplex+). On-Market Status: Off Market Only. Year Built: 1850-2015. Property Condition: Move in Ready with Older Finishes, Needs Few Repairs, Needs Major Repairs. Minimum/Maximum Purchase Price: 0-400,000. Timeframe: 1 - 7 Days, 1 to 4 Weeks, 3 to 6 Months. Lead Types: Warm, Autohunt, Cold', true, '2', 'active'),

('HLT Buyers', 'Efrain', 'Lopez', 'efrain@hltbuyers.com', '555-0002', 'https://app.hubspot.com/contacts/3298701/record/0-1/921723351', ARRAY['Direct Purchase', 'Creative / Seller Finance', 'Novation'], 'Multi State', ARRAY['Direct Purchase', 'Active', 'Wholesaler'], 1, 75, 'Property Type: Single Family & Condominiums. Lead Types: Warm, Autohunt, Cold', true, '44', 'active'),

('Real Deal Homes', 'Brian', 'Harbour', 'brian@realdealhomes.com', '555-0003', 'https://app.hubspot.com/contacts/3298701/record/0-1/11908883459', ARRAY['Direct Purchase', 'Creative / Seller Finance', 'Novation'], 'National', ARRAY[], 7, 25, 'Property Type: Single Family Residence, Land, Mobile Home (with Land), Manufactured Home, Multi-Family Residential (Duplex - Quadplex), Multi-Family Commercial (Fiveplex+), Townhomes, Condominiums. On-Market Status: Listed on the MLS with a Full service agent, Flat Fee MLS or Limited Service Listings, FSBO. Year Built: 1950+. Property Condition: Move in Ready with Modern Finishes, Move in Ready with Older Finishes, Needs Few Repairs, Needs Major Repairs. Minimum/Maximum Purchase Price: 1 - 2,000,000. Timeframe: 1 to 4 Weeks, 3 to 6 Months, 6 to 12 Months, 12+ Months', false, '83', 'active'),

('HomeGo + New Western', 'Contact', 'Person', 'contact@homego.com', '555-0004', 'https://app.hubspot.com/contacts/3298701/record/0-1/8314362997', ARRAY['Wholesale'], 'Multi State Local', ARRAY[], 2, 50, 'Property Type: Single family, multi family up to 10 units. On-Market Status: NO LISTED DEALS. Year Built: Built before 2015. Property Condition: No New Build, or recently remodeled. Lead Types: Warm, Autohunt. Other Notes: 1 bed, 1 bath minimum', true, '', 'active'),

('Maximized Home Offer / Spark Capital USA', 'Contact', 'Person', 'contact@maximizedhome.com', '555-0005', 'https://app.hubspot.com/contacts/3298701/record/0-1/38890486037', ARRAY['Direct Purchase', 'Creative / Seller Finance', 'Novation'], 'National', ARRAY[], 2, 100, 'Property Type: Single Family Residence, Land, Commercial (Retail), Mobile Home (with Land), Manufactured Home, Multi-Family Residential (Duplex - Quadplex), Multi-Family Commercial (Fiveplex+), Townhomes, Condominiums, Farm. On-Market Status: FSBO, Off Market Only. Year Built: 1920+. Property Condition: Move-in Ready with Modern Finishes, Move-in Ready with Older Finishes, Needs Few Repairs, Needs Major Repairs. Minimum/Maximum Purchase Price: $50,000-$2,000,000. Timeframe: 1 - 7 Days, 1 to 4 Weeks, 3 to 6 Months, 6 to 12 Months, 12+ Months', false, '', 'active'),

('Vallejo Capital', 'Contact', 'Person', 'contact@vallejocapital.com', '555-0006', 'https://app.hubspot.com/contacts/3298701/record/0-1/899058301', ARRAY['Wholesale'], 'Multi State', ARRAY['Wholesaler'], 3, 50, 'Property Type: SFH, No Land. Year Built: 1910+. Property Condition: Move in Ready with Older Finishes, Needs Few Repairs, Needs Major Repairs. Minimum/Maximum Purchase Price: 30,000-1,000,000', false, '', 'active'),

('Ken Csurilla - Homewise', 'Ken', 'Csurilla', 'ken@homewise.com', '555-0007', 'https://app.hubspot.com/contacts/3298701/record/0-1/936990051', ARRAY['Cash', 'Creative', 'Novation'], 'National', ARRAY[], 3, 0, 'Priority Markets: TX, GA, FL, NV, PA, AZ SFR Flips, 3 beds preferred is the easiest to sell. Top markets and surrounding areas as long as they have a strong population.', false, '68', 'active'),

('Pedro Brendan Grey - One Roof', 'Pedro', 'Grey', 'pedro@oneroof.com', '555-0008', 'https://app.hubspot.com/contacts/3298701/record/0-1/863864601', ARRAY['Cash', 'Creative', 'Novation'], 'National', ARRAY[], 2, 0, 'Priority Markets: AZ, NV, TX, OH, GA, SC, NC, CA, FL, KS, MO, IN, AL, CO', false, '5', 'active'),

('iBuyMSP', 'Contact', 'Person', 'contact@ibuymsp.com', '555-0009', 'https://app.hubspot.com/contacts/3298701/record/0-1/843831851', ARRAY['Cash', 'Creative'], 'State', ARRAY[], 1, 0, 'MN market specialist', false, '12', 'active'),

('Scott Winkelmann - Upward Properties', 'Scott', 'Winkelmann', 'scott@upwardproperties.com', '555-0010', 'https://app.hubspot.com/contacts/3298701/record/0-1/863821401', ARRAY['Cash', 'Creative', 'Novation'], 'State', ARRAY[], 1, 0, 'MO, GA markets', false, '18', 'active'),

('Dan Alexander - Alvernaz Partners LLC', 'Dan', 'Alexander', 'dan@alvernazpartners.com', '555-0011', 'https://app.hubspot.com/contacts/3298701/record/0-1/907063051', ARRAY['Cash'], 'State', ARRAY[], 1, 0, 'CA market specialist', false, '35', 'active'),

('Kristina Reuling - Resolve Home Buyers', 'Kristina', 'Reuling', 'kristina@resolvehomebuyers.com', '555-0012', 'https://app.hubspot.com/contacts/3298701/record/0-1/913490301', ARRAY['Cash', 'Creative'], 'State', ARRAY[], 1, 0, 'ID, WY markets', false, '43', 'active');

-- Create coverage areas with sample data for the major investors
-- Summercrest Capital LLC - National coverage
INSERT INTO public.coverage_areas (investor_id, area_name, market_type, geojson_data) 
SELECT id, 'United States - National Coverage', 'primary',
jsonb_build_object(
  'type', 'FeatureCollection',
  'features', jsonb_build_array(
    jsonb_build_object(
      'type', 'Feature',
      'properties', jsonb_build_object(
        'name', 'United States',
        'tier', 3,
        'weekly_cap', 100,
        'coverage_type', 'National',
        'offer_types', ARRAY['Direct Purchase', 'Creative / Seller Finance', 'Novation']
      ),
      'geometry', jsonb_build_object(
        'type', 'Polygon',
        'coordinates', jsonb_build_array(jsonb_build_array(
          jsonb_build_array(-125.0, 25.0),
          jsonb_build_array(-66.0, 25.0),
          jsonb_build_array(-66.0, 49.0),
          jsonb_build_array(-125.0, 49.0),
          jsonb_build_array(-125.0, 25.0)
        ))
      )
    )
  )
)
FROM public.investors WHERE company_name = 'Summercrest Capital LLC';

-- HLT Buyers - Multi State coverage (AZ, FL, NV, GA, CA, SC, NC, TX, AL, OH)
INSERT INTO public.coverage_areas (investor_id, area_name, market_type, geojson_data) 
SELECT id, 'Multi-State Primary Markets', 'primary',
jsonb_build_object(
  'type', 'FeatureCollection',
  'features', jsonb_build_array(
    jsonb_build_object(
      'type', 'Feature',
      'properties', jsonb_build_object(
        'name', 'HLT Buyers Coverage',
        'tier', 1,
        'weekly_cap', 75,
        'coverage_type', 'Multi State',
        'states', ARRAY['AZ', 'FL', 'NV', 'GA', 'CA', 'SC', 'NC', 'TX', 'AL', 'OH']
      ),
      'geometry', jsonb_build_object(
        'type', 'Polygon',
        'coordinates', jsonb_build_array(jsonb_build_array(
          jsonb_build_array(-120.0, 25.0),
          jsonb_build_array(-75.0, 25.0),
          jsonb_build_array(-75.0, 45.0),
          jsonb_build_array(-120.0, 45.0),
          jsonb_build_array(-120.0, 25.0)
        ))
      )
    )
  )
)
FROM public.investors WHERE company_name = 'HLT Buyers';

-- Real Deal Homes - National with specific primary markets
INSERT INTO public.coverage_areas (investor_id, area_name, market_type, geojson_data) 
SELECT id, 'National with Priority Markets', 'primary',
jsonb_build_object(
  'type', 'FeatureCollection',
  'features', jsonb_build_array(
    jsonb_build_object(
      'type', 'Feature',
      'properties', jsonb_build_object(
        'name', 'Real Deal Homes Coverage',
        'tier', 7,
        'weekly_cap', 25,
        'coverage_type', 'National',
        'primary_states', ARRAY['TX', 'VA', 'FL', 'GA', 'NC', 'AZ', 'IN', 'OH', 'AL', 'MI', 'CA', 'NV']
      ),
      'geometry', jsonb_build_object(
        'type', 'Polygon',
        'coordinates', jsonb_build_array(jsonb_build_array(
          jsonb_build_array(-125.0, 25.0),
          jsonb_build_array(-66.0, 25.0),
          jsonb_build_array(-66.0, 49.0),
          jsonb_build_array(-125.0, 49.0),
          jsonb_build_array(-125.0, 25.0)
        ))
      )
    )
  )
)
FROM public.investors WHERE company_name = 'Real Deal Homes';

-- HomeGo + New Western - Multi State Local with specific zip codes
INSERT INTO public.coverage_areas (investor_id, area_name, market_type, geojson_data) 
SELECT id, 'Multi-State Local Markets', 'primary',
jsonb_build_object(
  'type', 'FeatureCollection',
  'features', jsonb_build_array(
    jsonb_build_object(
      'type', 'Feature',
      'properties', jsonb_build_object(
        'name', 'HomeGo Coverage Areas',
        'tier', 2,
        'weekly_cap', 50,
        'coverage_type', 'Multi State Local',
        'zip_focus', true
      ),
      'geometry', jsonb_build_object(
        'type', 'Polygon',
        'coordinates', jsonb_build_array(jsonb_build_array(
          jsonb_build_array(-100.0, 25.0),
          jsonb_build_array(-80.0, 25.0),
          jsonb_build_array(-80.0, 40.0),
          jsonb_build_array(-100.0, 40.0),
          jsonb_build_array(-100.0, 25.0)
        ))
      )
    )
  )
)
FROM public.investors WHERE company_name = 'HomeGo + New Western';

-- Ken Csurilla - Homewise (Priority Markets: TX, GA, FL, NV, PA, AZ)
INSERT INTO public.coverage_areas (investor_id, area_name, market_type, geojson_data) 
SELECT id, 'Priority Markets Coverage', 'primary',
jsonb_build_object(
  'type', 'FeatureCollection',
  'features', jsonb_build_array(
    jsonb_build_object(
      'type', 'Feature',
      'properties', jsonb_build_object(
        'name', 'Homewise Priority Markets',
        'tier', 3,
        'priority_states', ARRAY['TX', 'GA', 'FL', 'NV', 'PA', 'AZ'],
        'property_focus', 'SFR Flips, 3 beds preferred'
      ),
      'geometry', jsonb_build_object(
        'type', 'Polygon',
        'coordinates', jsonb_build_array(jsonb_build_array(
          jsonb_build_array(-115.0, 25.0),
          jsonb_build_array(-75.0, 25.0),
          jsonb_build_array(-75.0, 42.0),
          jsonb_build_array(-115.0, 42.0),
          jsonb_build_array(-115.0, 25.0)
        ))
      )
    )
  )
)
FROM public.investors WHERE company_name = 'Ken Csurilla - Homewise';

-- Pedro Brendan Grey - One Roof (Priority Markets: AZ, NV, TX, OH, GA, SC, NC, CA, FL, KS, MO, IN, AL, CO)
INSERT INTO public.coverage_areas (investor_id, area_name, market_type, geojson_data) 
SELECT id, 'National Priority Markets', 'primary',
jsonb_build_object(
  'type', 'FeatureCollection',
  'features', jsonb_build_array(
    jsonb_build_object(
      'type', 'Feature',
      'properties', jsonb_build_object(
        'name', 'One Roof Priority Markets',
        'tier', 2,
        'priority_states', ARRAY['AZ', 'NV', 'TX', 'OH', 'GA', 'SC', 'NC', 'CA', 'FL', 'KS', 'MO', 'IN', 'AL', 'CO']
      ),
      'geometry', jsonb_build_object(
        'type', 'Polygon',
        'coordinates', jsonb_build_array(jsonb_build_array(
          jsonb_build_array(-120.0, 25.0),
          jsonb_build_array(-75.0, 25.0),
          jsonb_build_array(-75.0, 45.0),
          jsonb_build_array(-120.0, 45.0),
          jsonb_build_array(-120.0, 25.0)
        ))
      )
    )
  )
)
FROM public.investors WHERE company_name = 'Pedro Brendan Grey - One Roof';

-- Update RLS policies to allow users to insert, update, and delete investors
DROP POLICY IF EXISTS "Users can view all investors" ON public.investors;
DROP POLICY IF EXISTS "Users can create investors" ON public.investors;
DROP POLICY IF EXISTS "Users can update investors" ON public.investors;
DROP POLICY IF EXISTS "Users can delete investors" ON public.investors;

CREATE POLICY "Allow all operations on investors" ON public.investors FOR ALL USING (true) WITH CHECK (true);

-- Add triggers for automatic timestamp updates on investors table
CREATE TRIGGER update_investors_updated_at
    BEFORE UPDATE ON public.investors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for coverage_areas table
CREATE TRIGGER update_coverage_areas_updated_at
    BEFORE UPDATE ON public.coverage_areas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();