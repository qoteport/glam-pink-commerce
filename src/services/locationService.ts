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

  private isSecureContext(): boolean {
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  }

  saveGuestLocation(location: UserLocation): void {
    localStorage.setItem(LocationService.LOCATION_STORAGE_KEY, JSON.stringify(location));
  }

  loadGuestLocation(): UserLocation | null {
    const stored = localStorage.getItem(LocationService.LOCATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  async saveUserLocation(userId: string, location: UserLocation, retries = 3): Promise<void> {
    try {
      const { data: existingLocation } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', userId)
        .single();

      const operation = existingLocation
        ? supabase
            .from('user_locations')
            .update({
              ...location,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        : supabase
            .from('user_locations')
            .insert({ user_id: userId, ...location });

      const { error } = await operation;

      if (error) {
        if (retries > 0) {
          console.warn(`Retrying saveUserLocation (${retries} attempts left)...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.saveUserLocation(userId, location, retries - 1);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error saving user location:', error);
    }
  }

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

  private getBrowserLocation(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation || !this.isSecureContext()) {
        console.debug('Geolocation unavailable or non-secure context');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        () => resolve(null),
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  }

  private getCurrencyFromCountry(countryCode: string): string {
    const currencyMap: { [key: string]: string } = {
      'GH': 'GHS',
      'US': 'USD',
      'GB': 'GBP',
      'EU': 'EUR',
      'NG': 'NGN',
      'CA': 'CAD',
      'AU': 'AUD',
      'KE': 'KES',
      'ZA': 'ZAR'
    };
    return currencyMap[countryCode] || 'USD';
  }

  private getDefaultLocation(): UserLocation {
    return {
      country: 'USA',
      currency: 'USD'
    };
  }

  async detectUserLocation(): Promise<UserLocation | null> {
    try {
      // const position = await this.getBrowserLocation();

      const apiKey = import.meta.env.VITE_IP_GEOLOCATION_API_KEY;
      const url = apiKey
        ? `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`
        : 'https://ipapi.co/json/';
      const response = await fetch(url);
      const data = await response.json();

      if (data.error || !data.country_name){
        if (data.reason === 'RateLimited') {
          console.warn('IP API rate limit exceeded');
          return this.getDefaultLocation();
        }
        throw new Error(data.reason || 'Invalid IP API response');
      }

      const location: UserLocation = {
        country: data.country_name || 'Unknown',
        city: data.city || undefined,
        region: data.region || undefined,
        currency: this.getCurrencyFromCountry(data.country_code),
        timezone: data.timezone || undefined,
        // latitude: position?.coords.latitude || data.latitude || undefined,
        // longitude: position?.coords.longitude || data.longitude || undefined
      };

      return location;
    } catch (error) {
      console.error('Error detecting location:', error);
      return this.getDefaultLocation();
    }
  }

  async getUserLocation(userId?: string): Promise<UserLocation> {
    try {
      let location: UserLocation | null = null;

      if (userId) {
        location = await this.loadUserLocation(userId);
      } else {
        location = this.loadGuestLocation();
      }

      if (!location) {
        location = await this.detectUserLocation();
        if (location) {
          if (userId) {
            await this.saveUserLocation(userId, location);
          } else {
            this.saveGuestLocation(location);
          }
        }
      }

      return location || this.getDefaultLocation();
    } catch (error) {
      console.error('Error getting user location:', error);
      return this.getDefaultLocation();
    }
  }

  async migrateGuestLocationToUser(userId: string): Promise<void> {
    const guestLocation = this.loadGuestLocation();
    if (guestLocation) {
      await this.saveUserLocation(userId, guestLocation);
      localStorage.removeItem(LocationService.LOCATION_STORAGE_KEY);
      console.debug('Migrated guest location to user:', guestLocation);
    }
  }
}

export const locationService = new LocationService();