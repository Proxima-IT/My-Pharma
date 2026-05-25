'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { wishlistApi } from '../api/wishlistApi';
import toast from 'react-hot-toast';

/**
 * Akkhar-Labs :: Wishlist Context
 * =================================
 * Global state orchestrator for user favorites.
 * Ensures UI consistency across all product card instances.
 */

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Check if we are in browser environment and have a token
  const hasToken = useCallback(() => {
    return (
      typeof window !== 'undefined' && !!localStorage.getItem('access_token')
    );
  }, []);

  const fetchWishlist = useCallback(async () => {
    if (!hasToken()) {
      setWishlistItems([]);
      setTotalCount(0);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch initial items (default pagination)
      const data = await wishlistApi.getWishlist({ page_size: 100 });
      setWishlistItems(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error('Wishlist context sync error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hasToken]);

  // Initial load
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /**
   * toggleWishlist
   * High-performance toggle logic. Uses the Product ID directly
   * to communicate with the specialized backend endpoint.
   */
  const toggleWishlist = async product => {
    if (!hasToken()) {
      toast.error('Please login to save favorites');
      return false;
    }

    const productId = product.id || product.product_id;
    const isCurrentlyIn = wishlistItems.some(
      item => item.product_id === productId,
    );

    try {
      if (isCurrentlyIn) {
        // Logic: Remove via specialized Product ID endpoint
        await wishlistApi.removeFromWishlistByProductId(productId);
        setWishlistItems(prev =>
          prev.filter(item => item.product_id !== productId),
        );
        setTotalCount(prev => Math.max(0, prev - 1));
        toast.success('Removed from wishlist');
      } else {
        // Logic: Add to wishlist
        const newItem = await wishlistApi.addToWishlist(productId);
        setWishlistItems(prev => [newItem, ...prev]);
        setTotalCount(prev => prev + 1);
        toast.success('Added to wishlist');
      }
      return true;
    } catch (err) {
      toast.error(err.message || 'Action failed');
      return false;
    }
  };

  const isInWishlist = useCallback(
    productId => {
      return wishlistItems.some(item => item.product_id === productId);
    },
    [wishlistItems],
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        totalCount,
        isLoading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error(
      'useWishlistContext must be used within a WishlistProvider',
    );
  }
  return context;
};
