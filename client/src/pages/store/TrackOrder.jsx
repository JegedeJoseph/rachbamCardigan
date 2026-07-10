import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Search, Clock } from 'lucide-react';
import { storeAPI } from '../../services/api';
import { formatCurrency } from '../../utils/nigeriaStates';

const TrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('orderNumber')) {
      handleTrack(searchParams.get('orderNumber'));
    }
  }, [searchParams]);

  const handleTrack = async (searchOrderNumber) => {
    if (!searchOrderNumber) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await storeAPI.trackOrder(searchOrderNumber);
      setOrder(response.data.data);
      // Update URL without reloading
      setSearchParams({ orderNumber: searchOrderNumber });
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please check the order number and try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrack(orderNumber);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 min-h-[60vh]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-gray-600">Enter your order number to check the current status.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
        <div className="flex gap-2">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g., NC-XXX-YYY"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={20} />
            )}
            Track
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-8">
          {error}
        </div>
      )}

      {order && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-xl font-bold text-gray-900">{order.orderNumber}</p>
            </div>
            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              <p className="text-sm text-gray-500 mb-1">Order Date</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <h3 className="font-semibold text-lg mb-6 text-center">Order Status</h3>
          <div className="flex items-center justify-between mb-10">
            {[
              { status: 'pending', label: 'Order Placed', icon: Clock },
              { status: 'processing', label: 'Processing', icon: Package },
              { status: 'shipped', label: 'Shipped', icon: Truck },
              { status: 'delivered', label: 'Delivered', icon: CheckCircle },
            ].map(({ status, label, icon: Icon }, index) => {
              const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
              const currentStatusIndex = statusOrder.indexOf(order.orderStatus);
              const isPast = currentStatusIndex >= index;
              const isActive = order.orderStatus === status;
              
              return (
                <div key={status} className="flex-1 flex flex-col items-center relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors ${
                    isPast ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                  } ${isActive ? 'ring-4 ring-green-100' : ''}`}>
                    <Icon size={24} />
                  </div>
                  <p className={`text-sm mt-3 text-center ${isPast ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.size} / {item.color}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
