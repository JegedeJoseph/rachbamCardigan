import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { storeAPI } from '../../services/api';
import { formatCurrency } from '../../utils/nigeriaStates';

const CATEGORIES = [
  { name: 'Chunky Knits', emoji: '🧶', desc: 'Bold textures for cool evenings', filter: 'Chunky / Heavyweight', color: 'from-amber-50 to-amber-100' },
  { name: 'Cropped Cardigans', emoji: '✂️', desc: 'Modern cuts, versatile styling', filter: 'crop', color: 'from-rose-50 to-rose-100' },
  { name: 'Duster Lengths', emoji: '🌊', desc: 'Effortlessly draped, floor-to-mid', filter: 'duster', color: 'from-sky-50 to-sky-100' },
  { name: 'Cashmere Essentials', emoji: '✨', desc: 'Ultra-soft premium fibers', filter: 'cashmere', color: 'from-purple-50 to-purple-100' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [lookbooks, setLookbooks] = useState([]);
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);

  const DEFAULT_HERO_VIDEO = 'https://cdn.coverr.co/videos/coverr-woman-in-a-knit-sweater-walking-outdoors-5134/1080p.mp4';
  const DEFAULT_HERO_POSTER = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1920&auto=format&fit=crop';

  useEffect(() => {
    Promise.all([
      storeAPI.getProducts().catch(() => ({ data: { data: [] } })),
      storeAPI.getLookbooks().catch(() => ({ data: { data: [] } })),
    ]).then(([productsRes, lookbooksRes]) => {
      const products = productsRes.data.data || [];
      const featured = products.filter(p => p.featured);
      setFeaturedProducts(featured.slice(0, 4));
      setLookbooks((lookbooksRes.data.data || []).slice(0, 3));

      // Dynamically use video from featured product, any cardigan video, or fallback loop
      const productWithVideo = featured.find(p => p.videoUrl) || products.find(p => p.videoUrl);
      if (productWithVideo?.videoUrl) {
        setHeroVideoUrl(productWithVideo.videoUrl);
      } else {
        setHeroVideoUrl(DEFAULT_HERO_VIDEO);
      }

      setLoading(false);
    });
  }, []);

  const scrollToContent = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO WITH VIDEO LOOP BACKGROUND ── */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-stone-950">
        {/* Autoplaying, muted loop video */}
        <video
          key={heroVideoUrl || 'default'}
          autoPlay
          loop
          muted
          playsInline
          poster={DEFAULT_HERO_POSTER}
          className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none opacity-40 transition-opacity duration-1000"
        >
          {heroVideoUrl && <source src={heroVideoUrl} type="video/mp4" />}
        </video>

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/30" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-stone-950/40 to-stone-950/80 pointer-events-none" />

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.4em] text-primary/90 font-medium mb-6">
            Rachbam Cardigans
          </p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Wear What
            <span className="block text-primary">Tells Your Story</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-300 max-w-xl mx-auto mb-10 leading-relaxed">
            Handcrafted knitwear for the modern Nigerian wardrobe — 
            from harmattan layering to evening elegance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/90 transition-all hover:gap-3 shadow-lg shadow-primary/20"
            >
              Shop the Collection <ArrowRight size={20} />
            </Link>
            <Link
              to="/lookbook"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              View Lookbook
            </Link>
          </div>
        </div>
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition animate-bounce z-10"
          aria-label="Scroll down"
        >
          <ChevronDown size={32} />
        </button>
      </section>

      {/* ── FEATURED CATEGORIES ── */}
      <section id="categories" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-widest text-primary font-medium mb-3">Browse By Style</p>
          <h2 className="text-4xl font-bold text-gray-900">Find Your Fit</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?gauge=${encodeURIComponent(cat.filter)}`}
              className={`group relative bg-gradient-to-br ${cat.color} rounded-2xl p-6 md:p-8 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="text-4xl mb-4">{cat.emoji}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{cat.desc}</p>
              <ArrowRight className="mt-4 text-primary group-hover:translate-x-2 transition-transform" size={18} />
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      {!loading && featuredProducts.length > 0 && (
        <section className="py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">Hand-picked</p>
                <h2 className="text-4xl font-bold text-gray-900">Featured Pieces</h2>
              </div>
              <Link to="/shop" className="hidden sm:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
                View All <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product._id} to={`/product/${product._id}`} className="group">
                  <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                    {product.images?.[0] ? (
                      <>
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
                        />
                        {(product.hoverImageUrl || product.images[1]) && (
                          <img
                            src={product.hoverImageUrl || product.images[1]?.url}
                            alt={product.name + ' hover'}
                            className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🧶</div>
                    )}
                    {product.knitGauge && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-medium px-2 py-1 rounded-full text-gray-700">
                        {product.knitGauge.split('/')[0].trim()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-primary font-bold mt-1">{formatCurrency(product.price)}</p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10 sm:hidden">
              <Link to="/shop" className="inline-flex items-center gap-2 text-primary font-medium border border-primary/30 px-6 py-3 rounded-full hover:bg-primary hover:text-white transition">
                View All Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── BRAND STORY / ETHICS ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">Our Craft</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Every Stitch,<br />Intentionally Made
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Rachbam Cardigans began with one belief: Nigerian women deserve knitwear 
              made <em>for</em> their climate, their body, and their story — not repurposed 
              from cold-weather fashion houses.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Each piece is ethically sourced and hand-finished to ensure the kind of quality 
              that lasts seasons, not trends. We use breathable fiber blends that layer 
              beautifully over harmattan mornings and transition seamlessly into 
              air-conditioned evenings.
            </p>
            <div className="flex gap-8">
              {[['🌿', 'Ethically Sourced'], ['✋', 'Hand-Finished'], ['🇳🇬', 'Made for Nigeria']].map(([icon, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xs font-medium text-gray-600 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
              <span className="text-7xl">🧶</span>
            </div>
            <div className="aspect-[3/4] bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl flex items-center justify-center mt-8">
              <span className="text-7xl">✨</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLIMATE GUIDE ── */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-3">Nigerian Climate Guide</p>
            <h2 className="text-3xl font-bold text-gray-900">What Works When?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Harmattan Season', desc: 'Chunky & medium-gauge cardigans are your best friend — warm enough for the dry dusty mornings, stylish enough for the office.', gauge: 'Chunky / Heavyweight', emoji: '🌬️', color: 'bg-amber-50 border-amber-200' },
              { title: 'AC Offices & Malls', desc: 'Fine-weight or medium-gauge pieces layer perfectly over your work outfit without bulk or overheating when you step outside.', gauge: 'Fine / Lightweight', emoji: '❄️', color: 'bg-blue-50 border-blue-200' },
              { title: 'Evening & Events', desc: 'Duster and cashmere-blend cardigans drape beautifully and photograph well — ideal for aso-ebi style layering.', gauge: 'Medium / All-Season', emoji: '🌙', color: 'bg-purple-50 border-purple-200' },
            ].map((item) => (
              <Link
                key={item.title}
                to={`/shop?gauge=${encodeURIComponent(item.gauge)}`}
                className={`${item.color} border rounded-2xl p-6 hover:shadow-md transition group`}
              >
                <div className="text-3xl mb-4">{item.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.desc}</p>
                <span className="text-primary text-sm font-medium group-hover:underline">Shop {item.gauge.split('/')[0].trim()} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOOKBOOK TEASER ── */}
      {lookbooks.length > 0 && (
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">Editorial</p>
              <h2 className="text-4xl font-bold text-gray-900">Style It Your Way</h2>
            </div>
            <Link to="/lookbook" className="hidden sm:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
              Full Lookbook <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lookbooks.map((lb, i) => (
              <Link key={lb._id} to="/lookbook" className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100 block">
                {lb.imageUrl ? (
                  <img src={lb.imageUrl} alt={lb.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${i % 2 === 0 ? 'bg-gradient-to-br from-amber-100 to-amber-200' : 'bg-gradient-to-br from-purple-100 to-purple-200'}`}>
                    <span className="text-6xl">👗</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-xl">{lb.title}</h3>
                  {lb.description && <p className="text-white/80 text-sm mt-1">{lb.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── TRUST STRIP ── */}
      <section className="py-16 border-t border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              ['🚚', 'Nationwide Delivery', 'All 36 states covered'],
              ['🔄', 'Easy Returns', '7-day exchange policy'],
              ['🛡️', 'Secure Payment', 'Protected by Paystack'],
              ['🧵', 'Quality Promise', 'Hand-finished knitwear'],
            ].map(([icon, title, sub]) => (
              <div key={title}>
                <div className="text-3xl mb-2">{icon}</div>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-gray-500 text-sm mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
