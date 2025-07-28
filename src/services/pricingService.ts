
interface PricingConfig {
  baseCurrency: 'GHS';
  exchangeRates: {
    EUR: number;
    GHS: number;
  };
  locationRules: {
    [key: string]: string;
  };
}

interface PriceDisplay {
  amount: number;
  currency: string;
  symbol: string;
  formatted: string;
}

class PricingService {
  private config: PricingConfig = {
    baseCurrency: 'GHS',
    exchangeRates: {
      EUR: 0.080, // 1 GHS = 0.080 EUR (approximate)
      GHS: 1.0
    },
    locationRules: {
      'Europe': 'EUR',
      'Ghana': 'GHS',
      'default': 'GHS'
    }
  };

  private currencySymbols = {
    GHS: '₵',
    EUR: '€'
  };

  // Get user's location (simplified - in production, use proper geolocation)
  private async getUserLocation(): Promise<string> {
    try {
      // Try to get location from browser API
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // In a real implementation, you'd use a reverse geocoding service
              // For now, we'll use a simplified approach
              resolve('default');
            },
            () => resolve('default')
          );
        });
      }
      
      // Fallback: try to detect from timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone.includes('Europe')) {
        return 'Europe';
      }
      if (timezone.includes('Africa/Accra')) {
        return 'Ghana';
      }
      
      return 'default';
    } catch (error) {
      console.error('Error getting user location:', error);
      return 'default';
    }
  }

  // Convert price from GHS to target currency
  private convertPrice(priceInGHS: number, targetCurrency: string): number {
    const rate = this.config.exchangeRates[targetCurrency as keyof typeof this.config.exchangeRates];
    if (!rate) return priceInGHS;
    
    return Math.round((priceInGHS * rate) * 100) / 100; // Round to 2 decimal places
  }

  // Get currency for user's location
  private getCurrencyForLocation(location: string): string {
    return this.config.locationRules[location] || this.config.locationRules.default;
  }

  // Format price with currency symbol
  private formatPrice(amount: number, currency: string): string {
    const symbol = this.currencySymbols[currency as keyof typeof this.currencySymbols] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }

  // Main method to get display price
  async getDisplayPrice(priceInGHS: number): Promise<PriceDisplay> {
    const userLocation = await this.getUserLocation();
    const targetCurrency = this.getCurrencyForLocation(userLocation);
    const convertedAmount = this.convertPrice(priceInGHS, targetCurrency);
    
    return {
      amount: convertedAmount,
      currency: targetCurrency,
      symbol: this.currencySymbols[targetCurrency as keyof typeof this.currencySymbols] || targetCurrency,
      formatted: this.formatPrice(convertedAmount, targetCurrency)
    };
  }

  // Get multiple prices (for original price comparisons)
  async getDisplayPrices(priceInGHS: number, originalPriceInGHS?: number): Promise<{
    price: PriceDisplay;
    originalPrice?: PriceDisplay;
  }> {
    const price = await this.getDisplayPrice(priceInGHS);
    let originalPrice;
    
    if (originalPriceInGHS) {
      originalPrice = await this.getDisplayPrice(originalPriceInGHS);
    }
    
    return { price, originalPrice };
  }

  // Update exchange rates (for admin or periodic updates)
  updateExchangeRates(rates: Partial<PricingConfig['exchangeRates']>) {
    this.config.exchangeRates = { ...this.config.exchangeRates, ...rates };
  }
}

export const pricingService = new PricingService();
export type { PriceDisplay };
