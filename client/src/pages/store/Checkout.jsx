import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Truck, CreditCard, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { storeAPI } from '../../services/api';
import { formatCurrency, NIGERIA_STATES } from '../../utils/nigeriaStates';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  
  const [step, setStep] = useState(1); // 1: Info, 2: Shipping, 3: Payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    fetchShippingRates();
  }, []);

  useEffect(() => {
    // Auto-select shipping when state changes
    if (formData.state && shippingRates.length > 0) {
      const rate = shippingRates.find(r => r.state === formData.state);
      setSelectedShipping(rate || null);
    }
  }, [formData.state, shippingRates]);

  const fetchShippingRates = async () => {
    try {
      const response = await storeAPI.getShippingRates();
      setShippingRates(response.data.data);
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      if (!formData.name.trim()) return 'Name is required';
      if (!formData.email.trim()) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email format';
      if (!formData.phone.trim()) return 'Phone number is required';
    }
    if (stepNum === 2) {
      if (!formData.address.trim()) return 'Address is required';
      if (!formData.city.trim()) return 'City is required';
      if (!formData.state) return 'State is required';
      if (!selectedShipping) return 'Shipping not available to selected state';
    }
    return null;
  };

  const handleNextStep = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await storeAPI.createOrder({
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity
        })),
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state
        }
      });

      // Store order info for confirmation page
      localStorage.setItem('pendingOrder', JSON.stringify({
        orderNumber: response.data.data.orderNumber,
        reference: response.data.data.reference
      }));

      // Clear cart
      clearCart();

      // Redirect to Paystack
      window.location.href = response.data.data.authorizationUrl;

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.response?.data?.message || 'Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = subtotal + (selectedShipping?.rate || 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some items to your cart to checkout</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
        >
          <ShoppingBag size={20} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-primary mb-6 transition"
      >
        <ChevronLeft size={20} />
        Continue Shopping
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[
          { num: 1, label: 'Information', icon: ShoppingBag },
          { num: 2, label: 'Shipping', icon: Truck },
          { num: 3, label: 'Payment', icon: CreditCard },
        ].map(({ num, label, icon: Icon }, index) => (
          <div key={num} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                step >= num
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline font-medium">{label}</span>
            </div>
            {index < 2 && (
              <div className={`w-8 sm:w-16 h-0.5 ${step > num ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Step 1: Customer Information */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 08012345678"
                  />
                </div>
              </div>
              <button
                onClick={handleNextStep}
                className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                Continue to Shipping
              </button>
            </div>
          )}

          {/* Step 2: Shipping */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {NIGERIA_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {selectedShipping && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-green-800">Shipping to {formData.state}</p>
                        <p className="text-sm text-green-600">{selectedShipping.estimatedDays}</p>
                      </div>
                      <p className="font-semibold text-green-800">{formatCurrency(selectedShipping.rate)}</p>
                    </div>
                  </div>
                )}
                {formData.state && !selectedShipping && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">Shipping not available to {formData.state} yet</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!selectedShipping}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Review & Pay</h2>
              
              {/* Order Summary */}
              <div className="border-b pb-4 mb-4">
                <h3 className="font-medium mb-3">Customer</h3>
                <p className="text-gray-600">{formData.name}</p>
                <p className="text-gray-600">{formData.email}</p>
                <p className="text-gray-600">{formData.phone}</p>
              </div>
              
              <div className="border-b pb-4 mb-4">
                <h3 className="font-medium mb-3">Shipping Address</h3>
                <p className="text-gray-600">{formData.address}</p>
                <p className="text-gray-600">{formData.city}, {formData.state}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-800">
                  <CreditCard size={20} />
                  <span className="font-medium">Secure Payment via Paystack</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  You'll be redirected to Paystack to complete your payment securely.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map(item => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.size} / {item.color}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-sm">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{selectedShipping ? formatCurrency(selectedShipping.rate) : '-'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
