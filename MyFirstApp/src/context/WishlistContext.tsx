import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../data/products';
import { wishlistApi } from '../services/api';
import { useAuth } from './AuthContext';

type WishlistContextType = {
  wishlist: Product[];
  isLoaded: boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<
  WishlistContextType | undefined
>(undefined);

const WISHLIST_STORAGE_KEY = '@myfirstapp_wishlist';

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from AsyncStorage first
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const savedWishlist = await AsyncStorage.getItem(
          WISHLIST_STORAGE_KEY
        );

        if (savedWishlist) {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWishlist)) {
            setWishlist(parsedWishlist);
          }
        }
      } catch (error) {
        console.log('Failed to load wishlist:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadWishlist();
  }, []);

  // Sync with Backend API when token is present
  useEffect(() => {
    if (token) {
      refreshWishlist();
    }
  }, [token]);

  const refreshWishlist = async () => {
    if (!token) return;
    try {
      const response = await wishlistApi.getWishlist();
      if (response && Array.isArray(response.items)) {
        setWishlist(response.items);
        await AsyncStorage.setItem(
          WISHLIST_STORAGE_KEY,
          JSON.stringify(response.items)
        );
      }
    } catch (err) {
      console.log('Could not sync wishlist with backend:', err);
    }
  };

  // Save wishlist to AsyncStorage on change
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const saveWishlist = async () => {
      try {
        await AsyncStorage.setItem(
          WISHLIST_STORAGE_KEY,
          JSON.stringify(wishlist)
        );
      } catch (error) {
        console.log('Failed to save wishlist:', error);
      }
    };

    saveWishlist();
  }, [wishlist, isLoaded]);

  // Add product
  const addToWishlist = async (product: Product) => {
    setWishlist((currentWishlist) => {
      const alreadyExists = currentWishlist.some(
        (item) => item.id === product.id
      );

      if (alreadyExists) {
        return currentWishlist;
      }

      return [...currentWishlist, product];
    });

    if (token) {
      try {
        const res = await wishlistApi.toggleWishlist(product.id);
        if (res?.items) setWishlist(res.items);
      } catch (err) {
        console.log('Backend add wishlist error:', err);
      }
    }
  };

  // Remove one product
  const removeFromWishlist = async (id: string) => {
    setWishlist((currentWishlist) =>
      currentWishlist.filter((item) => item.id !== id)
    );

    if (token) {
      try {
        const res = await wishlistApi.removeFromWishlist(id);
        if (res?.items) setWishlist(res.items);
      } catch (err) {
        console.log('Backend remove wishlist error:', err);
      }
    }
  };

  // Toggle Add / Remove
  const toggleWishlist = async (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);

    setWishlist((currentWishlist) => {
      if (exists) {
        return currentWishlist.filter((item) => item.id !== product.id);
      }
      return [...currentWishlist, product];
    });

    if (token) {
      try {
        const res = await wishlistApi.toggleWishlist(product.id);
        if (res?.items) setWishlist(res.items);
      } catch (err) {
        console.log('Backend toggle wishlist error:', err);
      }
    }
  };

  // Check product
  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id);
  };

  // Clear all
  const clearWishlist = async () => {
    setWishlist([]);
    await AsyncStorage.removeItem(WISHLIST_STORAGE_KEY);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoaded,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      'useWishlist must be used inside WishlistProvider'
    );
  }

  return context;
}