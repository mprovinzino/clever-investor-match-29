-- Create coverage_areas table to store investor coverage polygons
CREATE TABLE public.coverage_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL,
  area_name TEXT NOT NULL,
  geojson_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investors table based on approved investor applications
CREATE TABLE public.investors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.coverage_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;

-- Create policies for coverage_areas
CREATE POLICY "Users can view all coverage areas" 
ON public.coverage_areas 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create coverage areas" 
ON public.coverage_areas 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update coverage areas" 
ON public.coverage_areas 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete coverage areas" 
ON public.coverage_areas 
FOR DELETE 
USING (true);

-- Create policies for investors
CREATE POLICY "Users can view all investors" 
ON public.investors 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE TRIGGER update_coverage_areas_updated_at
BEFORE UPDATE ON public.coverage_areas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investors_updated_at
BEFORE UPDATE ON public.investors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint
ALTER TABLE public.coverage_areas 
ADD CONSTRAINT coverage_areas_investor_id_fkey 
FOREIGN KEY (investor_id) REFERENCES public.investors(id) ON DELETE CASCADE;