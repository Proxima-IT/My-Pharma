'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
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
 * Refactored to support:
 * 1. Method A: Product Categories (/api/categories/sidebar-category/)
 * 2. Method B: Custom Sidebar Items (/api/sidebar-categories/)
 * 3. Nested Menus: Dropdown support for parent categories.
 */
const Sidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = searchParams.get('category');

  const [categoriesA, setCategoriesA] = useState([]); // Product Categories
  const [categoriesB, setCategoriesB] = useState([]); // Custom Items
  const [allProducts, setAllProducts] = useState([]);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resA, resB, adsRes, prodRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories/sidebar-category/`),
          fetch(`${API_BASE_URL}/sidebar-categories/`),
          fetch(`${API_BASE_URL}/ads/?is_active=true`),
          fetch(`${API_BASE_URL}/products/?page_size=1000&is_active=true`),
        ]);

        const [dataA, dataB, adsData, prodData] = await Promise.all([
          parseJsonResponse(resA, []),
          parseJsonResponse(resB, { results: [] }),
          parseJsonResponse(adsRes, { results: [] }),
          parseJsonResponse(prodRes, { results: [] }),
        ]);

        setCategoriesA(Array.isArray(dataA) ? dataA : dataA.results || []);
        setCategoriesB(Array.isArray(dataB) ? dataB : dataB.results || []);
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

  const toggleMenu = id => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isAllProductsActive = pathname === '/products' && !currentCategory;
  const activeAd = ads.length > 0 ? ads[0] : null;

  // Navigation Item Component for Recursion
  const NavItem = ({ item, isCustom = false, depth = 0 }) => {
    const title = isCustom ? item.title : item.name;
    const isActive = currentCategory === title;
    const hasChildren = !isCustom && item.children && item.children.length > 0;
    const isOpen = !!openMenus[item.id];
    const count = categoryCounts[title] || 0;

    return (
      <div className="flex flex-col w-full">
        <div
          className={`flex items-center w-full group ${depth > 0 ? 'pl-4' : ''}`}
        >
          <Link
            href={
              isCustom ? '#' : `/products?category=${encodeURIComponent(title)}`
            }
            className={`flex-1 flex items-center justify-between px-5 py-3 rounded-full transition-all ${
              isActive
                ? 'bg-[#233b8c] text-white'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4 overflow-hidden">
              {!isCustom && !depth && (
                <div className="w-5 h-5 relative shrink-0">
                  <Image
                    src={
                      getMediaUrl(item.image) || '/assets/images/applogo.png'
                    }
                    alt={title}
                    fill
                    className={`object-contain ${isActive ? 'brightness-0 invert' : ''}`}
                  />
                </div>
              )}
              {isCustom && (
                <div className="w-5 h-5 relative shrink-0">
                  <Image
                    src={
                      getMediaUrl(item.image_url) ||
                      '/assets/images/applogo.png'
                    }
                    alt={title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <span
                className={`text-[14px] tracking-tight truncate ${isActive ? 'font-bold' : 'font-medium group-hover:text-gray-900'}`}
              >
                {title}
              </span>
            </div>

            {!isCustom && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isActive ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
              >
                {count}
              </span>
            )}
          </Link>

          {hasChildren && (
            <button
              onClick={e => {
                e.preventDefault();
                toggleMenu(item.id);
              }}
              className={`p-2 ml-1 rounded-full transition-all ${isOpen ? 'rotate-180 text-(--color-primary-500)' : 'text-gray-300'}`}
            >
              <FiChevronDown size={18} />
            </button>
          )}
        </div>

        {hasChildren && isOpen && (
          <div className="flex flex-col gap-1 mt-1 border-l-2 border-gray-50 ml-6 animate-in slide-in-from-top-1">
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
      <div className="bg-white border border-gray-100 rounded-[32px] p-6">
        <h2 className="text-[20px] font-bold text-gray-900 mb-6 tracking-tight">
          All Product Category
        </h2>

        <div className="relative mb-6">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full h-12 pl-11 pr-4 bg-gray-50/50 border border-gray-100 rounded-full text-sm focus:outline-none focus:border-(--color-primary-500) transition-all focus:bg-white"
          />
        </div>

        <nav className="flex flex-col gap-2">
          {/* Default Route */}
          <Link
            href="/products"
            className={`flex items-center justify-between px-5 py-3.5 rounded-full transition-all ${
              isAllProductsActive
                ? 'bg-[#233b8c] text-white'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <FiGrid size={20} />
              <span className="text-[15px] font-bold tracking-tight">
                All Products
              </span>
            </div>
            <span
              className={`text-xs font-bold ${isAllProductsActive ? 'text-white/60' : 'text-gray-300'}`}
            >
              {allProducts.length}
            </span>
          </Link>

          <div className="h-px bg-gray-50 my-2 w-full" />

          {isLoading ? (
            <div className="py-10 flex justify-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-(--color-primary-500) rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Method A: Product Categories */}
              <div className="space-y-1">
                {categoriesA.map(cat => (
                  <NavItem key={`catA-${cat.id}`} item={cat} />
                ))}
              </div>

              {/* Method B: Custom Items */}
              {categoriesB.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-1">
                  <span className="px-5 text-[10px] font-bold text-gray-300 uppercase tracking-widest block mb-2">
                    Other Links
                  </span>
                  {categoriesB.map(item => (
                    <NavItem
                      key={`catB-${item.id}`}
                      item={item}
                      isCustom={true}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </nav>
      </div>

      {activeAd && (
        <div className="w-full rounded-[32px] overflow-hidden leading-[0] border border-gray-100">
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
        <div className="bg-white border border-gray-100 rounded-[24px] p-4 flex items-center gap-4">
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

        <div className="bg-white border border-gray-100 rounded-[24px] p-4 flex items-center gap-4">
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
