-- First, add primary key constraint to Investor Network table if it doesn't exist
ALTER TABLE public."Investor Network" ADD CONSTRAINT investor_network_pkey PRIMARY KEY ("ID");

-- Create coverage_areas table for storing agent/investor coverage areas as GeoJSON
CREATE TABLE public.coverage_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id BIGINT NOT NULL,
  area_name TEXT NOT NULL,
  geojson_data JSONB NOT NULL,
  area_type TEXT NOT NULL DEFAULT 'polygon' CHECK (area_type IN ('polygon', 'circle', 'rectangle')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_coverage_areas_investor_id 
    FOREIGN KEY (investor_id) REFERENCES public."Investor Network"("ID") ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.coverage_areas ENABLE ROW LEVEL SECURITY;

-- Create policies for coverage areas - users can only access coverage areas for their own investors
CREATE POLICY "Users can view coverage areas for their investors" 
ON public.coverage_areas 
FOR SELECT 
USING (
  investor_id IN (
    SELECT "ID" FROM public."Investor Network" 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create coverage areas for their investors" 
ON public.coverage_areas 
FOR INSERT 
WITH CHECK (
  investor_id IN (
    SELECT "ID" FROM public."Investor Network" 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update coverage areas for their investors" 
ON public.coverage_areas 
FOR UPDATE 
USING (
  investor_id IN (
    SELECT "ID" FROM public."Investor Network" 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete coverage areas for their investors" 
ON public.coverage_areas 
FOR DELETE 
USING (
  investor_id IN (
    SELECT "ID" FROM public."Investor Network" 
    WHERE user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_coverage_areas_investor_id ON public.coverage_areas(investor_id);
CREATE INDEX idx_coverage_areas_geojson ON public.coverage_areas USING GIN(geojson_data);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_coverage_areas_updated_at
BEFORE UPDATE ON public.coverage_areas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();