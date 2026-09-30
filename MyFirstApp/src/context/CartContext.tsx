import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
};

type CartItem = Product & {
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  isLoaded: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
  promoCode: string | null;
  discountAmount: number;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

const CART_STORAGE_KEY = '@myfirstapp_cart';

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);

  // Load cart from AsyncStorage when app starts
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(
          CART_STORAGE_KEY
        );

        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.log('Failed to load cart:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCart();
  }, []);

  // Sync with Backend API when token is present
  useEffect(() => {
    if (token) {
      refreshCart();
    }
  }, [token]);

  const refreshCart = async () => {
    if (!token) return;
    try {
      const res = await cartApi.getCart();
      if (res && Array.isArray(res.items)) {
        const backendItems: CartItem[] = res.items.map((it) => ({
          id: it.product.id,
          name: it.product.name,
          price: it.product.price,
          category: it.product.category,
          image: it.product.image,
          quantity: it.quantity,
        }));
        setCart(backendItems);
      }
    } catch (err) {
      console.log('Backend cart sync note (offline/guest):', err);
    }
  };

  // Save cart whenever cart changes
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify(cart)
        );
      } catch (error) {
        console.log('Failed to save cart:', error);
      }
    };

    saveCart();
  }, [cart, isLoaded]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const qtyToAdd = quantity > 0 ? quantity : 1;

    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + qtyToAdd,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: qtyToAdd,
        },
      ];
    });

    if (token) {
      cartApi.addItem(product.id, qtyToAdd).catch((err) =>
        console.log('Backend addItem error:', err)
      );
    }
  };

  const removeFromCart = (id: string) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );

    if (token) {
      cartApi.removeItem(id).catch((err) =>
        console.log('Backend removeItem error:', err)
      );
    }
  };

  const increaseQuantity = (id: string) => {
    let newQty = 1;
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id === id) {
          newQty = item.quantity + 1;
          return {
            ...item,
            quantity: newQty,
          };
        }
        return item;
      })
    );

    if (token) {
      cartApi.updateItem(id, newQty).catch((err) =>
        console.log('Backend updateItem error:', err)
      );
    }
  };

  const decreaseQuantity = (id: string) => {
    let newQty = 0;
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id === id) {
            newQty = item.quantity - 1;
            return {
              ...item,
              quantity: newQty,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );

    if (token) {
      if (newQty <= 0) {
        cartApi.removeItem(id).catch((err) =>
          console.log('Backend removeItem error:', err)
        );
      } else {
        cartApi.updateItem(id, newQty).catch((err) =>
          console.log('Backend updateItem error:', err)
        );
      }
    }
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode(null);

    if (token) {
      cartApi.clearCart().catch((err) =>
        console.log('Backend clearCart error:', err)
      );
    }
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cart.reduce((total, item) => {
    const price = Number(
      item.price.replace(/[₹,]/g, '')
    );

    return total + price * item.quantity;
  }, 0);

  // Promo code calculations
  let discountAmount = 0;
  if (promoCode === 'SAVE10') {
    discountAmount = Math.round(totalPrice * 0.10);
  } else if (promoCode === 'SAVE20') {
    discountAmount = Math.round(totalPrice * 0.20);
  } else if (promoCode === 'FLAT200') {
    discountAmount = totalPrice >= 1000 ? 200 : Math.min(totalPrice, 200);
  }

  const applyPromoCode = (code: string) => {
    const upperCode = code.trim().toUpperCase();

    if (upperCode === 'SAVE10') {
      setPromoCode('SAVE10');
      return {
        success: true,
        message: '10% discount applied!',
      };
    }

    if (upperCode === 'SAVE20') {
      if (totalPrice < 1500) {
        return {
          success: false,
          message: 'Min order of ₹1,500 required for SAVE20.',
        };
      }
      setPromoCode('SAVE20');
      return {
        success: true,
        message: '20% discount applied!',
      };
    }

    if (upperCode === 'FLAT200') {
      if (totalPrice < 1000) {
        return {
          success: false,
          message: 'Min order of ₹1,000 required for FLAT200.',
        };
      }
      setPromoCode('FLAT200');
      return {
        success: true,
        message: '₹200 flat discount applied!',
      };
    }

    return {
      success: false,
      message: 'Invalid promo code. Try SAVE10 or FLAT200.',
    };
  };

  const removePromoCode = () => {
    setPromoCode(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoaded,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartCount,
        totalPrice,
        promoCode,
        discountAmount,
        applyPromoCode,
        removePromoCode,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider'
    );
  }

  return context;
}