-- Associate all existing investors with the current authenticated user
-- This will make all existing investor records visible to the user
UPDATE "Investor Network" 
SET user_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
WHERE user_id IS NULL;