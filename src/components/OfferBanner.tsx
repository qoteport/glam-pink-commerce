import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronRight, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Offer {
  id: string;
  name: string;
  description: string | null;
  banner_image: string | null;
  discount_percentage: number;
  start_date: string;
  end_date: string;
}

const OfferBanner = () => {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveOffer();
  }, []);

  useEffect(() => {
    if (!offer) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(offer.end_date).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [offer]);

  const fetchActiveOffer = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gt('end_date', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setOffer(data);
    } catch (error) {
      console.error('Error fetching offer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !offer) return null;

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px]">
        <span className="text-xl md:text-2xl md:text-3xl font-bold text-white">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-white/80 mt-1">{label}</span>
    </div>
  );

  return (
    <div 
      className="relative overflow-hidden rounded-2xl mx-4 lg:mx-0 mb-8"
      style={{
        backgroundImage: offer.banner_image ? `url(${offer.banner_image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className={`${offer.banner_image ? 'bg-black/50' : 'bg-gradient-to-r from-rosegold-500 to-blush-500'} p-6 md:p-8`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-300 animate-pulse" />
              <Badge className="bg-orange-500 text-white border-none">
                Limited Time Offer
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl md:text-3xl font-bold text-white mb-2">
              {offer.name}
            </h2>
            {offer.description && (
              <p className="text-white/90 text-sm md:text-base max-w-md">
                {offer.description}
              </p>
            )}
            <Badge className="bg-white/20 text-white border-white/30 mt-3 text-lg px-4 py-1">
              Up to {offer.discount_percentage}% OFF
            </Badge>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-white/90">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Ends in</span>
            </div>
            <div className="flex items-center gap-2">
              <TimeBlock value={timeLeft.days} label="Days" />
              <span className="text-xl md:text-2xl text-white font-bold">:</span>
              <TimeBlock value={timeLeft.hours} label="Hours" />
              <span className="text-xl md:text-2xl text-white font-bold">:</span>
              <TimeBlock value={timeLeft.minutes} label="Mins" />
              <span className="text-xl md:text-2xl text-white font-bold">:</span>
              <TimeBlock value={timeLeft.seconds} label="Secs" />
            </div>
            <Button
              onClick={() => navigate(`/offer/${offer.id}`)}
              className="bg-white text-rosegold-600 hover:bg-white/90 font-semibold"
            >
              Shop Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;
