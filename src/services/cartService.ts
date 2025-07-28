
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

export interface PersistentCartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  selected_color?: string;
  selected_length?: string;
  created_at: string;
  updated_at: string;
}

class CartService {
  private static CART_STORAGE_KEY = 'hairytalesbeauty_cart';

  // Save cart to localStorage for guests
  saveGuestCart(items: CartItem[]): void {
    localStorage.setItem(CartService.CART_STORAGE_KEY, JSON.stringify(items));
  }

  // Load cart from localStorage for guests
  loadGuestCart(): CartItem[] {
    const stored = localStorage.getItem(CartService.CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Clear guest cart
  clearGuestCart(): void {
    localStorage.removeItem(CartService.CART_STORAGE_KEY);
  }

  // Save cart to database for authenticated users
  async saveUserCart(userId: string, items: CartItem[]): Promise<void> {
    try {
      // First, clear existing cart items for this user
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      // Then insert new items
      if (items.length > 0) {
        const cartItems = items.map(item => ({
          user_id: userId,
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          unit_price: item.price,
          selected_color: item.selectedColor,
          selected_length: item.selectedLength
        }));

        const { error } = await supabase
          .from('cart_items')
          .insert(cartItems);

        if (error) {
          console.error('Error saving cart to database:', error);
        }
      }
    } catch (error) {
      console.error('Error in saveUserCart:', error);
    }
  }

  // Load cart from database for authenticated users
  async loadUserCart(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading cart from database:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.product_id,
        name: item.product_name,
        price: item.unit_price,
        image: item.product_image,
        quantity: item.quantity,
        selectedColor: item.selected_color,
        selectedLength: item.selected_length
      }));
    } catch (error) {
      console.error('Error in loadUserCart:', error);
      return [];
    }
  }

  // Clear user cart from database
  async clearUserCart(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing cart from database:', error);
      }
    } catch (error) {
      console.error('Error in clearUserCart:', error);
    }
  }

  // Migrate guest cart to user cart when user logs in
  async migrateGuestCartToUser(userId: string): Promise<CartItem[]> {
    const guestCart = this.loadGuestCart();
    
    if (guestCart.length > 0) {
      // Load existing user cart
      const userCart = await this.loadUserCart(userId);
      
      // Merge guest cart with user cart
      const mergedCart = this.mergeCartItems(userCart, guestCart);
      
      // Save merged cart
      await this.saveUserCart(userId, mergedCart);
      
      // Clear guest cart
      this.clearGuestCart();
      
      return mergedCart;
    }
    
    return await this.loadUserCart(userId);
  }

  // Helper to merge cart items
  private mergeCartItems(userCart: CartItem[], guestCart: CartItem[]): CartItem[] {
    const merged = [...userCart];
    
    guestCart.forEach(guestItem => {
      const existingIndex = merged.findIndex(item => 
        item.id === guestItem.id && 
        item.selectedColor === guestItem.selectedColor && 
        item.selectedLength === guestItem.selectedLength
      );
      
      if (existingIndex >= 0) {
        // Add quantities if item exists
        merged[existingIndex].quantity += guestItem.quantity;
      } else {
        // Add new item
        merged.push(guestItem);
      }
    });
    
    return merged;
  }
}

export const cartService = new CartService();
