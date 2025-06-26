
-- Enable RLS on all three tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Add user_id column to products table for RLS
ALTER TABLE public.products ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to parts table for RLS  
ALTER TABLE public.parts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to product_images table for RLS
ALTER TABLE public.product_images ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- RLS Policies for products table
CREATE POLICY "Users can view their own products" 
  ON public.products 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
  ON public.products 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
  ON public.products 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for parts table
CREATE POLICY "Users can view their own parts" 
  ON public.parts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own parts" 
  ON public.parts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parts" 
  ON public.parts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own parts" 
  ON public.parts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for product_images table
CREATE POLICY "Users can view their own product images" 
  ON public.product_images 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product images" 
  ON public.product_images 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product images" 
  ON public.product_images 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product images" 
  ON public.product_images 
  FOR DELETE 
  USING (auth.uid() = user_id);
