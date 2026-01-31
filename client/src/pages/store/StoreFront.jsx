import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { storeAPI } from '../../services/api';
import { formatCurrency } from '../../utils/nigeriaStates';

const StoreFront = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await storeAPI.getProducts();
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Premium Cardigans
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our collection of high-quality cardigans, 
            crafted for comfort and style. Perfect for the Nigerian weather.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cardigans..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No products found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery ? 'Try a different search term' : 'Check back later for new arrivals'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="group"
              >
                <div className="bg-gray-100 aspect-square rounded-lg overflow-hidden mb-4">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag size={48} />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-primary font-semibold mt-1">
                  {formatCurrency(product.price)}
                </p>
                {product.totalStock > 0 ? (
                  <p className="text-sm text-gray-500 mt-1">
                    {product.variants?.length} variant{product.variants?.length !== 1 ? 's' : ''} available
                  </p>
                ) : (
                  <p className="text-sm text-red-500 mt-1">Out of stock</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧵</span>
              </div>
              <h3 className="font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">Crafted with the finest materials for lasting comfort</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-semibold mb-2">Nationwide Delivery</h3>
              <p className="text-gray-600">Fast shipping to all 36 states in Nigeria</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Safe and easy payment via Paystack</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StoreFront;
