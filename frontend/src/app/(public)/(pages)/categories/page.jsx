'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FeaturedCategory from '../home/components/FeaturedCategory';
import {
  API_BASE_URL,
  getMediaUrl,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

const CategoriesPage = () => {
  const [categoriesA, setCategoriesA] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resA, prodRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories/sidebar-category/`),
          fetch(`${API_BASE_URL}/products/?page_size=1000&is_active=true`),
        ]);

        const [dataA, prodData] = await Promise.all([
          parseJsonResponse(resA, []),
          parseJsonResponse(prodRes, { results: [] }),
        ]);

        setCategoriesA(Array.isArray(dataA) ? dataA : dataA.results || []);
        setAllProducts(
          Array.isArray(prodData) ? prodData : prodData.results || [],
        );
      } catch (error) {
        console.error('Error fetching categories data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryCounts = React.useMemo(() => {
    const counts = {};
    allProducts.forEach(product => {
      const catName = product.category_name;
      if (catName) counts[catName] = (counts[catName] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  return (
    <div className="w-full space-y-16 pb-20 animate-in fade-in duration-700">
      <FeaturedCategory />

      {/* Additional Method A Categories Grid */}
      <div className="w-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            All Categories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our complete range of pharmaceutical categories
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#233b8c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {categoriesA.map(category => {
              const count = categoryCounts[category.name] || 0;
              return (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group bg-white rounded-[32px] p-6 border border-gray-100 hover:border-[#233b8c] transition-all duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={
                          getMediaUrl(category.image) ||
                          '/assets/images/applogo.png'
                        }
                        alt={category.name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#233b8c] transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">{count} products</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
