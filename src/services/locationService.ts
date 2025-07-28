
import { supabase } from '@/integrations/supabase/client';

export interface UserLocation {
  country: string;
  city?: string;
  region?: string;
  currency: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

class LocationService {
  private static LOCATION_STORAGE_KEY = 'hairytalesbeauty_location';

  // Save location to localStorage for guests
  saveGuestLocation(location: UserLocation): void {
    localStorage.setItem(LocationService.LOCATION_STORAGE_KEY, JSON.stringify(location));
  }

  // Load location from localStorage for guests
  loadGuestLocation(): UserLocation | null {
    const stored = localStorage.getItem(LocationService.LOCATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  // Save location to database for authenticated users
  async saveUserLocation(userId: string, location: UserLocation): Promise<void> {
    try {
      // Check if location already exists
      const { data: existingLocation } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingLocation) {
        // Update existing location
        const { error } = await supabase
          .from('user_locations')
          .update({
            country: location.country,
            city: location.city,
            region: location.region,
            currency: location.currency,
            timezone: location.timezone,
            latitude: location.latitude,
            longitude: location.longitude,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating user location:', error);
        }
      } else {
        // Insert new location
        const { error } = await supabase
          .from('user_locations')
          .insert({
            user_id: userId,
            country: location.country,
            city: location.city,
            region: location.region,
            currency: location.currency,
            timezone: location.timezone,
            latitude: location.latitude,
            longitude: location.longitude
          });

        if (error) {
          console.error('Error saving user location:', error);
        }
      }
    } catch (error) {
      console.error('Error in saveUserLocation:', error);
    }
  }

  // Load location from database for authenticated users
  async loadUserLocation(userId: string): Promise<UserLocation | null> {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        country: data.country,
        city: data.city,
        region: data.region,
        currency: data.currency,
        timezone: data.timezone,
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      console.error('Error in loadUserLocation:', error);
      return null;
    }
  }

  // Get user's current location using IP geolocation
  async detectUserLocation(): Promise<UserLocation | null> {
    try {
      // Try to get location from browser geolocation first
      const position = await this.getBrowserLocation();
      
      // Use IP geolocation as fallback
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'Failed to detect location');
      }

      const location: UserLocation = {
        country: data.country_name || 'Unknown',
        city: data.city,
        region: data.region,
        currency: this.getCurrencyFromCountry(data.country_code),
        timezone: data.timezone,
        latitude: position?.coords.latitude || data.latitude,
        longitude: position?.coords.longitude || data.longitude
      };

      return location;
    } catch (error) {
      console.error('Error detecting location:', error);
      
      // Return default location
      return {
        country: 'Ghana',
        currency: 'USD' // Default to USD as specified
      };
    }
  }

  // Get browser geolocation
  private getBrowserLocation(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  }

  // Map country code to currency
  private getCurrencyFromCountry(countryCode: string): string {
    const currencyMap: { [key: string]: string } = {
      'GH': 'GHS',
      'US': 'USD',
      'GB': 'GBP',
      'EU': 'EUR',
      'NG': 'NGN',
      'CA': 'CAD',
      'AU': 'AUD',
      // Add more mappings as needed
    };

    return currencyMap[countryCode] || 'USD'; // Default to USD
  }

  // Get or detect user location
  async getUserLocation(userId?: string): Promise<UserLocation> {
    try {
      // First try to load from storage
      let location: UserLocation | null = null;

      if (userId) {
        location = await this.loadUserLocation(userId);
      } else {
        location = this.loadGuestLocation();
      }

      // If no stored location, detect it
      if (!location) {
        location = await this.detectUserLocation();
        
        if (location) {
          // Save detected location
          if (userId) {
            await this.saveUserLocation(userId, location);
          } else {
            this.saveGuestLocation(location);
          }
        }
      }

      return location || {
        country: 'Ghana',
        currency: 'USD'
      };
    } catch (error) {
      console.error('Error getting user location:', error);
      return {
        country: 'Ghana',
        currency: 'USD'
      };
    }
  }

  // Migrate guest location to user location when user logs in
  async migrateGuestLocationToUser(userId: string): Promise<void> {
    const guestLocation = this.loadGuestLocation();
    
    if (guestLocation) {
      await this.saveUserLocation(userId, guestLocation);
      // Clear guest location
      localStorage.removeItem(LocationService.LOCATION_STORAGE_KEY);
    }
  }
}

export const locationService = new LocationService();
