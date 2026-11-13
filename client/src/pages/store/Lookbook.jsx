import { useState, useEffect } from 'react';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storeAPI } from '../../services/api';
import { formatCurrency } from '../../utils/nigeriaStates';

const Lookbook = () => {
  const [lookbooks, setLookbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLookbook, setActiveLookbook] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState({});

  useEffect(() => {
    Promise.all([
      storeAPI.getLookbooks(),
      storeAPI.getProducts(),
    ]).then(([lbRes, prodRes]) => {
      const lbs = lbRes.data.data || [];
      const products = prodRes.data.data || [];
      setLookbooks(lbs);
      const productMap = {};
      lbs.forEach(lb => {
        if (lb.taggedProducts?.length) {
          productMap[lb._id] = lb.taggedProducts.map(pid => products.find(p => p._id === pid)).filter(Boolean);
        }
      });
      setRelatedProducts(productMap);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const gradients = [
    'from-amber-100 to-amber-200',
    'from-rose-100 to-rose-200',
    'from-sky-100 to-sky-200',
    'from-purple-100 to-purple-200',
    'from-green-100 to-green-200',
    'from-stone-100 to-stone-200',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-20 px-4 bg-stone-900 text-white text-center">
        <p className="text-sm uppercase tracking-widest text-primary/80 font-medium mb-4">Editorial</p>
        <h1 className="text-5xl font-bold mb-4">The Lookbook</h1>
        <p className="text-stone-400 max-w-xl mx-auto text-lg">
          One cardigan, infinite stories. Discover how to wear it your way.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse mb-6">
                <div className={`bg-gray-200 rounded-2xl ${i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]'}`} />
              </div>
            ))}
          </div>
        ) : lookbooks.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">📸</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500 mb-6">Our editorial lookbook is being styled. Check back soon!</p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition">
              Shop the Collection <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {lookbooks.map((lb, i) => (
              <div key={lb._id} className="break-inside-avoid mb-6">
                <button
                  onClick={() => setActiveLookbook(lb)}
                  className="group relative w-full overflow-hidden rounded-2xl block text-left"
                >
                  {lb.imageUrl ? (
                    <img
                      src={lb.imageUrl}
                      alt={lb.title}
                      className="w-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  ) : (
                    <div className={`w-full bg-gradient-to-br ${gradients[i % gradients.length]} aspect-[3/4] flex items-center justify-center`}>
                      <span className="text-6xl">👗</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-6">
                    <h3 className="text-white font-bold text-xl">{lb.title}</h3>
                    {lb.description && <p className="text-white/80 text-sm mt-1">{lb.description}</p>}
                    {relatedProducts[lb._id]?.length > 0 && (
                      <span className="mt-2 text-primary text-sm font-medium">Shop this look →</span>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shop the Look Modal */}
      {activeLookbook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setActiveLookbook(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{activeLookbook.title}</h2>
              <button onClick={() => setActiveLookbook(null)} className="text-gray-500 hover:text-gray-900 transition">
                <X size={24} />
              </button>
            </div>

            {activeLookbook.imageUrl && (
              <img src={activeLookbook.imageUrl} alt={activeLookbook.title} className="w-full max-h-72 object-cover" />
            )}

            <div className="p-6">
              {activeLookbook.description && (
                <p className="text-gray-600 leading-relaxed mb-6">{activeLookbook.description}</p>
              )}

              {activeLookbook.stylingTips?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Styling Tips</h3>
                  <ul className="space-y-2">
                    {activeLookbook.stylingTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-primary font-bold">{i + 1}.</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {relatedProducts[activeLookbook._id]?.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Shop This Look</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {relatedProducts[activeLookbook._id].map(product => (
                      <Link
                        key={product._id}
                        to={`/product/${product._id}`}
                        onClick={() => setActiveLookbook(null)}
                        className="group flex gap-3 items-center bg-stone-50 rounded-xl p-3 hover:bg-primary/5 transition"
                      >
                        <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition">{product.name}</p>
                          <p className="text-primary font-bold text-sm">{formatCurrency(product.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  to="/shop"
                  className="block w-full bg-primary text-white text-center py-3 rounded-xl font-semibold hover:bg-primary/90 transition mt-2"
                >
                  Browse the Collection
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lookbook;
