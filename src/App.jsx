import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common User Components
import { Navbar } from './components/user/Navbar';
import { Footer } from './components/user/Footer';

// User Pages
import { LandingPage } from './pages/user/LandingPage';
import { CategoriesPage } from './pages/user/CategoriesPage';
import { GiftListingPage } from './pages/user/GiftListingPage';
import { GiftDetailsPage } from './pages/user/GiftDetailsPage';
import { CheckoutPage } from './pages/user/CheckoutPage';
import { OrdersPage } from './pages/user/OrdersPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { NotFound } from './pages/NotFound';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CategoriesManage } from './pages/admin/CategoriesManage';
import { GiftsManage } from './pages/admin/GiftsManage';
import { OrdersManage } from './pages/admin/OrdersManage';
import { UsersManage } from './pages/admin/UsersManage';
import { SettingsManage } from './pages/admin/SettingsManage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// User Storefront Layout Wrapper
const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          
          {/* Global Toast configuration */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '16px',
                background: '#1e293b',
                color: '#fff',
                fontSize: '12px',
                padding: '12px 18px'
              }
            }}
          />

          <Router>
            <ScrollToTop />
            <Routes>
              
              {/* User Side Routes */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="gifts" element={<GiftListingPage />} />
                <Route path="gifts/:id" element={<GiftDetailsPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Admin Panel Side Routes */}
              <Route path="/admin">
                <Route index element={<AdminDashboard />} />
                <Route path="categories" element={<CategoriesManage />} />
                <Route path="gifts" element={<GiftsManage />} />
                <Route path="orders" element={<OrdersManage />} />
                <Route path="users" element={<UsersManage />} />
                <Route path="settings" element={<SettingsManage />} />
              </Route>

            </Routes>
          </Router>

        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
