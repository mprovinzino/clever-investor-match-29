-- Fix function search_path security warnings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix the existing calculate_match_score function search_path
CREATE OR REPLACE FUNCTION public.calculate_match_score(p_property_id uuid, p_investor_id bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    score INTEGER := 0;
    prop RECORD;
    inv RECORD;
    location_matched BOOLEAN := false;
BEGIN
    -- Get property details
    SELECT * INTO prop FROM public.properties WHERE id = p_property_id;
    
    -- Get investor details
    SELECT * INTO inv FROM public."Investor Network" WHERE "ID" = p_investor_id;
    
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
    IF prop.list_price IS NOT NULL AND inv.min_price IS NOT NULL AND inv.max_price IS NOT NULL THEN
        IF prop.list_price >= inv.min_price AND prop.list_price <= inv.max_price THEN
            score := score + 5; -- Within budget
        ELSIF prop.list_price <= (inv.max_price * 1.2) THEN
            score := score + 3; -- Slightly over budget but potentially negotiable
        END IF;
    END IF;
    
    RETURN LEAST(score, 100); -- Cap at 100
END;
$$;

-- Fix the auto_calculate_match_score function search_path
CREATE OR REPLACE FUNCTION public.auto_calculate_match_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.match_score := public.calculate_match_score(NEW.property_id, NEW.investor_id);
    
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
            WHEN p.list_price IS NOT NULL AND i.max_price IS NOT NULL AND p.list_price <= (i.max_price * 1.2) THEN true 
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
    FROM public.properties p, public."Investor Network" i
    WHERE p.id = NEW.property_id AND i."ID" = NEW.investor_id;
    
    RETURN NEW;
END;
$$;