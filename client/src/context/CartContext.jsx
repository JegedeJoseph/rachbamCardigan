import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    // Load cart from localStorage on init
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Calculate totals
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (product, variant, quantity = 1) => {
    setItems(prevItems => {
      // Check if item with same product and variant exists
      const existingIndex = prevItems.findIndex(
        item => item.productId === product._id && item.variantId === variant._id
      );

      if (existingIndex >= 0) {
        // Update quantity
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      // Add new item
      return [...prevItems, {
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || null,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        quantity
      }];
    });
  };

  const updateQuantity = (productId, variantId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const removeFromCart = (productId, variantId) => {
    setItems(prevItems =>
      prevItems.filter(item => 
        !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (productId, variantId) => {
    return items.some(
      item => item.productId === productId && item.variantId === variantId
    );
  };

  const getCartItem = (productId, variantId) => {
    return items.find(
      item => item.productId === productId && item.variantId === variantId
    );
  };

  const value = {
    items,
    itemCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getCartItem
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
