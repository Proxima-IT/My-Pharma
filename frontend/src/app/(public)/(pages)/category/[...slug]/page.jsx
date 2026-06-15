'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronDown } from 'react-icons/fi';
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
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
          // 1. Fetch sub-categories first to see if this is a parent category
          const subRes = await fetch(
            `${API_BASE_URL}/categories/?parent=${catData.id}&is_active=true`,
          );
          const subData = await parseJsonResponse(subRes, { results: [] });
          const subList = Array.isArray(subData)
            ? subData
            : subData.results || [];
          setSubCategories(subList);

          // 2. Aggregate slugs: current category + all its immediate children
          const slugsToFetch = [currentSlug, ...subList.map(s => s.slug)];

          // 3. Fetch products for all these categories with pagination
          const productResponses = await Promise.all(
            slugsToFetch.map(slug =>
              fetch(
                `${API_BASE_URL}/products/?category=${slug}&is_active=true&page=${page}`,
              ).then(res => parseJsonResponse(res, { results: [], count: 0 })),
            ),
          );

          // 4. Flatten and de-duplicate results by product ID
          const combinedProducts = productResponses.flatMap(data =>
            Array.isArray(data) ? data : data.results || [],
          );

          const total = productResponses.reduce(
            (sum, data) => sum + (data.count || 0),
            0,
          );
          setTotalCount(total);

          const uniqueProducts = Array.from(
            new Map(combinedProducts.map(p => [p.id, p])).values(),
          );

          setProducts(uniqueProducts);
        }
      } catch (error) {
        console.error('Error loading dynamic category page:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentSlug) fetchData();
  }, [currentSlug, page]);

  const totalPages = Math.ceil(totalCount / 20);

  const handlePageChange = newPage => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationRange = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

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
      <nav className="bg-white border border-gray-100/50 rounded-full px-4 md:px-6 py-2 w-fit mb-6 lg:mb-5 mt-4">
        <ol className="flex items-center gap-2 text-[10px] sm:text-xs lg:text-[11px] whitespace-nowrap uppercase tracking-wider">
          <li className="flex items-center gap-2">
            <Link
              href="/"
              className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-bold"
            >
              Home
            </Link>
            <span className="text-gray-300 font-light">{'>'}</span>
          </li>
          <li className="flex items-center gap-2">
            <Link
              href="/categories"
              className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-bold"
            >
              Shop
            </Link>
            <span className="text-gray-300 font-light">{'>'}</span>
          </li>
          {breadcrumbs.map((crumb, idx) => (
            <li key={crumb.path} className="flex items-center gap-2">
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-black truncate max-w-[150px] lg:max-w-none">
                  {crumb.name}
                </span>
              ) : (
                <>
                  <Link
                    href={crumb.path}
                    className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-bold"
                  >
                    {crumb.name}
                  </Link>
                  <span className="text-gray-300 font-light">{'>'}</span>
                </>
              )}
            </li>
          ))}
        </ol>
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

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 pb-10">
            <button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronDown className="rotate-90" size={18} />
            </button>

            {getPaginationRange().map((p, i) => (
              <button
                key={i}
                disabled={p === '...'}
                onClick={() => p !== '...' && handlePageChange(p)}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                  page === p
                    ? 'bg-(--color-primary-500) text-white shadow-lg shadow-(--color-primary-500)/20'
                    : p === '...'
                      ? 'bg-transparent text-gray-400 cursor-default'
                      : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronDown className="-rotate-90" size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicCategoryPage;
