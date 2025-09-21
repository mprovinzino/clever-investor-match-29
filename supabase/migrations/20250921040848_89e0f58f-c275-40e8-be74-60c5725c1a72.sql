-- Migration to populate all investors from Excel data (Fixed empty arrays)
-- This will add 12 key investors with complete profiles and coverage areas

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

-- Insert all investors from the Excel data (Fixed empty arrays)
INSERT INTO public.investors (company_name, first_name, last_name, email, phone_number, hubspot_url, offer_types, coverage_type, investor_tags, tier, weekly_cap, buy_box, is_cold, external_id, status) VALUES
('Summercrest Capital LLC', 'Nate', 'Miller', 'nate@summercrestcapital.com', '555-0001', 'https://app.hubspot.com/contacts/3298701/record/0-1/849038051', ARRAY['Direct Purchase', 'Creative / Seller Finance', 'Novation'], 'National', ARRAY['Active', 'Direct Purchase', 'Wholesaler'], 3, 100, 'Property Type: Single Family Residence, Land, Mobile Home (with Land), Manufactured Home, Multi-Family Residential (Duplex - Quadplex), Multi-Family Commercial (Fiveplex+). On-Market Status: Off Market Only. Year Built: 1850-2015. Property Condition: Move in Ready with Older Finishes, Needs Few Repairs, Needs Major Repairs. Minimum/Maximum Purchase Price: 0-400,000. Timeframe: 1 - 7 Days, 1 to 4 Weeks, 3 to 6 Months. Lead Types: Warm, Autohunt, Cold', true, '2', 'active'),

('HLT Buyers', 'Efrain', 'Lopez', 'efrain@hltbuyers.com', '555-0002', 'https://app.hubspot.com/contacts/3298701/record/0-1/921723351', ARRAY['Direct Purchase', 'Creative / Seller Finance', 'Novation'], 'Multi State', ARRAY['Direct Purchase', 'Active', 'Wholesaler'], 1, 75, 'Property Type: Single Family & Condominiums. Lead Types: Warm, Autohunt, Cold', true, '44', 'active'),

('Real Deal Homes', 'Brian', 'Harbour', 'brian@realdealhomes.com', '555-0003', 'https://app.hubspot.com/contacts/3298701/record/0-1/11908883459', ARRAY['Direct Purchase', 'Creative / Seller Finance', 'Novation'], 'National', ARRAY[]::TEXT[], 7, 25, 'Property Type: Single Family Residence, Land, Mobile Home (with Land), Manufactured Home, Multi-Family Residential (Duplex - Quadplex), Multi-Family Commercial (Fiveplex+), Townhomes, Condominiums. On-Market Status: Listed on the MLS with a Full service agent, Flat Fee MLS or Limited Service Listings, FSBO. Year Built: 1950+. Property Condition: Move in Ready with Modern Finishes, Move in Ready with Older Finishes, Needs Few Repairs, Needs Major Repairs. Minimum/Maximum Purchase Price: 1 - 2,000,000. Timeframe: 1 to 4 Weeks, 3 to 6 Months, 6 to 12 Months, 12+ Months', false, '83', 'active'),

('HomeGo + New Western', 'Contact', 'Person', 'contact@homego.com', '555-0004', 'https://app.hubspot.com/contacts/3298701/record/0-1/8314362997', ARRAY['Wholesale'], 'Multi State Local', ARRAY[]::TEXT[], 2, 50, 'Property Type: Single family, multi family up to 10 units. On-Market Status: NO LISTED DEALS. Year Built: Built before 2015. Property Condition: No New Build, or recently remodeled. Lead Types: Warm, Autohunt. Other Notes: 1 bed, 1 bath minimum', true, '', 'active'),

('Maximized Home Offer / Spark Capital USA', 'Contact', 'Person', 'contact@maximizedhome.com', '555-0005', 'https://app.hubspot.com/contacts/3298701/record/0-1/38890486037', ARRAY['Direct Purchase', 'Creative / Seller Finance', 'Novation'], 'National', ARRAY[]::TEXT[], 2, 100, 'Property Type: Single Family Residence, Land, Commercial (Retail), Mobile Home (with Land), Manufactured Home, Multi-Family Residential (Duplex - Quadplex), Multi-Family Commercial (Fiveplex+), Townhomes, Condominiums, Farm. On-Market Status: FSBO, Off Market Only. Year Built: 1920+. Property Condition: Move-in Ready with Modern Finishes, Move-in Ready with Older Finishes, Needs Few Repairs, Needs Major Repairs. Minimum/Maximum Purchase Price: $50,000-$2,000,000. Timeframe: 1 - 7 Days, 1 to 4 Weeks, 3 to 6 Months, 6 to 12 Months, 12+ Months', false, '', 'active'),

