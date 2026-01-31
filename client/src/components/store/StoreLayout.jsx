import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import Cart from './Cart';

const StoreLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Naira Cardigans
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === to ? 'text-primary' : 'text-gray-700'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right side - Cart & Mobile menu */}
            <div className="flex items-center gap-4">
              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-primary transition-colors"
              >
                <ShoppingBag size={24} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === to ? 'text-primary' : 'text-gray-700'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Naira Cardigans</h3>
              <p className="text-gray-400">
                Premium quality cardigans for the modern Nigerian. 
                Style meets comfort.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/shop" className="text-gray-400 hover:text-white transition">Shop</Link></li>
                <li><Link to="/track-order" className="text-gray-400 hover:text-white transition">Track Order</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@nairacardigans.com</li>
                <li>Phone: +234 XXX XXX XXXX</li>
                <li>Lagos, Nigeria</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Naira Cardigans. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default StoreLayout;
