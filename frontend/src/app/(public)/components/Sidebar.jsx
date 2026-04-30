'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiSearch,
  FiGrid,
  FiCheckCircle,
  FiTruck,
  FiChevronDown,
} from 'react-icons/fi';
import {
  API_BASE_URL,
  getMediaUrl,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

/**
 * Sidebar Component
 * Refactored: Uses Category Tree API for recursive nesting of all product categories.
 * Logic:
 * 1. Root categories (parent === null) act as top-level menu items.
 * 2. Sub-categories are nested recursively within their parents.
 * 3. Standard Sidebar Menu (Method B) logic removed.
 * Design: No shadows, reduced spacing, images enabled for all depths.
 */
const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Extract slug from URL to determine active state (matches top-level category)
  const currentCategorySlug = pathname.startsWith('/category/')
    ? pathname.replace('/category/', '').split('/')[0]
    : '';

  const [categories, setCategories] = useState([]); // All categories in tree format
  const [allProducts, setAllProducts] = useState([]);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resA, adsRes, prodRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories/tree/`),
          fetch(`${API_BASE_URL}/ads/?is_active=true`),
          fetch(`${API_BASE_URL}/products/?page_size=1000&is_active=true`),
        ]);

        const [dataA, adsData, prodData] = await Promise.all([
          parseJsonResponse(resA, []),
          parseJsonResponse(adsRes, { results: [] }),
          parseJsonResponse(prodRes, { results: [] }),
        ]);

        // dataA is the tree representation from backend
        setCategories(Array.isArray(dataA) ? dataA : dataA.results || []);
        setAds(Array.isArray(adsData) ? adsData : adsData.results || []);
        setAllProducts(
          Array.isArray(prodData) ? prodData : prodData.results || [],
        );
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = {};
    allProducts.forEach(product => {
      const catName = product.category_name;
      if (catName) counts[catName] = (counts[catName] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  const handleSearch = e => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const toggleMenu = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isAllProductsActive = pathname === '/products' && !currentCategorySlug;
  const activeAd = ads.length > 0 ? ads[0] : null;

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
            className={`flex-1 flex items-center justify-between px-4 py-2.5 rounded-full transition-all ${
              isActive
                ? 'bg-[#233b8c] text-white shadow-none'
                : 'text-gray-500 hover:bg-gray-50 shadow-none'
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
                className={`text-[14px] tracking-tight truncate ${isActive ? 'font-bold' : 'font-medium group-hover:text-gray-900'}`}
              >
                {title}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isActive ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
            >
              {count}
            </span>
          </Link>

          {hasChildren && (
            <button
              onClick={e => toggleMenu(e, item.id)}
              className={`p-2 ml-1 rounded-full transition-all cursor-pointer shadow-none ${isOpen ? 'rotate-180 text-(--color-primary-500)' : 'text-gray-300'}`}
            >
              <FiChevronDown size={16} />
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
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-none">
        <h2 className="text-[20px] font-bold text-gray-900 mb-4 tracking-tight">
          Product Categories
        </h2>

        <div className="relative mb-4">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full h-11 pl-11 pr-4 bg-white border border-gray-100 rounded-full text-sm focus:outline-none focus:border-(--color-primary-500) transition-all shadow-none"
          />
        </div>

        <nav className="flex flex-col gap-0.5">
          <Link
            href="/products"
            className={`flex items-center justify-between px-4 py-3 rounded-full transition-all ${
              isAllProductsActive
                ? 'bg-[#233b8c] text-white shadow-none'
                : 'text-gray-500 hover:bg-gray-50 shadow-none'
            }`}
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
              {allProducts.length}
            </span>
          </Link>

          <div className="h-px bg-gray-50 my-1 w-full" />

          {isLoading ? (
            <div className="py-6 flex justify-center">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-(--color-primary-500) rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-0.5">
              {categories.map(cat => (
                <NavItem key={`cat-tree-${cat.id}`} item={cat} />
              ))}
            </div>
          )}
        </nav>
      </div>

      {activeAd && (
        <div className="w-full rounded-[32px] overflow-hidden leading-[0] border border-gray-100 shadow-none">
          <Link href={activeAd.link || '#'} className="block w-full h-full">
            <Image
              src={getMediaUrl(activeAd.image_url)}
              alt="Promotional Banner"
              width={400}
              height={500}
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              unoptimized
            />
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3 pb-4">
        <div className="bg-white border border-gray-100 rounded-[24px] p-4 flex items-center gap-4 shadow-none">
          <div className="w-10 h-10 rounded-full bg-[#e6f7ed] flex items-center justify-center shrink-0">
            <FiCheckCircle size={20} color="#00ab49" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              Genuine Medicine
            </h4>
            <p className="text-[11px] text-gray-500 font-medium">
              100% authentic pharmacy
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[24px] p-4 flex items-center gap-4 shadow-none">
          <div className="w-10 h-10 rounded-full bg-[#e6f7ed] flex items-center justify-center shrink-0">
            <FiTruck size={20} color="#00ab49" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Swift Logistics</h4>
            <p className="text-[11px] text-gray-500 font-medium">
              Same day available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
