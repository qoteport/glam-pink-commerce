import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Hero from './Hero';
import Hero2 from './Hero2';
import Hero3 from './Hero3';

const DynamicHero = () => {
  const [heroDesign, setHeroDesign] = useState('hero1');

  useEffect(() => {
    const fetchActiveHeroDesign = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_settings')
          .select('hero_design')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data?.hero_design) {
          setHeroDesign(data.hero_design);
        }
      } catch (error) {
        console.error('Error fetching hero design:', error);
      }
    };

    fetchActiveHeroDesign();
  }, []);

  switch (heroDesign) {
    case 'hero2':
      return <Hero2 />;
    case 'hero3':
      return <Hero3 />;
    default:
      return <Hero />;
  }
};

export default DynamicHero;