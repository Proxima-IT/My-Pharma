'use client';

import { useState, useEffect, useCallback } from 'react';
import { reviewApi } from '../api/reviewApi';

/**
 * My Pharma - Product Reviews Hook
 * Handles fetching reviews and submitting new reviews with multi-image support using FormData.
 */
export const useReviews = productId => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const fetchReviews = useCallback(
    async (page = 1) => {
      if (!productId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await reviewApi.getProductReviews(productId, page);
        setReviews(data.results || []);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
      } catch (err) {
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    },
    [productId],
  );

  /**
   * Submits a review using FormData to support image uploads.
   * @param {Object} reviewData - { rating, title, comment, images: File[] }
   */
  const submitReview = async reviewData => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Please login to post a review');
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('product', productId);
      formData.append('rating', reviewData.rating);
      formData.append('title', reviewData.title);
      formData.append('comment', reviewData.comment);

      // Append multiple images if they exist
      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach(file => {
          formData.append('uploaded_images', file); // 'uploaded_images' is the standard key for review image lists
        });
      }

      const newReview = await reviewApi.postReview(token, formData);

      // Refresh the list to show the new review immediately
      await fetchReviews();
      return newReview;
    } catch (err) {
      // Extract detail from backend error if available
      const msg = err.detail || err.message || 'Submission failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    isSubmitting,
    error,
    pagination,
    fetchReviews,
    submitReview,
  };
};
