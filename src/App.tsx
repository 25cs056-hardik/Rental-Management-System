import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { DataProvider } from "@/contexts/DataContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Auth Pages
import AuthPage from "@/pages/auth/AuthPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

// App Pages
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ProductsPage from "@/pages/products/ProductsPage";
import OrdersPage from "@/pages/orders/OrdersPage";
import MyOrdersPage from "@/pages/orders/MyOrdersPage";
import QuotationsPage from "@/pages/quotations/QuotationsPage";
import InvoicesPage from "@/pages/invoices/InvoicesPage";
import ShopPage from "@/pages/shop/ShopPage";
import CartPage from "@/pages/cart/CartPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import VendorApplicationPage from "@/pages/vendor/VendorApplicationPage";
import AdminApplicationPage from "@/pages/admin/AdminApplicationPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'customer' ? '/shop' : '/dashboard'} replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
      <Route path="/quotations" element={<ProtectedRoute><QuotationsPage /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
      <Route path="/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/vendor" element={<ProtectedRoute><VendorApplicationPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminApplicationPage /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      
      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
