import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, ChevronLeft, Check, Play, Pause, ChevronDown, ChevronUp, Ruler, Thermometer, Droplets, Sparkles, Star } from 'lucide-react';
import { storeAPI } from '../../services/api';
import { formatCurrency } from '../../utils/nigeriaStates';
import { useCart } from '../../context/CartContext';

const WARMTH_LABELS = {
  1: { label: 'Very Light', desc: 'Perfect for AC & cool indoor settings', color: 'bg-sky-100 text-sky-700' },
  2: { label: 'Light', desc: 'Breezy evening layering', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'All-Season', desc: 'Harmattan mornings & cool office air', color: 'bg-green-100 text-green-700' },
  4: { label: 'Warm', desc: 'Cold nights & travel', color: 'bg-amber-100 text-amber-700' },
  5: { label: 'Very Warm', desc: 'Maximum cozy — heavy winter weight', color: 'bg-red-100 text-red-700' },
};

const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left font-semibold text-gray-900 hover:text-primary transition"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-primary" />}
          {title}
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="pb-5 text-gray-600 leading-relaxed">{children}</div>}
    </div>
  );
};

const WarmthMeter = ({ level }) => {
  if (!level) return null;
  const info = WARMTH_LABELS[level];
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <Thermometer size={16} className="text-primary" /> Warmth Rating
        </span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${info.color}`}>{info.label}</span>
      </div>
      <div className="flex gap-1.5 mb-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i <= level ? 'bg-primary' : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-500">{info.desc}</p>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartItem } = useCart();
  const videoRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => { fetchProduct(); }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await storeAPI.getProduct(id);
      const productData = response.data.data;
      setProduct(productData);
      const inStockVariant = productData.variants?.find(v => v.stock > 0);
      if (inStockVariant) setSelectedVariant(inStockVariant);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
    setAddedToCart(false);
  };

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoPlaying) { videoRef.current.pause(); setVideoPlaying(false); }
    else { videoRef.current.play(); setVideoPlaying(true); }
  };

  const cartItem = selectedVariant ? getCartItem(product?._id, selectedVariant?._id) : null;
  const maxQuantity = selectedVariant ? selectedVariant.stock - (cartItem?.quantity || 0) : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="animate-pulse"><div className="bg-gray-200 aspect-[3/4] rounded-2xl" /></div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <button onClick={() => navigate('/shop')} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition mt-4">
          <ChevronLeft size={20} /> Back to Shop
        </button>
      </div>
    );
  }

  const sizes = [...new Set(product.variants?.map(v => v.size) || [])];
  const colors = [...new Set(product.variants?.map(v => v.color) || [])];
  const allMedia = [...(product.images || [])];

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* ── MEDIA COLUMN ── */}
          <div>
            <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-[4/5] mb-4 relative">
              {showVideo && product.videoUrl ? (
                <div className="relative w-full h-full bg-black">
                  <video
                    ref={videoRef}
                    src={product.videoUrl}
                    className="w-full h-full object-contain"
                    loop
                    playsInline
                    onEnded={() => setVideoPlaying(false)}
                  />
                  <button
                    onClick={toggleVideo}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className={`w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center transition-opacity ${videoPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                      {videoPlaying ? <Pause className="text-white" size={28} /> : <Play className="text-white ml-1" size={28} />}
                    </div>
                  </button>
                </div>
              ) : (
                allMedia[selectedMedia] ? (
                  <img src={allMedia[selectedMedia].url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingBag size={80} />
                  </div>
                )
              )}
            </div>

            {/* Thumbnails + Video toggle */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allMedia.map((media, index) => (
                <button
                  key={media._id || index}
                  onClick={() => { setSelectedMedia(index); setShowVideo(false); }}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${selectedMedia === index && !showVideo ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={media.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {product.videoUrl && (
                <button
                  onClick={() => { setShowVideo(true); setTimeout(toggleVideo, 100); }}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 flex items-center justify-center transition ${showVideo ? 'border-primary bg-primary/10' : 'border-transparent bg-gray-100 hover:border-gray-300'}`}
                  title="Play fabric drape video"
                >
                  <Play size={20} className={showVideo ? 'text-primary' : 'text-gray-500'} />
                </button>
              )}
            </div>
          </div>

          {/* ── INFO COLUMN ── */}
          <div>
            {product.knitGauge && (
              <span className="inline-block text-xs font-medium uppercase tracking-widest text-primary mb-3">{product.knitGauge}</span>
            )}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-4">{formatCurrency(product.price)}</p>

            {product.warmthLevel && (
              <div className="mb-6">
                <WarmthMeter level={product.warmthLevel} />
              </div>
            )}

            {/* Fiber Specs */}
            {(product.fiberComposition || product.knitGauge || product.careInstructions) && (
              <div className="bg-stone-50 rounded-xl p-4 mb-6 space-y-2">
                {product.fiberComposition && (
                  <div className="flex items-start gap-2 text-sm">
                    <Sparkles size={15} className="text-primary mt-0.5 flex-shrink-0" />
                    <span><span className="font-medium text-gray-900">Composition:</span> <span className="text-gray-600">{product.fiberComposition}</span></span>
                  </div>
                )}
                {product.knitGauge && (
                  <div className="flex items-start gap-2 text-sm">
                    <Ruler size={15} className="text-primary mt-0.5 flex-shrink-0" />
                    <span><span className="font-medium text-gray-900">Gauge:</span> <span className="text-gray-600">{product.knitGauge}</span></span>
                  </div>
                )}
                {product.careInstructions && (
                  <div className="flex items-start gap-2 text-sm">
                    <Droplets size={15} className="text-primary mt-0.5 flex-shrink-0" />
                    <span><span className="font-medium text-gray-900">Care:</span> <span className="text-gray-600">{product.careInstructions}</span></span>
                  </div>
                )}
              </div>
            )}

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Variant Selection */}
            {product.variants?.length > 0 && (
              <div className="space-y-5 mb-8">
                {sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Size</h3>
                      <Link to="/size-guide" className="text-sm text-primary hover:underline">Size Guide →</Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map(size => {
                        const variantsWithSize = product.variants.filter(v => v.size === size);
                        const hasStock = variantsWithSize.some(v => v.stock > 0);
                        const isSelected = selectedVariant?.size === size;
                        return (
                          <button
                            key={size}
                            onClick={() => {
                              const variant = variantsWithSize.find(v => v.stock > 0 && (selectedVariant?.color ? v.color === selectedVariant.color : true)) || variantsWithSize.find(v => v.stock > 0);
                              if (variant) handleVariantSelect(variant);
                            }}
                            disabled={!hasStock}
                            className={`min-w-[52px] px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition ${isSelected ? 'border-primary bg-primary text-white' : hasStock ? 'border-gray-200 hover:border-primary' : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'}`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {colors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Color: <span className="font-normal text-gray-600">{selectedVariant?.color}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(color => {
                        const variant = product.variants.find(v => v.color === color && (selectedVariant?.size ? v.size === selectedVariant.size : true) && v.stock > 0);
                        const hasStock = !!variant;
                        const isSelected = selectedVariant?.color === color;
                        return (
                          <button
                            key={color}
                            onClick={() => variant && handleVariantSelect(variant)}
                            disabled={!hasStock}
                            className={`px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition ${isSelected ? 'border-primary bg-primary text-white' : hasStock ? 'border-gray-200 hover:border-primary' : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'}`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedVariant && (
                  <p className="text-sm text-gray-500">
                    {selectedVariant.stock > 5
                      ? `${selectedVariant.stock} in stock`
                      : selectedVariant.stock > 0
                        ? `Only ${selectedVariant.stock} left!`
                        : 'Out of stock'}
                  </p>
                )}
              </div>
            )}

            {/* Quantity + Add to Cart */}
            {selectedVariant && selectedVariant.stock > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="p-3 hover:bg-gray-50 transition disabled:opacity-40"><Minus size={18} /></button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))} disabled={quantity >= maxQuantity} className="p-3 hover:bg-gray-50 transition disabled:opacity-40"><Plus size={18} /></button>
                  </div>
                  {cartItem && <span className="text-sm text-gray-500">{cartItem.quantity} already in cart</span>}
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={maxQuantity <= 0}
                  className={`w-full py-4 rounded-2xl font-semibold text-lg transition flex items-center justify-center gap-2 ${
                    addedToCart ? 'bg-green-500 text-white'
                    : maxQuantity <= 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20'
                  }`}
                >
                  {addedToCart ? (<><Check size={22} /> Added to Cart!</>) :
                   maxQuantity <= 0 ? 'Max in cart' :
                   (<><ShoppingBag size={22} /> Add to Cart — {formatCurrency(product.price * quantity)}</>)}
                </button>
              </div>
            )}

            {(!selectedVariant || selectedVariant.stock <= 0) && product.totalStock <= 0 && (
              <div className="bg-gray-100 rounded-2xl p-5 text-center mb-6">
                <p className="text-gray-600 font-medium">Currently out of stock</p>
                <p className="text-sm text-gray-400 mt-1">Check back soon or browse similar pieces</p>
              </div>
            )}

            {/* Care Badge */}
            <div className="border border-green-200 bg-green-50 rounded-xl p-3 mb-4 flex items-start gap-3">
              <span className="text-xl">🧵</span>
              <div>
                <p className="font-semibold text-green-800 text-sm">Care & De-Pilling Guide Included</p>
                <p className="text-green-700 text-xs mt-0.5">Every order comes with our complete knitwear care card to keep your piece fresh longer.</p>
              </div>
            </div>

            {/* Styling Tips */}
            {product.stylingTips?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> How to Style This Piece
                </h3>
                <div className="space-y-2">
                  {product.stylingTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-stone-50 rounded-lg px-3 py-2">
                      <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accordion sections */}
            <div className="mt-6">
              {product.measurements && (product.measurements.chest || product.measurements.length || product.measurements.sleeve) && (
                <AccordionSection title="Fit & Measurements" icon={Ruler} defaultOpen>
                  <div className="space-y-3">
                    {product.modelStats?.height && (
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">Model reference:</span> {product.modelStats.height} tall, wearing size {product.modelStats.sizeWorn}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      {product.measurements.chest && <div className="text-center bg-stone-50 rounded-xl p-3"><p className="text-xs text-gray-500 uppercase tracking-wide">Chest</p><p className="font-bold text-gray-900 text-lg mt-1">{product.measurements.chest}</p></div>}
                      {product.measurements.length && <div className="text-center bg-stone-50 rounded-xl p-3"><p className="text-xs text-gray-500 uppercase tracking-wide">Length</p><p className="font-bold text-gray-900 text-lg mt-1">{product.measurements.length}</p></div>}
                      {product.measurements.sleeve && <div className="text-center bg-stone-50 rounded-xl p-3"><p className="text-xs text-gray-500 uppercase tracking-wide">Sleeve</p><p className="font-bold text-gray-900 text-lg mt-1">{product.measurements.sleeve}</p></div>}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      <Link to="/size-guide" className="text-primary hover:underline">View our full size guide →</Link>
                    </p>
                  </div>
                </AccordionSection>
              )}

              <AccordionSection title="Shipping & Returns" icon={ShoppingBag}>
                <div className="space-y-2 text-sm">
                  <p>🚚 <strong>Delivery:</strong> 1–3 business days within Lagos; 3–7 days nationwide.</p>
                  <p>🔄 <strong>Returns:</strong> 7-day exchange window on unworn, undamaged pieces with tags intact.</p>
                  <p>📦 <strong>Packaging:</strong> Shipped in protective tissue wrapping to keep your knit in perfect condition.</p>
                  <p><Link to="/returns" className="text-primary hover:underline">Full return policy →</Link></p>
                </div>
              </AccordionSection>

              <AccordionSection title="Knitwear Care Instructions" icon={Droplets}>
                <div className="space-y-2 text-sm">
                  {product.careInstructions ? (
                    <p>{product.careInstructions}</p>
                  ) : (
                    <>
                      <p>🧊 Hand wash in cold water using a gentle detergent.</p>
                      <p>🛏 Dry flat in shade — never hang or wring.</p>
                      <p>🪮 Use a fabric shaver or de-pilling comb to restore smoothness.</p>
                      <p>📦 Store folded (not hung) to preserve the garment shape.</p>
                    </>
                  )}
                </div>
              </AccordionSection>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-20 border-t pt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah O.', title: 'Fits perfectly!', review: "I was skeptical about buying online, but this cardigan fits exactly as described. The material is so soft and it doesn't shrink after washing." },
              { name: 'Michael A.', title: 'Unbelievable quality', review: 'The cashmere blend feels extremely premium. It keeps me warm in the office AC without making me sweat outside. Definitely buying another color.' },
              { name: 'Chidinma E.', title: 'Fast delivery', review: 'Ordered on a Tuesday and it arrived by Thursday! The packaging was beautiful and the cardigan looks exactly like the pictures.' },
            ].map(({ name, title, review }) => (
              <div key={name} className="bg-stone-50 rounded-2xl p-6">
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{review}"</p>
                <p className="text-sm font-medium text-gray-900">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
