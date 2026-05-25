'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

/**
 * useBundleData Hook
 * Fetches active combos from the API.
 * Updated: Synchronized to read 'bg_color' from the backend response.
 */
export const useBundleData = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/combos/?is_active=true`);
        if (!response.ok) throw new Error('Failed to fetch bundles');

        const data = await response.json();

        // Map API results to ensure the bg_color field is passed to the UI
        const mappedBundles = (data.results || []).map(item => ({
          ...item,
          // Fallback to brand green if bg_color is not defined in DB
          bgColor: item.bg_color || '#B0E5C7',
        }));

        setBundles(mappedBundles);
      } catch (err) {
        console.error('Bundle Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  return { bundles, loading };
};
