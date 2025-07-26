
-- Temporarily disable RLS on the Investor Network table
ALTER TABLE "Investor Network" DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on coverage_areas table since it's related to investors
ALTER TABLE coverage_areas DISABLE ROW LEVEL SECURITY;

-- Disable RLS on profiles table as well
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
