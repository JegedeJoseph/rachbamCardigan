import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, ChevronLeft, Check } from 'lucide-react';
import { storeAPI } from '../../services/api';
import { formatCurrency } from '../../utils/nigeriaStates';
import { useCart } from '../../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, getCartItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await storeAPI.getProduct(id);
      const productData = response.data.data;
      setProduct(productData);
      
      // Auto-select first in-stock variant
      const inStockVariant = productData.variants?.find(v => v.stock > 0);
      if (inStockVariant) {
        setSelectedVariant(inStockVariant);
      }
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

  const cartItem = selectedVariant 
    ? getCartItem(product?._id, selectedVariant?._id) 
    : null;
  const maxQuantity = selectedVariant 
    ? selectedVariant.stock - (cartItem?.quantity || 0) 
    : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg" />
          </div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
        >
          <ChevronLeft size={20} />
          Back to Shop
        </button>
      </div>
    );
  }

  // Get unique sizes and colors
  const sizes = [...new Set(product.variants?.map(v => v.size) || [])];
  const colors = [...new Set(product.variants?.map(v => v.color) || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/shop')}
        className="inline-flex items-center gap-1 text-gray-600 hover:text-primary mb-6 transition"
      >
        <ChevronLeft size={20} />
        Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="bg-gray-100 aspect-square rounded-lg overflow-hidden mb-4">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ShoppingBag size={64} />
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={image._id}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary mb-4">
            {formatCurrency(product.price)}
          </p>
          
          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Variant Selection */}
          {product.variants?.length > 0 && (
            <div className="space-y-6 mb-8">
              {/* Size Selection */}
              {sizes.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const variantsWithSize = product.variants.filter(v => v.size === size);
                      const hasStock = variantsWithSize.some(v => v.stock > 0);
                      const isSelected = selectedVariant?.size === size;
                      
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            // Select first variant with this size
                            const variant = variantsWithSize.find(v => 
                              v.stock > 0 && (selectedVariant?.color ? v.color === selectedVariant.color : true)
                            ) || variantsWithSize.find(v => v.stock > 0);
                            if (variant) handleVariantSelect(variant);
                          }}
                          disabled={!hasStock}
                          className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : hasStock
                                ? 'border-gray-300 hover:border-primary'
                                : 'border-gray-200 text-gray-400 cursor-not-allowed line-through'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {colors.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const variant = product.variants.find(v => 
                        v.color === color && 
                        (selectedVariant?.size ? v.size === selectedVariant.size : true) &&
                        v.stock > 0
                      );
                      const hasStock = !!variant;
                      const isSelected = selectedVariant?.color === color;
                      
                      return (
                        <button
                          key={color}
                          onClick={() => variant && handleVariantSelect(variant)}
                          disabled={!hasStock}
                          className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : hasStock
                                ? 'border-gray-300 hover:border-primary'
                                : 'border-gray-200 text-gray-400 cursor-not-allowed line-through'
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock info */}
              {selectedVariant && (
                <p className="text-sm text-gray-500">
                  {selectedVariant.stock > 0 
                    ? `${selectedVariant.stock} in stock`
                    : 'Out of stock'
                  }
                </p>
              )}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {selectedVariant && selectedVariant.stock > 0 && (
            <div className="space-y-4">
              {/* Quantity */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                    className="p-2 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                {cartItem && (
                  <p className="text-sm text-gray-500 mt-2">
                    {cartItem.quantity} already in cart
                  </p>
                )}
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={maxQuantity <= 0}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2 ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : maxQuantity <= 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={24} />
                    Added to Cart!
                  </>
                ) : maxQuantity <= 0 ? (
                  'Max quantity in cart'
                ) : (
                  <>
                    <ShoppingBag size={24} />
                    Add to Cart - {formatCurrency(product.price * quantity)}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Out of stock message */}
          {(!selectedVariant || selectedVariant.stock <= 0) && product.totalStock <= 0 && (
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <p className="text-gray-600 font-medium">This product is currently out of stock</p>
            </div>
          )}

          {/* Key Benefits */}
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Key Benefits</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="text-primary flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-600"><strong>100% Premium Cashmere Blend:</strong> Luxuriously soft and breathable against the skin.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-primary flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-600"><strong>Perfect Fit Guarantee:</strong> Tailored to fit true to size without stretching out of shape.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-primary flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-600"><strong>All-Weather Comfort:</strong> Lightweight enough for warm days, yet insulating for cool evenings.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="text-primary flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-600"><strong>Durable Construction:</strong> Reinforced stitching for long-lasting wear.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Social Proof / Reviews */}
      <div className="mt-16 border-t pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Review 1 */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex text-yellow-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ))}
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Fits perfectly!</h4>
            <p className="text-gray-600 text-sm mb-4">"I was skeptical about buying clothes online, but this cardigan fits exactly as described. The material is so soft and it doesn't shrink after washing."</p>
            <p className="text-sm font-medium text-gray-900">— Sarah O.</p>
          </div>
          
          {/* Review 2 */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex text-yellow-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ))}
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Unbelievable quality</h4>
            <p className="text-gray-600 text-sm mb-4">"The cashmere blend feels extremely premium. It keeps me warm in the office AC without making me sweat outside. Definitely buying another color."</p>
            <p className="text-sm font-medium text-gray-900">— Michael A.</p>
          </div>

          {/* Review 3 */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex text-yellow-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ))}
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Fast delivery</h4>
            <p className="text-gray-600 text-sm mb-4">"Ordered on a Tuesday and it arrived by Thursday! The packaging was beautiful and the cardigan looks exactly like the pictures."</p>
            <p className="text-sm font-medium text-gray-900">— Chidinma E.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
