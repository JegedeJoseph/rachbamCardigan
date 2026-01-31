import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/nigeriaStates';

const Cart = ({ isOpen, onClose }) => {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Cart Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag size={20} />
            Your Cart ({itemCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag size={64} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm">Add some items to get started</p>
              <Link
                to="/shop"
                onClick={onClose}
                className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 bg-gray-50 rounded-lg p-3"
                >
                  {/* Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.size} / {item.color}
                    </p>
                    <p className="font-semibold text-primary mt-1">
                      {formatCurrency(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="p-1 border rounded hover:bg-gray-100 transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 border rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId, item.variantId)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with totals */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <p className="text-sm text-gray-500">
              Shipping calculated at checkout
            </p>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
