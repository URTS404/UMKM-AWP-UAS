import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { authAPI } from './utils/api';

// Layout components
import Layout from './components/Layout';

// Public pages
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Gallery from "@/pages/Gallery";
import Login from "@/pages/Login";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminOrders from "@/pages/admin/Orders";
import AdminFinance from "@/pages/admin/Finance";
import AdminInvoices from "@/pages/admin/Invoices";

// Protected route component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { login, logout, setLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user profile
      setLoading(true);
      authAPI.getProfile()
        .then(response => {
          if (response.success && response.user) {
            login(token, response.user);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [login, logout, setLoading]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="gallery" element={<Gallery />} />
          
          {/* Admin routes */}
          <Route path="admin" element={<ProtectedRoute requireAdmin />}> 
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="invoices" element={<AdminInvoices />} />
          </Route>
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<div className="text-center text-xl p-8">Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;