-- Add new columns to the Investor Network table for structured buy box criteria
ALTER TABLE "Investor Network" 
ADD COLUMN IF NOT EXISTS property_types text[],
ADD COLUMN IF NOT EXISTS min_price numeric,
ADD COLUMN IF NOT EXISTS max_price numeric,
ADD COLUMN IF NOT EXISTS property_conditions text[],
ADD COLUMN IF NOT EXISTS min_sqft integer,
ADD COLUMN IF NOT EXISTS max_sqft integer,
ADD COLUMN IF NOT EXISTS min_year_built integer,
ADD COLUMN IF NOT EXISTS max_year_built integer,
ADD COLUMN IF NOT EXISTS timeline_preferences text[],
ADD COLUMN IF NOT EXISTS investment_strategies text[];