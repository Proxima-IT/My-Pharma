'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
  FiSearch,
  FiCommand,
  FiGrid,
  FiCheckCircle,
  FiTruck,
} from 'react-icons/fi';
import { API_BASE_URL, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

/**
 * Sidebar Component
 * Updated: Implemented "Frontend Grouping" to show product counts per category.
 * Performance Note: This fetches the product list to calculate counts.
 * Scalability Warning: Will slow down if product count exceeds 500+.
 */
const Sidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = searchParams.get('category');

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store products for counting
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching categories, ads, and ALL products (to count them)
        // Note: We use a large limit to bypass pagination for the count logic
        const [catRes, adsRes, prodRes] = await Promise.all([
          fetch(`${API_BASE_URL}/sidebar-categories/`),
          fetch(`${API_BASE_URL}/ads/?is_active=true`),
          fetch(`${API_BASE_URL}/products/?page_size=1000&is_active=true`),
        ]);
        const [catData, adsData, prodData] = await Promise.all([
          parseJsonResponse(catRes, { results: [] }),
          parseJsonResponse(adsRes, { results: [] }),
          parseJsonResponse(prodRes, { results: [] }),
        ]);

        if (!catRes.ok || !adsRes.ok || !prodRes.ok) {
          console.error('Sidebar API request failed', {
            sidebarCategories: catRes.status,
            ads: adsRes.status,
            products: prodRes.status,
          });
        }

        setCategories(Array.isArray(catData) ? catData : (catData.results || []));
        setAds(Array.isArray(adsData) ? adsData : (adsData.results || []));
        setAllProducts(Array.isArray(prodData) ? prodData : (prodData.results || []));
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Logic: Create a Map of { categoryName: count }
  const categoryCounts = useMemo(() => {
    const counts = {};
    allProducts.forEach(product => {
      const catName = product.category_name;
      if (catName) {
        counts[catName] = (counts[catName] || 0) + 1;
      }
    });
    return counts;
  }, [allProducts]);

  const handleSearch = e => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const isAllProductsActive = pathname === '/products' && !currentCategory;
  const activeAd = ads.length > 0 ? ads[0] : null;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700">
      {/* 1. MAIN CATEGORY CARD */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
        <h2 className="text-[22px] font-bold text-gray-900 mb-6 tracking-tight">
          All Product Category
        </h2>

        <div className="relative mb-4">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full h-12 pl-11 pr-16 bg-white border border-gray-100 rounded-full text-sm focus:outline-none focus:border-(--color-primary-500) transition-all"
          />
        </div>

        <nav className="flex flex-col gap-1">
          <Link
            href="/categories"
            className={`flex items-center justify-between px-5 py-3.5 rounded-full transition-all ${
              isAllProductsActive
                ? 'bg-[#233b8c] text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <FiGrid size={20} />
              <span className="text-[15px] font-bold tracking-tight">
                All Product
              </span>
            </div>
            <span
              className={`text-xs font-bold ${isAllProductsActive ? 'text-white/60' : 'text-gray-300'}`}
            >
              {allProducts.length}
            </span>
          </Link>

          {isLoading ? (
            <div className="py-10 flex justify-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-(--color-primary-500) rounded-full animate-spin" />
            </div>
          ) : (
            categories.map((cat, index) => {
              const isActive = currentCategory === cat.title;
              const count = categoryCounts[cat.title] || 0;

              return (
                <React.Fragment key={cat.id}>
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.title)}`}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-full transition-all group ${
                      isActive
                        ? 'bg-[#233b8c] text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-5 h-5 relative shrink-0">
                        <Image
                          src={cat.image_url || '/assets/images/applogo.png'}
                          alt={cat.title}
                          fill
                          className={`object-contain ${isActive ? 'brightness-0 invert' : ''}`}
                        />
                      </div>
                      <span
                        className={`text-[15px] tracking-tight truncate ${isActive ? 'font-bold' : 'font-medium group-hover:text-gray-900'}`}
                      >
                        {cat.title}
                      </span>
                    </div>
                    {/* Count Badge */}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}
                    >
                      {count}
                    </span>
                  </Link>
                </React.Fragment>
              );
            })
          )}
        </nav>
      </div>

      {/* 2. DYNAMIC PROMOTIONAL IMAGE BANNER */}
      <div className="w-full rounded-[32px] overflow-hidden leading-[0]">
        <Link href={activeAd?.link || '#'} className="block w-full h-full">
          <Image
            src={activeAd?.image_url || '/assets/images/applogo.png'}
            alt="Promotional Banner"
            width={400}
            height={500}
            className="w-full h-auto object-cover"
            priority
            unoptimized
          />
        </Link>
      </div>

      {/* 3. TRUST BADGES */}
      <div className="flex flex-col gap-3 pb-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#e6f7ed] flex items-center justify-center shrink-0">
            <FiCheckCircle size={20} color="#00ab49" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              Genuine Medicine
            </h4>
            <p className="text-[11px] text-gray-500 font-medium">
              100% authentic products
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#e6f7ed] flex items-center justify-center shrink-0">
            <FiTruck size={20} color="#00ab49" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Fast Delivery</h4>
            <p className="text-[11px] text-gray-500 font-medium">
              Within Dhaka City
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
