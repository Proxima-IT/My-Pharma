'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, usePathname } from 'next/navigation';
import {
  FiSearch,
  FiCommand,
  FiGrid,
  FiCheckCircle,
  FiTruck,
} from 'react-icons/fi';
import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

const Sidebar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = searchParams.get('category');

  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, adsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/sidebar-categories/`),
          fetch(`${API_BASE_URL}/ads/?is_active=true`),
        ]);

        const catData = await catRes.json();
        const adsData = await adsRes.json();

        setCategories(catData.results || []);
        setAds(adsData.results || []);
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const isAllProductsActive = pathname === '/products' && !currentCategory;
  const activeAd = ads.length > 0 ? ads[0] : null;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700">
      {/* 1. MAIN CATEGORY CARD */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
        <h2 className="text-[22px] font-bold text-gray-900 mb-6 tracking-tight">
          All Product Category
        </h2>

        <div className="relative mb-1">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-12 pl-11 pr-16 bg-white border border-gray-100 rounded-full text-sm focus:outline-none focus:border-(--color-primary-500) transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
              <FiCommand size={12} />
            </div>
            <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold">
              K
            </div>
          </div>
        </div>

        <nav className="flex flex-col">
          <Link
            href="/products"
            className={`flex items-center justify-between px-4 py-3.5 rounded-full transition-all mb-1 ${
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
          </Link>

          {isLoading ? (
            <div className="py-10 flex justify-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-(--color-primary-500) rounded-full animate-spin" />
            </div>
          ) : (
            categories.map((cat, index) => {
              const isActive = currentCategory === cat.title;
              return (
                <React.Fragment key={cat.id}>
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.title)}`}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-full transition-all group ${
                      isActive
                        ? 'bg-[#233b8c] text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 relative shrink-0">
                        <Image
                          src={cat.image_url || '/assets/images/applogo.png'}
                          alt={cat.title}
                          fill
                          className={`object-contain ${isActive ? 'brightness-0 invert' : ''}`}
                        />
                      </div>
                      <span
                        className={`text-[15px] tracking-tight ${isActive ? 'font-bold' : 'font-medium group-hover:text-gray-900'}`}
                      >
                        {cat.title}
                      </span>
                    </div>
                  </Link>
                  {index < categories.length - 1 && !isActive && (
                    <div className="h-[1px] bg-gray-50 mx-4" />
                  )}
                </React.Fragment>
              );
            })
          )}
        </nav>
      </div>

      {/* 2. DYNAMIC PROMOTIONAL IMAGE BANNER - Fixed to fill container perfectly */}
      <div className="w-full rounded-[32px] overflow-hidden leading-[0]">
        <Link href={activeAd?.link || '#'} className="block w-full h-full">
          <Image
            src={activeAd?.image_url || '/assets/images/applogo.png'}
            alt="Promotional Banner"
            width={400}
            height={500}
            className="w-full h-auto object-cover"
            priority
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
