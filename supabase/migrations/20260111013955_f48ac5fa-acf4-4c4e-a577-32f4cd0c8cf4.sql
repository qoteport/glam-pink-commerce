-- Drop the existing check constraint and add updated one with hero6
ALTER TABLE public.hero_settings DROP CONSTRAINT IF EXISTS hero_design_check;

ALTER TABLE public.hero_settings ADD CONSTRAINT hero_design_check 
CHECK (hero_design IN ('hero1', 'hero2', 'hero3', 'hero4', 'hero5', 'hero6'));