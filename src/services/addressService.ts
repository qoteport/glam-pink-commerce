
import { supabase } from '@/integrations/supabase/client';

interface UserAddress {
  id?: string;
  user_id?: string;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default?: boolean;
}

class AddressService {
  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    
    if (error) {
      console.error('Error fetching user addresses:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      ...item,
      type: item.type as 'shipping' | 'billing'
    }));
  }

  async getDefaultAddress(userId: string, type: 'shipping' | 'billing' = 'shipping'): Promise<UserAddress | null> {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('is_default', true)
      .single();
    
    if (error) {
      console.error('Error fetching default address:', error);
      return null;
    }
    
    return data ? {
      ...data,
      type: data.type as 'shipping' | 'billing'
    } : null;
  }

  async saveAddress(address: UserAddress): Promise<{ success: boolean; data?: UserAddress }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false };
    }

    const addressData = {
      ...address,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    if (address.id) {
      // Update existing address
      const { data, error } = await supabase
        .from('user_addresses')
        .update(addressData)
        .eq('id', address.id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating address:', error);
        return { success: false };
      }
      
      return { 
        success: true, 
        data: data ? {
          ...data,
          type: data.type as 'shipping' | 'billing'
        } : undefined
      };
    } else {
      // Create new address
      const { data, error } = await supabase
        .from('user_addresses')
        .insert(addressData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating address:', error);
        return { success: false };
      }
      
      return { 
        success: true, 
        data: data ? {
          ...data,
          type: data.type as 'shipping' | 'billing'
        } : undefined
      };
    }
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<boolean> {
    // First, unset all default addresses for this user
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
    
    // Then set the new default
    const { error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error setting default address:', error);
      return false;
    }
    
    return true;
  }

  async deleteAddress(addressId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting address:', error);
      return false;
    }
    
    return true;
  }
}

export const addressService = new AddressService();
export type { UserAddress };
