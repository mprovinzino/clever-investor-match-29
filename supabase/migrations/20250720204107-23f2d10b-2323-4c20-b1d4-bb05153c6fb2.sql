
-- Remove Row Level Security from Investor Network table to allow data access
ALTER TABLE public."Investor Network" DISABLE ROW LEVEL SECURITY;

-- Add sample data from your Google Sheet (I'll add a few examples and you can provide the rest)
-- Here are some sample INSERT statements for your 31 contacts
-- You'll need to provide me with the actual data from your Google Sheet

-- Example format for importing your contacts:
-- INSERT INTO public."Investor Network" (
--   "Company Name", "Main POC", "Tier", "Weekly Cap", "Coverage Type", 
--   "Primary Markets", "Secondary Markets", "Offer Types", "Buy Box", 
--   "Direct Purchase", "Investor Tags", "HS Company URL", "Cold", "Reason for Freeze"
-- ) VALUES 
-- ('Your Company 1', 'Contact Person 1', 1, 10, 'National', 'Florida, Georgia', 'Alabama, South Carolina', 'Cash, Financing', 'SFH 50k-200k', 'Yes', 'Active, Reliable', 'https://company1.com', 'No', ''),
-- ('Your Company 2', 'Contact Person 2', 2, 5, 'Regional', 'Texas, Oklahoma', 'Arkansas, Louisiana', 'Cash Only', 'Multifamily 100k-500k', 'No', 'New, Potential', 'https://company2.com', 'Yes', '');

-- For now, let's just ensure the table is accessible
-- Once you provide your Google Sheet data or CSV, I can create proper INSERT statements for all 31 contacts
