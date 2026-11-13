import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import Cart from './Cart';

const StoreLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { itemCount } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isHelpActive = ['/size-guide', '/returns', '/faq', '/track-order'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Rachbam <span className="text-primary">Cardigans</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-gray-700'}`}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/shop') ? 'text-primary' : 'text-gray-700'}`}
              >
                Shop
              </Link>
              <Link
                to="/lookbook"
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/lookbook') ? 'text-primary' : 'text-gray-700'}`}
              >
                Lookbook
              </Link>

              {/* Help dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setHelpOpen(true)}
                onMouseLeave={() => setHelpOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${isHelpActive ? 'text-primary' : 'text-gray-700'}`}
                >
                  Help <ChevronDown size={14} />
                </button>
                {helpOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <Link to="/size-guide" onClick={() => setHelpOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-stone-50 transition">Size Guide</Link>
                    <Link to="/returns" onClick={() => setHelpOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-stone-50 transition">Returns & Exchanges</Link>
                    <Link to="/faq" onClick={() => setHelpOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-stone-50 transition">FAQ</Link>
                    <Link to="/track-order" onClick={() => setHelpOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-stone-50 transition">Track Order</Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Right: cart + mobile */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-primary transition-colors"
                aria-label="Open cart"
              >
                <ShoppingBag size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-100 space-y-1">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/lookbook', label: 'Lookbook' },
                { to: '/size-guide', label: 'Size Guide' },
                { to: '/returns', label: 'Returns & Exchanges' },
                { to: '/faq', label: 'FAQ' },
                { to: '/track-order', label: 'Track Order' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 px-2 text-sm font-medium rounded-lg transition-colors hover:text-primary hover:bg-stone-50 ${isActive(to) ? 'text-primary' : 'text-gray-700'}`}
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
      <footer className="bg-stone-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold mb-3">
                Rachbam <span className="text-primary">Cardigans</span>
              </h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Premium knitwear crafted for the modern Nigerian wardrobe. Ethically sourced, hand-finished, and built to last.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><Link to="/shop" className="hover:text-white transition">All Cardigans</Link></li>
                <li><Link to="/shop?gauge=Chunky%20%2F%20Heavyweight" className="hover:text-white transition">Chunky Knits</Link></li>
                <li><Link to="/shop?gauge=Fine%20%2F%20Lightweight" className="hover:text-white transition">Lightweight</Link></li>
                <li><Link to="/lookbook" className="hover:text-white transition">Lookbook</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><Link to="/size-guide" className="hover:text-white transition">Size Guide</Link></li>
                <li><Link to="/returns" className="hover:text-white transition">Returns & Exchanges</Link></li>
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link to="/track-order" className="hover:text-white transition">Track Order</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li>support@rachbamcardigans.com</li>
                <li>+234 XXX XXX XXXX</li>
                <li>Lagos, Nigeria</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-stone-500 text-sm">
            <p>© {new Date().getFullYear()} Rachbam Cardigans. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/returns" className="hover:text-white transition">Returns</Link>
              <Link to="/faq" className="hover:text-white transition">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default StoreLayout;
