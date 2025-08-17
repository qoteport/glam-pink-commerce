
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import Index from '@/pages/Index';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Auth from '@/pages/Auth';
import Admin from '@/pages/Admin';
import Favorites from '@/pages/Favorites';
import CustomBraidedWigs from '@/pages/CustomBraidedWigs';
import WholesaleDeals from '@/pages/WholesaleDeals';
import PaymentCallback from '@/pages/PaymentCallback';
import MyOrders from '@/pages/MyOrders';
import ContactUs from '@/pages/ContactUs';
import ShippingInfo from '@/pages/ShippingInfo';
import ReturnsExchanges from '@/pages/ReturnsExchanges';
import FAQ from '@/pages/FAQ';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import './App.css';

// Create QueryClient outside of component to avoid recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/custom-braided-wigs" element={<CustomBraidedWigs />} />
                  <Route path="/wholesale-deals" element={<WholesaleDeals />} />
                  <Route path="/payment/callback" element={<PaymentCallback />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/shipping" element={<ShippingInfo />} />
                  <Route path="/returns" element={<ReturnsExchanges />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
