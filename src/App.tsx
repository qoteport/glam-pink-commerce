import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Shop from '@/pages/Shop';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Auth from '@/pages/Auth';
import MyOrders from '@/pages/MyOrders';
import Favorites from '@/pages/Favorites';
import ProductDetail from '@/pages/ProductDetail';
import CustomBraidedWigs from '@/pages/CustomBraidedWigs';
import WholesaleDeals from '@/pages/WholesaleDeals';
import ContactUs from '@/pages/ContactUs';
import FAQ from '@/pages/FAQ';
import ShippingInfo from '@/pages/ShippingInfo';
import ReturnsExchanges from '@/pages/ReturnsExchanges';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import NotFound from '@/pages/NotFound';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import Admin from '@/pages/Admin';
import ProtectedRoute from '@/components/ProtectedRoute';
import PaymentCallback from '@/pages/PaymentCallback';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import Profile from '@/pages/Profile';
import ScrollToTop from './components/scrollToTop';

const queryClient = new QueryClient()

function App() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen bg-white">
                <main id="app-scroll" className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/custom-braided-wigs" element={<CustomBraidedWigs />} />
                    <Route path="/wholesale-deals" element={<WholesaleDeals />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/shipping" element={<ShippingInfo />} />
                    <Route path="/returns" element={<ReturnsExchanges />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/payment-callback" element={<PaymentCallback />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
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
