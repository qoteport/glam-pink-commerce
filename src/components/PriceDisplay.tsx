
import React, { useState, useEffect } from 'react';
import { pricingService, PriceDisplay as PriceDisplayType } from '@/services/pricingService';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  className?: string;
  designCSS?: string;
  showOriginalPrice?: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  className = '',
  designCSS = 'text-lg font-bold text-blush-600',
  showOriginalPrice = true
}) => {
  const [displayData, setDisplayData] = useState<{
    price: PriceDisplayType;
    originalPrice?: PriceDisplayType;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await pricingService.getDisplayPrices(price, originalPrice);
        setDisplayData(data);
      } catch (error) {
        console.error('Error fetching display prices:', error);
        // Fallback to original prices
        setDisplayData({
          price: {
            amount: price,
            currency: 'GHS',
            symbol: '₵',
            formatted: `₵${price.toFixed(0)}`
          },
          originalPrice: originalPrice ? {
            amount: originalPrice,
            currency: 'GHS',
            symbol: '₵',
            formatted: `₵${originalPrice.toFixed(0)}`
          } : undefined
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [price, originalPrice]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (!displayData) {
    return null;
  }

  const discountPercentage = displayData.originalPrice && displayData.price.amount < displayData.originalPrice.amount
    ? Math.round(((displayData.originalPrice.amount - displayData.price.amount) / displayData.originalPrice.amount) * 100)
    : 0;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={`${designCSS}`}>
        {displayData.price.formatted}
      </span>
      {showOriginalPrice && displayData.originalPrice && (
        <>
          <span className="text-sm text-gray-500 line-through">
            {displayData.originalPrice.formatted}
          </span>
          {discountPercentage > 0 && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default PriceDisplay;