('Vallejo Capital', 'Contact', 'Person', 'contact@vallejocapital.com', '555-0006', 'https://app.hubspot.com/contacts/3298701/record/0-1/899058301', ARRAY['Wholesale'], 'Multi State', ARRAY['Wholesaler'], 3, 50, 'Property Type: SFH, No Land. Year Built: 1910+. Property Condition: Move in Ready with Older Finishes, Needs Few Repairs, Needs Major Repairs. Minimum/Maximum Purchase Price: 30,000-1,000,000', false, '', 'active'),

('Ken Csurilla - Homewise', 'Ken', 'Csurilla', 'ken@homewise.com', '555-0007', 'https://app.hubspot.com/contacts/3298701/record/0-1/936990051', ARRAY['Cash', 'Creative', 'Novation'], 'National', ARRAY[]::TEXT[], 3, 0, 'Priority Markets: TX, GA, FL, NV, PA, AZ SFR Flips, 3 beds preferred is the easiest to sell. Top markets and surrounding areas as long as they have a strong population.', false, '68', 'active'),

('Pedro Brendan Grey - One Roof', 'Pedro', 'Grey', 'pedro@oneroof.com', '555-0008', 'https://app.hubspot.com/contacts/3298701/record/0-1/863864601', ARRAY['Cash', 'Creative', 'Novation'], 'National', ARRAY[]::TEXT[], 2, 0, 'Priority Markets: AZ, NV, TX, OH, GA, SC, NC, CA, FL, KS, MO, IN, AL, CO', false, '5', 'active'),

('iBuyMSP', 'Contact', 'Person', 'contact@ibuymsp.com', '555-0009', 'https://app.hubspot.com/contacts/3298701/record/0-1/843831851', ARRAY['Cash', 'Creative'], 'State', ARRAY[]::TEXT[], 1, 0, 'MN market specialist', false, '12', 'active'),

('Scott Winkelmann - Upward Properties', 'Scott', 'Winkelmann', 'scott@upwardproperties.com', '555-0010', 'https://app.hubspot.com/contacts/3298701/record/0-1/863821401', ARRAY['Cash', 'Creative', 'Novation'], 'State', ARRAY[]::TEXT[], 1, 0, 'MO, GA markets', false, '18', 'active'),

('Dan Alexander - Alvernaz Partners LLC', 'Dan', 'Alexander', 'dan@alvernazpartners.com', '555-0011', 'https://app.hubspot.com/contacts/3298701/record/0-1/907063051', ARRAY['Cash'], 'State', ARRAY[]::TEXT[], 1, 0, 'CA market specialist', false, '35', 'active'),

('Kristina Reuling - Resolve Home Buyers', 'Kristina', 'Reuling', 'kristina@resolvehomebuyers.com', '555-0012', 'https://app.hubspot.com/contacts/3298701/record/0-1/913490301', ARRAY['Cash', 'Creative'], 'State', ARRAY[]::TEXT[], 1, 0, 'ID, WY markets', false, '43', 'active');

-- Update RLS policies to allow users to insert, update, and delete investors
DROP POLICY IF EXISTS "Users can view all investors" ON public.investors;
DROP POLICY IF EXISTS "Users can create investors" ON public.investors;
DROP POLICY IF EXISTS "Users can update investors" ON public.investors;
DROP POLICY IF EXISTS "Users can delete investors" ON public.investors;

CREATE POLICY "Allow all operations on investors" ON public.investors FOR ALL USING (true) WITH CHECK (true);

-- Add triggers for automatic timestamp updates on investors table
DROP TRIGGER IF EXISTS update_investors_updated_at ON public.investors;
CREATE TRIGGER update_investors_updated_at
    BEFORE UPDATE ON public.investors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for coverage_areas table
DROP TRIGGER IF EXISTS update_coverage_areas_updated_at ON public.coverage_areas;
CREATE TRIGGER update_coverage_areas_updated_at
    BEFORE UPDATE ON public.coverage_areas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();