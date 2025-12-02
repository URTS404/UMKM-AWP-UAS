import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useCalculatorStore } from '../stores/calculatorStore';
import { useState } from 'react';
import { ShoppingCart, Calculator, User, LogOut, Menu, X } from 'lucide-react';
import CalculatorModal from './CalculatorModal';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { toggleCalculator } = useCalculatorStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemCount = getItemCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg font-bold text-lg">
                K-Pop Store 💜
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Home
              </Link>
              <Link to="/gallery" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Gallery
              </Link>
              
              {/* Calculator Button */}
              <button
                onClick={toggleCalculator}
                className="p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Calculator"
              >
                <Calculator size={20} />
              </button>

              {/* Cart Button */}
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 font-medium">
                    Hello, {user?.name}
                  </span>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700 transition-colors">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Calculator Button */}
              <button
                onClick={toggleCalculator}
                className="p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Calculator"
              >
                <Calculator size={20} />
              </button>

              {/* Mobile Cart Button */}
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-3">
                <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/gallery" className="text-gray-700 hover:text-purple-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Gallery
                </Link>
                
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span className="text-gray-700 font-medium">Hello, {user?.name}</span>
                    </div>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="bg-purple-600 text-white px-3 py-2 rounded-md text-center hover:bg-purple-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-center" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Calculator Modal */}
      <CalculatorModal />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg font-bold text-lg inline-block mb-4">
              K-Pop Store 💜
            </div>
            <p className="text-gray-600 mb-2">Your trusted K-Pop merchandise store</p>
            <p className="text-gray-500 text-sm">
              © 2024 K-Pop Merchandise Store. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}