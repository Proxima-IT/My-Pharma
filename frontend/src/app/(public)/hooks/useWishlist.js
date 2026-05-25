'use client';

import { useWishlistContext } from '../context/WishlistContext';

/**
 * Akkhar-Labs :: useWishlist Hook
 * =================================
 * High-level consumer hook for the Wishlist System.
 * Decouples components from the internal Context implementation.
 */
export const useWishlist = () => {
  const {
    wishlistItems,
    totalCount,
    isLoading,
    toggleWishlist,
    isInWishlist,
    refreshWishlist,
  } = useWishlistContext();

  return {
    /** Array of current wishlist items (synced globally) */
    items: wishlistItems,
    /** Total number of items in the user's wishlist */
    totalCount,
    /** Boolean indicating if the initial fetch is in progress */
    isLoading,
    /**
     * High-performance toggle function.
     * Handles both add and remove logic automatically.
     */
    toggle: toggleWishlist,
    /**
     * Direct state check.
     * @param {number} productId - The product ID to verify.
     */
    isFavorite: isInWishlist,
    /** Manually trigger a refresh from the server */
    refresh: refreshWishlist,
  };
};
