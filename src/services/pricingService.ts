import { locationService, UserLocation } from "./locationService";

// Add this flag to force a particular currency (set to null to use automatic detection)
const FORCE_CURRENCY: string | null = null; // Can be set to 'USD', 'EUR', 'GHS', or null

interface PricingConfig {
  baseCurrency: 'GHS';
  defaultCurrency: 'USD';
  exchangeRates: {
    USD: number;
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
    defaultCurrency: 'USD',
    exchangeRates: {
      USD: 0.080, // Fallback rate
      EUR: 0.070, // Fallback rate
      GHS: 1.0
    },
    locationRules: {
      'Europe': 'EUR',
      'Ghana': 'GHS',
      'United States': 'USD',
      'default': 'USD'
    }
  };

  private currencySymbols = {
    USD: '$',
    GHS: '₵',
    EUR: '€'
  };

  private apiKey = import.meta.env.VITE_EXCHANGE_RATE_API_KEY; // Replace with your API key
  private apiUrl = 'https://v6.exchangerate-api.com/v6';

  constructor() {
    // Fetch exchange rates when the class is instantiated
    this.fetchExchangeRates();
  }

  // Fetch exchange rates from ExchangeRate-API
  private async fetchExchangeRates(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${this.apiKey}/latest/GHS`);
      const data = await response.json();

      if (data.result === 'success') {
        this.config.exchangeRates = {
          USD: data.conversion_rates.USD || this.config.exchangeRates.USD,
          EUR: data.conversion_rates.EUR || this.config.exchangeRates.EUR,
          GHS: 1.0
        };
        console.log('Exchange rates updated:', this.config.exchangeRates);
      } else {
        console.error('API error:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Fallback to hardcoded rates (already set in config)
    }
  }

  // Get user's location using the imported locationService
  private async getUserLocation(): Promise<string> {
    try {
      const userLocation: UserLocation | null = await locationService.getUserLocation();
      if (userLocation && userLocation.country) {
        if (['France', 'Germany', 'Italy', 'Spain', 'Belgium'].includes(userLocation.country)) {
          return 'Europe';
        }
        return userLocation.country ? userLocation.country : 'default';
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
    return `${symbol}${amount.toFixed(0)}`;
  }

  // Main method to get display price
  async getDisplayPrice(priceInGHS: number): Promise<PriceDisplay> {
    // Check if we should use forced currency
    if (FORCE_CURRENCY && this.currencySymbols.hasOwnProperty(FORCE_CURRENCY)) {
      const targetCurrency = FORCE_CURRENCY;
      const convertedAmount = this.convertPrice(priceInGHS, targetCurrency);
      
      return {
        amount: convertedAmount,
        currency: targetCurrency,
        symbol: this.currencySymbols[targetCurrency as keyof typeof this.currencySymbols] || targetCurrency,
        formatted: this.formatPrice(convertedAmount, targetCurrency)
      };
    }
    
    // Otherwise use automatic detection
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
  async updateExchangeRates(rates?: Partial<PricingConfig['exchangeRates']>): Promise<void> {
    if (rates) {
      this.config.exchangeRates = { ...this.config.exchangeRates, ...rates };
    } else {
      await this.fetchExchangeRates(); // Fetch from API if no rates provided
    }
  }

  // Get base currency
  getBaseCurrency(): string {
    return this.config.baseCurrency;
  }

  // Get default currency
  getDefaultCurrency(): string {
    return this.config.defaultCurrency;
  }
}

export const pricingService = new PricingService();
export type { PriceDisplay };