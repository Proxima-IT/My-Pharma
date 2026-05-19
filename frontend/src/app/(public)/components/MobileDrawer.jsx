'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { AiOutlineMenu } from 'react-icons/ai';
import {
  FiGrid,
  FiPackage,
  FiCheckCircle,
  FiTruck,
  FiChevronDown,
} from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  API_BASE_URL,
  getMediaUrl,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';
import { useLogoAdmin } from '../../(admin)/hooks/useLogoAdmin';

/**
 * MobileDrawer Component
 * Refactored: Uses Category Tree API for recursive nesting of all product categories.
 * Logic synced with Sidebar.jsx:
 * 1. Root categories act as top-level menu items.
 * 2. Sub-categories are nested recursively.
 * 3. All shadows removed, consistent spacing and image visibility.
 */
const MobileDrawer = () => {
  const router = useRouter();
  const pathname = usePathname();

  const currentCategorySlug = pathname.startsWith('/category/')
    ? pathname.replace('/category/', '').split('/')[0]
    : '';

  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]); // Tree representation
  const [countSummary, setCountSummary] = useState({
    total_products: 0,
    category_counts: [],
  });
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenus, setOpenMenus] = useState({});

  const { logos } = useLogoAdmin();
  const systemLogo = logos?.find(l => l.slug === 'LOGO' || l.slug === 'logo');

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
  }, [open]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resA, adsRes, countRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories/tree/`),
          fetch(`${API_BASE_URL}/ads/?is_active=true`),
          fetch(`${API_BASE_URL}/products/count-summary/`),
        ]);

        const [dataA, adsData, countData] = await Promise.all([
          parseJsonResponse(resA, []),
          parseJsonResponse(adsRes, { results: [] }),
          parseJsonResponse(countRes, {
            total_products: 0,
            category_counts: [],
          }),
        ]);

        setCategories(Array.isArray(dataA) ? dataA : dataA.results || []);
        setAds(Array.isArray(adsData) ? adsData : adsData.results || []);
        setCountSummary(countData);
      } catch (error) {
        console.error('Drawer API request failed', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (open) fetchData();
  }, [open]);

  const categoryCounts = useMemo(() => {
    // Step 1: Map the flat backend counts into a dictionary for quick lookup
    const directCounts = {};
    countSummary.category_counts.forEach(item => {
      directCounts[item.name] = item.product_count;
    });

    // Step 2: Recursively sum children counts into parents to show "Total" per branch
    const totalCounts = {};
    const sumTree = node => {
      let total = directCounts[node.name] || 0;
      if (Array.isArray(node.children)) {
        node.children.forEach(child => {
          total += sumTree(child);
        });
      }
      totalCounts[node.name] = total;
      return total;
    };
    categories.forEach(rootNode => sumTree(rootNode));

    return totalCounts;
  }, [countSummary, categories]);

  const toggleMenu = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isAllProductsActive = pathname === '/products' && !currentCategorySlug;
  const isAllCombosActive =
    pathname === '/combos' || pathname.startsWith('/combo/');
  const activeAd = ads.length > 0 ? ads[0] : null;

  // Navigation Item Component for Recursion
  const NavItem = ({ item, depth = 0 }) => {
    const title = item.name;
    const isActive = currentCategorySlug === item.slug;
    const hasChildren =
      Array.isArray(item.children) && item.children.length > 0;
    const isOpen = !!openMenus[item.id];
    const count = categoryCounts[title] || 0;

    return (
      <div className="flex flex-col w-full">
        <div
          className={`flex items-center w-full group ${depth > 0 ? 'pl-3' : ''}`}
        >
          <Link
            href={`/category/${item.slug}`}
            onClick={() => setOpen(false)}
            className={`flex-1 flex items-center justify-between px-4 py-2.5 rounded-full transition-all border border-transparent ${
              isActive
                ? 'bg-[#233b8c] text-white shadow-none'
                : 'bg-white text-gray-500 border-gray-50 shadow-none'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-5 h-5 relative shrink-0">
                <Image
                  src={
                    getMediaUrl(item.image_url || item.image) ||
                    '/assets/images/applogo.png'
                  }
                  alt={title}
                  fill
                  className={`object-contain ${isActive ? 'brightness-0 invert' : ''}`}
                  unoptimized
                />
              </div>
              <span
                className={`text-[14px] tracking-tight truncate ${isActive ? 'font-bold' : 'font-medium'}`}
              >
                {title}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isActive
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}
            >
              {count}
            </span>
          </Link>

          {hasChildren && (
            <button
              onClick={e => toggleMenu(e, item.id)}
              className={`p-2 ml-1 rounded-full transition-all cursor-pointer shadow-none ${isOpen ? 'rotate-180 text-(--color-primary-500)' : 'text-gray-300'}`}
            >
              <FiChevronDown size={18} />
            </button>
          )}
        </div>

        {hasChildren && isOpen && (
          <div className="flex flex-col gap-0.5 mt-0.5 border-l border-gray-100 ml-6 animate-in slide-in-from-top-1">
            {item.children.map(child => (
              <NavItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

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
        className={`fixed top-0 left-0 w-[85%] max-w-[320px] h-full bg-[#FAF7F2] z-[70] transform transition-transform duration-500 ease-in-out overflow-y-auto no-scrollbar shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight uppercase">
              Navigation
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <IoCloseSharp size={24} />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                Catalog
              </h3>
              <nav className="flex flex-col gap-0.5">
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-full transition-all border border-transparent ${isAllProductsActive ? 'bg-[#233b8c] text-white shadow-none' : 'bg-white text-gray-500 border-gray-50 shadow-none'}`}
                >
                  <div className="flex items-center gap-3">
                    <FiGrid size={18} />
                    <span className="text-[14px] font-bold tracking-tight">
                      All Products
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold ${isAllProductsActive ? 'text-white/60' : 'text-gray-300'}`}
                  >
                    {countSummary.total_products}
                  </span>
                </Link>

                <Link
                  href="/combos"
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-full transition-all border border-transparent ${isAllCombosActive ? 'bg-[#233b8c] text-white shadow-none' : 'bg-white text-gray-500 border-gray-50 shadow-none'}`}
                >
                  <div className="flex items-center gap-3">
                    <FiPackage size={18} />
                    <span className="text-[14px] font-bold tracking-tight">
                      All Combos
                    </span>
                  </div>
                </Link>

                <div className="h-px bg-gray-100 my-1 w-full opacity-50" />

                {isLoading ? (
                  <div className="py-10 flex justify-center">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-(--color-primary-500) rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {categories.map(cat => (
                      <NavItem key={`mobile-tree-${cat.id}`} item={cat} />
                    ))}
                  </div>
                )}
              </nav>
            </div>
            {activeAd && (
              <div className="w-full rounded-[24px] overflow-hidden leading-[0] border border-gray-100 shadow-none">
                <Link
                  href={activeAd.link || '#'}
                  onClick={() => setOpen(false)}
                  className="block w-full"
                >
                  <Image
                    src={getMediaUrl(activeAd.image_url)}
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
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-none">
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
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-none">
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
