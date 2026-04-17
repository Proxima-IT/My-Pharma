'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { AiOutlineMenu } from 'react-icons/ai';
import { FiGrid, FiCheckCircle, FiTruck } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { API_BASE_URL, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';
import { useLogoAdmin } from '../../(admin)/hooks/useLogoAdmin';

/**
 * MobileDrawer Component
 * Updated: Implemented frontend product counting logic for category badges.
 */
const MobileDrawer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Added for counting
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { logos } = useLogoAdmin();
  const systemLogo = logos?.find(l => l.slug === 'LOGO' || l.slug === 'logo');

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

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
  }, [open]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, adsRes, prodRes] = await Promise.all([
          fetch(`${API_BASE_URL}/sidebar-categories/`),
          fetch(`${API_BASE_URL}/ads/?is_active=true`),
          fetch(`${API_BASE_URL}/products/?page_size=1000&is_active=true`), // Fetch products for count
        ]);
        const [catData, adsData, prodData] = await Promise.all([
          parseJsonResponse(catRes, { results: [] }),
          parseJsonResponse(adsRes, { results: [] }),
          parseJsonResponse(prodRes, { results: [] }),
        ]);

        if (!catRes.ok || !adsRes.ok || !prodRes.ok) {
          console.error('Drawer API request failed', {
            sidebarCategories: catRes.status,
            ads: adsRes.status,
            products: prodRes.status,
          });
        }

        setCategories(Array.isArray(catData) ? catData : (catData.results || []));
        setAds(Array.isArray(adsData) ? adsData : (adsData.results || []));
        setAllProducts(Array.isArray(prodData) ? prodData : (prodData.results || []));
      } catch (error) {
        console.error('Error fetching drawer data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (open) fetchData();
  }, [open]);

  const isAllProductsActive = pathname === '/products' && !currentCategory;
  const activeAd = ads.length > 0 ? ads[0] : null;

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 cursor-pointer"
      >
        <AiOutlineMenu className="text-2xl text-gray-900" />
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 w-[85%] max-w-[320px] h-full bg-[#FAF7F2] z-[70] transform transition-transform duration-500 ease-in-out overflow-y-auto no-scrollbar ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Menu
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <IoCloseSharp size={24} />
            </button>
          </div>
          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                All Product Category
              </h3>
              <nav className="flex flex-col gap-1">
                <Link
                  href="/categories"
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-full transition-all ${isAllProductsActive ? 'bg-[#233b8c] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-50'}`}
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
                  categories.map(cat => {
                    const isActive = currentCategory === cat.title;
                    const count = categoryCounts[cat.title] || 0;
                    return (
                      <Link
                        key={cat.id}
                        href={`/products?category=${encodeURIComponent(cat.title)}`}
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between px-5 py-3.5 rounded-full transition-all ${isActive ? 'bg-[#233b8c] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-50'}`}
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-5 h-5 relative shrink-0">
                            <Image
                              src={
                                cat.image_url ||
                                systemLogo?.image_url ||
                                '/assets/images/applogo.png'
                              }
                              alt={cat.title}
                              fill
                              className={`object-contain ${isActive ? 'brightness-0 invert' : ''}`}
                              unoptimized
                            />
                          </div>
                          <span
                            className={`text-[15px] tracking-tight truncate ${isActive ? 'font-bold' : 'font-medium'}`}
                          >
                            {cat.title}
                          </span>
                        </div>
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
                    );
                  })
                )}
              </nav>
            </div>
            {activeAd && (
              <div className="w-full rounded-[24px] overflow-hidden leading-[0] shadow-md">
                <Link
                  href={activeAd.link || '#'}
                  onClick={() => setOpen(false)}
                  className="block w-full"
                >
                  <Image
                    src={
                      activeAd.image_url ||
                      systemLogo?.image_url ||
                      '/assets/images/applogo.png'
                    }
                    alt="Promotional Banner"
                    width={300}
                    height={150}
                    className="w-full h-auto object-cover"
                    unoptimized
                  />
                </Link>
              </div>
            )}
            <div className="flex flex-col gap-3 pb-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e6f7ed] flex items-center justify-center shrink-0">
                  <FiCheckCircle size={20} color="#00ab49" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight">
                    Genuine Medicine
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    100% authentic products
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e6f7ed] flex items-center justify-center shrink-0">
                  <FiTruck size={20} color="#00ab49" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight">
                    Fast Delivery
                  </h4>
                  <p className="text-[10px] text-gray-500">Within Dhaka City</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default MobileDrawer;
