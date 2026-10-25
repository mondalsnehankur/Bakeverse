import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart whenever authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchServerCart();
    } else {
      setItems([]);
      localStorage.removeItem('bakeverse_guest_cart');
    }
  }, [isAuthenticated]);

  const fetchServerCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.cart) {
        const formatted = res.data.cart.items
          .filter((i) => i.productId || i.isGiftBox || i.isCustom)
          .map((i) => {
            const product = i.productId && typeof i.productId === 'object' ? i.productId : null;
            const itemId = i._id?.toString?.() || i._id;
            const productId = product?._id?.toString?.() || product?._id || i.productId;
            return {
              ...i,
              _id: itemId,
              productId: i.isGiftBox || i.isCustom ? itemId : productId,
              product: product || null,
              name: i.name || product?.name || 'Artisan Treat',
              image: i.image || product?.image || '',
              price: Number(i.price ?? product?.price ?? 0),
              bakeryName: i.bakeryName || product?.bakeryName || 'Sweet Treats Studio',
              quantity: Number(i.quantity) || 1,
            };
          });
        setItems(formatted);
      }
    } catch (err) {
      console.warn('Could not fetch server cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) return false;
    const prodId = product._id || product.productId;

    if (isAuthenticated) {
      try {
        const res = await api.post('/cart', {
          productId: product.isCustom ? undefined : prodId,
          quantity,
          isCustom: Boolean(product.isCustom),
          is3DCake: Boolean(product.is3DCake),
          customCake3DParams: product.customCake3DParams,
          cakeConfig: product.cakeConfig,
          name: product.name,
          price: product.price,
          image: product.image,
          bakeryName: product.bakeryName,
          bakeryId: product.bakeryId,
        });
        if (res.data.success) {
          await fetchServerCart();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Failed to add to server cart:', err);
        throw new Error(err.response?.data?.message || 'Failed to add item to cart.');
      }
    } else {
      // Guest cart
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.productId === prodId);
        let updated;
        if (idx > -1) {
          updated = [...prev];
          updated[idx].quantity += quantity;
        } else {
          updated = [...prev, { productId: prodId, product, quantity }];
        }
        localStorage.setItem('bakeverse_guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
    return true;
  };

  const addGiftBoxToCart = async (giftBox) => {
    if (!isAuthenticated) return;
    if (isAuthenticated) {
      const res = await api.post('/cart/gift-box', { giftBox });
      if (res.data.success) await fetchServerCart();
      return;
    }

  };

  const updateGiftBoxInCart = async (itemId, giftBox) => {
    const selectedProducts = Array.isArray(giftBox?.products) ? giftBox.products : [];
    const price = selectedProducts.reduce((sum, product) => sum + Number(product.price || 0), 0) + 100;
    const updatedGiftBox = { ...giftBox, price };
    if (isAuthenticated) {
      const res = await api.put(`/cart/gift-box/${encodeURIComponent(itemId)}`, { giftBox: updatedGiftBox });
      if (!res.data.success) throw new Error(res.data.message || 'Gift box could not be updated.');
      await fetchServerCart();
      return true;
    }
    setItems((prev) => {
      const updated = prev.map((item) => item.productId === itemId
        ? {
          ...item,
          price,
          giftBox: updatedGiftBox,
          name: updatedGiftBox.boxName,
          image: updatedGiftBox.products[0]?.image || item.image,
        }
        : item);
      localStorage.setItem('bakeverse_guest_cart', JSON.stringify(updated));
      return updated;
    });
    return true;
  };

  const updateQuantity = async (productId, quantity) => {
    if (isAuthenticated) {
      try {
        const res = await api.put(`/cart/${productId}`, { quantity });
        if (res.data.success) {
          await fetchServerCart();
        }
      } catch (err) {
        console.error('Failed to update cart item:', err);
      }
    } else {
      setItems((prev) => {
        let updated;
        if (quantity <= 0) {
          updated = prev.filter((i) => i.productId !== productId);
        } else {
          updated = prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
        }
        localStorage.setItem('bakeverse_guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/cart/${productId}`);
        await fetchServerCart();
      } catch (err) {
        console.error('Failed to remove from cart:', err);
      }
    } else {
      setItems((prev) => {
        const updated = prev.filter((i) => i.productId !== productId);
        localStorage.setItem('bakeverse_guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
        setItems([]);
      } catch (err) {
        console.error('Failed to clear cart:', err);
      }
    } else {
      setItems([]);
      localStorage.removeItem('bakeverse_guest_cart');
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price ?? item.product?.price ?? 0);
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal: Math.round(subtotal * 100) / 100,
        loading,
        addToCart,
        addGiftBoxToCart,
        updateGiftBoxInCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchServerCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
