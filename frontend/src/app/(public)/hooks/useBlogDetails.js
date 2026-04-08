'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchBlogPostDetailsApi, fetchBlogPostsApi } from '../api/blogApi';

/**
 * useBlogDetails Hook
 * Manages state for a single blog article and its related content.
 * @param {string} slug - The unique slug of the blog post.
 */
export const useBlogDetails = slug => {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBlogData = useCallback(async () => {
    if (!slug) return;

    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch the main post details
      const details = await fetchBlogPostDetailsApi(slug);
      setPost(details);

      // 2. Fetch related posts (same category, excluding current post)
      if (details.category) {
        const related = await fetchBlogPostsApi({
          category: details.category,
          is_published: true,
          page_size: 4, // Fetch 4 to ensure we have 3 even after filtering current
        });

        const filteredRelated = (related.results || [])
          .filter(p => p.id !== details.id)
          .slice(0, 3);

        setRelatedPosts(filteredRelated);
      }
    } catch (err) {
      console.error('useBlogDetails Error:', err);
      setError(err.message || 'Failed to load article details');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadBlogData();
  }, [loadBlogData]);

  return {
    post,
    relatedPosts,
    isLoading,
    error,
    refresh: loadBlogData,
  };
};
