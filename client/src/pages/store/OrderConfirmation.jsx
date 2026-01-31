import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Package, Truck, ShoppingBag } from 'lucide-react';
import { storeAPI } from '../../services/api';
import { formatCurrency } from '../../utils/nigeriaStates';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (reference) {
      verifyPayment();
    } else {
      setLoading(false);
      setError('No order reference found');
    }
  }, [reference]);

  const verifyPayment = async () => {
    try {
      const response = await storeAPI.verifyPayment(reference);
      setOrder(response.data.data.order);
      setPaymentVerified(response.data.data.paymentVerified);
      
      // Clear pending order from localStorage
      localStorage.removeItem('pendingOrder');
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.response?.data?.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="text-green-500" size={64} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={64} />;
      case 'failed':
        return <XCircle className="text-red-500" size={64} />;
      default:
        return <Clock className="text-gray-500" size={64} />;
    }
  };

  const getStatusMessage = (paymentStatus, orderStatus) => {
    if (paymentStatus === 'verified') {
      return {
        title: 'Order Confirmed!',
        subtitle: 'Thank you for your purchase. Your order has been received.',
        color: 'text-green-600'
      };
    }
    if (paymentStatus === 'pending') {
      return {
        title: 'Payment Pending',
        subtitle: 'Your payment is being processed. Please wait...',
        color: 'text-yellow-600'
      };
    }
    return {
      title: 'Payment Failed',
      subtitle: 'There was an issue with your payment. Please try again.',
      color: 'text-red-600'
    };
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-600">Verifying your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <XCircle size={64} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
        >
          <ShoppingBag size={20} />
          Return to Shop
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusMessage(order?.paymentStatus, order?.orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Status Header */}
      <div className="text-center mb-8">
        {getStatusIcon(order?.paymentStatus)}
        <h1 className={`text-3xl font-bold mt-4 ${statusInfo.color}`}>
          {statusInfo.title}
        </h1>
        <p className="text-gray-600 mt-2">{statusInfo.subtitle}</p>
      </div>

      {/* Order Details */}
      {order && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Order Number */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-lg font-bold">{order.orderNumber}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          {paymentVerified && (
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold mb-4">Order Status</h3>
              <div className="flex items-center justify-between">
                {[
                  { status: 'processing', label: 'Processing', icon: Package },
                  { status: 'shipped', label: 'Shipped', icon: Truck },
                  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
                ].map(({ status, label, icon: Icon }, index) => {
                  const isActive = order.orderStatus === status;
                  const isPast = ['processing', 'shipped', 'delivered'].indexOf(order.orderStatus) >= index;
                  
                  return (
                    <div key={status} className="flex-1 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isPast ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <p className={`text-sm mt-2 ${isPast ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.size} / {item.color}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p className="text-gray-600">
              {order.customer?.name}<br />
              {order.shippingAddress?.address}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </p>
          </div>

          {/* Order Total */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link
          to="/shop"
          className="flex-1 text-center bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
        >
          Continue Shopping
        </Link>
        {order && (
          <Link
            to={`/track-order?orderNumber=${order.orderNumber}`}
            className="flex-1 text-center border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Track Order
          </Link>
        )}
      </div>

      {/* Support Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Questions about your order? Contact us at support@nairacardigans.com</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;
