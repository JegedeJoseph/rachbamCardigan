import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ShoppingBag } from 'lucide-react';
import { storeAPI } from '../../services/api';
import { formatCurrency } from '../../utils/nigeriaStates';

const GAUGE_OPTIONS = ['Fine / Lightweight', 'Medium / All-Season', 'Chunky / Heavyweight'];
const FIBER_OPTIONS = ['Wool', 'Cotton', 'Cashmere', 'Acrylic', 'Blend'];
const WARMTH_LABELS = { 1: '❄️ Very Light', 2: '🌤 Light', 3: '☀️ All-Season', 4: '🍂 Warm', 5: '🔥 Very Warm' };

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const sizes = [...new Set(product.variants?.filter(v => v.stock > 0).map(v => v.size) || [])];
  const mainImage = product.images?.[0]?.url;
  const hoverImage = product.hoverImageUrl || product.images?.[1]?.url;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${product._id}`}>
        <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
          {mainImage ? (
            <>
              <img
                src={mainImage}
                alt={product.name}
                className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${hovered && hoverImage ? 'opacity-0' : 'opacity-100'}`}
              />
              {hoverImage && (
                <img
                  src={hoverImage}
                  alt={product.name + ' detail'}
                  className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={48} /></div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.knitGauge && (
              <span className="bg-white/90 backdrop-blur text-xs font-medium px-2 py-1 rounded-full text-gray-700">
                {product.knitGauge.split('/')[0].trim()}
              </span>
            )}
            {product.featured && (
              <span className="bg-primary text-white text-xs font-medium px-2 py-1 rounded-full">Featured</span>
            )}
          </div>

          {/* Quick size hover bar */}
          {hovered && sizes.length > 0 && (
            <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur p-3 flex gap-2 justify-center">
              <span className="text-xs text-gray-500 self-center">Quick add:</span>
              {sizes.slice(0, 5).map(size => (
                <button
                  key={size}
                  onClick={(e) => e.preventDefault()}
                  className="text-xs font-medium px-2 py-1 border border-gray-300 rounded hover:border-primary hover:text-primary transition"
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>
      </Link>

      <Link to={`/product/${product._id}`}>
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{product.name}</h3>
        {product.fiberComposition && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{product.fiberComposition}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-primary font-bold">{formatCurrency(product.price)}</p>
          {product.warmthLevel && (
            <span className="text-xs text-gray-500">{WARMTH_LABELS[product.warmthLevel]}</span>
          )}
        </div>
        {product.totalStock <= 0 && <p className="text-xs text-red-500 mt-1">Out of stock</p>}
      </Link>
    </div>
  );
};

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedGauges, setSelectedGauges] = useState([]);
  const [selectedFibers, setSelectedFibers] = useState([]);
  const [priceMax, setPriceMax] = useState('');

  useEffect(() => {
    storeAPI.getProducts()
      .then(res => setProducts(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
    const gaugeParam = searchParams.get('gauge');
    if (gaugeParam) setSelectedGauges([gaugeParam]);
  }, []);

  const toggleGauge = (g) => setSelectedGauges(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  const toggleFiber = (f) => setSelectedFibers(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  const activeFilterCount = selectedGauges.length + selectedFibers.length + (priceMax ? 1 : 0);
  const clearFilters = () => { setSelectedGauges([]); setSelectedFibers([]); setPriceMax(''); };

  const filtered = products
    .filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedGauges.length > 0 && !selectedGauges.includes(p.knitGauge)) return false;
      if (selectedFibers.length > 0 && !selectedFibers.some(f => p.fiberComposition?.toLowerCase().includes(f.toLowerCase()))) return false;
      if (priceMax && p.price > Number(priceMax)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-stone-50 border-b py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">Rachbam Cardigans</p>
          <h1 className="text-4xl font-bold text-gray-900">The Collection</h1>
          <p className="text-gray-500 mt-2">{filtered.length} piece{filtered.length !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search cardigans..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-medium transition ${filterOpen ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700 hover:border-primary'}`}
          >
            <Filter size={18} />
            Filters
            {activeFilterCount > 0 && (
              <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${filterOpen ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                {activeFilterCount}
              </span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-gray-700"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="bg-stone-50 rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Knit Weight</h4>
              <div className="space-y-2">
                {GAUGE_OPTIONS.map(g => (
                  <label key={g} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={selectedGauges.includes(g)} onChange={() => toggleGauge(g)} className="w-4 h-4 rounded accent-primary" />
                    <span className="text-sm text-gray-700 group-hover:text-primary transition">{g}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Fiber Content</h4>
              <div className="space-y-2">
                {FIBER_OPTIONS.map(f => (
                  <label key={f} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={selectedFibers.includes(f)} onChange={() => toggleFiber(f)} className="w-4 h-4 rounded accent-primary" />
                    <span className="text-sm text-gray-700 group-hover:text-primary transition">{f}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Max Price (₦)</h4>
              <input
                type="number"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/30 outline-none"
              />
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-3 text-sm text-red-500 hover:underline flex items-center gap-1">
                  <X size={14} /> Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={56} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No cardigans found</h3>
            <p className="text-gray-400 mt-2 mb-6">Try adjusting your filters or search term</p>
            <button onClick={clearFilters} className="text-primary underline">Reset filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
