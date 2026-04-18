'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronRight } from 'react-icons/fi';
import PopularProductCard from '../../home/components/PopularProductCard';
import {
  API_BASE_URL,
  getMediaUrl,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

/**
 * Dynamic Category Page
 * Simplified view focusing on circular sub-category navigation and direct product listing.
 * Strictly shadow-free, white background layout.
 */
const DynamicCategoryPage = ({ params }) => {
  const resolvedParams = use(params);
  const slugArray = resolvedParams.slug || [];
  const currentSlug = slugArray[slugArray.length - 1];

  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const catRes = await fetch(
          `${API_BASE_URL}/categories/${currentSlug}/`,
        );
        const catData = await parseJsonResponse(catRes, null);
        setCategory(catData);

        if (catData) {
          const [subRes, prodRes] = await Promise.all([
            fetch(
              `${API_BASE_URL}/categories/?parent=${catData.id}&is_active=true`,
            ),
            fetch(
              `${API_BASE_URL}/products/?category=${currentSlug}&is_active=true`,
            ),
          ]);

          const subData = await parseJsonResponse(subRes, { results: [] });
          const prodData = await parseJsonResponse(prodRes, { results: [] });

          setSubCategories(
            Array.isArray(subData) ? subData : subData.results || [],
          );
          setProducts(
            Array.isArray(prodData) ? prodData : prodData.results || [],
          );
        }
      } catch (error) {
        console.error('Error loading dynamic category page:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentSlug) fetchData();
  }, [currentSlug]);

  const breadcrumbs = slugArray.map((segment, index) => {
    const path = `/category/${slugArray.slice(0, index + 1).join('/')}`;
    const name = segment.replace(/-/g, ' ').toUpperCase();
    return { name, path };
  });

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="w-full py-20 text-center space-y-4 bg-white">
        <h2 className="text-2xl font-bold text-gray-900">Category Not Found</h2>
        <Link
          href="/categories"
          className="text-(--color-primary-500) font-bold underline"
        >
          View All Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 pb-20 animate-in fade-in duration-700 bg-white">
      {/* Dynamic Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-4">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <FiChevronRight />
        <Link href="/categories" className="hover:text-black transition-colors">
          Shop
        </Link>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.path}>
            <FiChevronRight />
            <Link
              href={crumb.path}
              className={
                idx === breadcrumbs.length - 1
                  ? 'text-black'
                  : 'hover:text-black transition-colors'
              }
            >
              {crumb.name}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      {/* Sub-Categories Circle Grid */}
      {subCategories.length > 0 && (
        <div className="w-full overflow-x-auto no-scrollbar pb-4">
          <div className="flex gap-6 sm:gap-8 min-w-max">
            {subCategories.map(sub => (
              <Link
                key={sub.id}
                href={`/category/${slugArray.join('/')}/${sub.slug}`}
                className="group flex flex-col items-center gap-3 transition-all"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 relative bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center p-4 transition-all group-hover:border-(--color-primary-500) group-hover:bg-white shadow-none">
                  <Image
                    src={getMediaUrl(sub.image) || '/assets/images/applogo.png'}
                    alt={sub.name}
                    fill
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                </div>
                <h3 className="font-bold text-[13px] text-gray-900 group-hover:text-(--color-primary-500) transition-colors uppercase tracking-tight text-center max-w-[100px] line-clamp-1">
                  {sub.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid Section */}
      <div className="w-full">
        {products.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              No products available in this category level.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map(product => (
              <PopularProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicCategoryPage;
