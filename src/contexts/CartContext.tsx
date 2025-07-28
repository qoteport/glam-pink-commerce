
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cartService } from '@/services/cartService';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedLength?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number, selectedColor?: string, selectedLength?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Load cart when component mounts or user changes
  useEffect(() => {
    loadCart();
  }, [user]);

  // Save cart whenever items change
  useEffect(() => {
    if (!isLoading) {
      saveCart();
    }
  }, [items, user, isLoading]);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      if (user) {
        // For authenticated users, try to migrate guest cart first
        const userCart = await cartService.migrateGuestCartToUser(user.id);
        setItems(userCart);
      } else {
        // For guests, load from localStorage
        const guestCart = cartService.loadGuestCart();
        setItems(guestCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCart = async () => {
    try {
      if (user) {
        // Save to database for authenticated users
        await cartService.saveUserCart(user.id, items);
      } else {
        // Save to localStorage for guests
        cartService.saveGuestCart(items);
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (product: any, quantity = 1, selectedColor?: string, selectedLength?: string) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === product.id && 
        item.selectedColor === selectedColor && 
        item.selectedLength === selectedLength
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && 
          item.selectedColor === selectedColor && 
          item.selectedLength === selectedLength
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        selectedColor,
        selectedLength
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => {
      // Handle both simple id and composite key (id-color-length)
      const itemKey = `${item.id}-${item.selectedColor}-${item.selectedLength}`;
      return item.id !== id && itemKey !== id;
    }));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item => {
        // Handle both simple id and composite key (id-color-length)
        const itemKey = `${item.id}-${item.selectedColor}-${item.selectedLength}`;
        return (item.id === id || itemKey === id) ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = async () => {
    setItems([]);
    
    // Also clear from persistent storage
    try {
      if (user) {
        await cartService.clearUserCart(user.id);
      } else {
        cartService.clearGuestCart();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
