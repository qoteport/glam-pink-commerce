-- Add hero_design column to hero_settings table
ALTER TABLE public.hero_settings ADD COLUMN hero_design TEXT DEFAULT 'hero1';

-- Update the column to have a check constraint for valid designs
ALTER TABLE public.hero_settings ADD CONSTRAINT hero_design_check 
CHECK (hero_design IN ('hero1', 'hero2', 'hero3'));