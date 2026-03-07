'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, usePathname } from 'next/navigation';
import {
  FiHome,
  FiHeart,
  FiActivity,
  FiSmile,
  FiZap,
  FiSearch,
  FiCommand,
  FiGrid,
  FiCheckCircle,
  FiTruck,
} from 'react-icons/fi';
import {
  GiPill,
  GiHerbsBundle,
  GiHealthCapsule,
  GiDogBowl,
} from 'react-icons/gi';
import {
  MdOutlineScience,
  MdOutlineFaceRetouchingNatural,
  MdOutlineHomeWork,
} from 'react-icons/md';
import { getCategories } from '@/data/categories';

const Sidebar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = searchParams.get('category');

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  const getIcon = name => {
    switch (name) {
      case 'All Product':
        return <FiGrid size={20} />;
      case 'Home':
        return <FiHome size={20} />;
      case 'Medicine':
        return <GiPill size={20} />;
      case 'Healthcare':
        return <FiHeart size={20} />;
      case 'Lab Test':
        return <MdOutlineScience size={20} />;
      case 'Beauty':
        return <MdOutlineFaceRetouchingNatural size={20} />;
      case 'Sexual Wellness':
        return <FiZap size={20} />;
      case 'Baby Care':
        return <FiSmile size={20} />;
      case 'Herbal':
        return <GiHerbsBundle size={20} />;
      case 'Home Care':
        return <MdOutlineHomeWork size={20} />;
      case 'Supplement':
        return <GiHealthCapsule size={20} />;
      case 'Pet Care':
        return <GiDogBowl size={20} />;
      case 'Nutrition':
        return <FiActivity size={20} />;
      default:
        return <FiHome size={20} />;
    }
  };

  // Check if "All Products" is active (Path is /products and no category slug in URL)
  const isAllProductsActive = pathname === '/products' && !currentCategory;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700">
      {/* 1. MAIN CATEGORY CARD */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
        <h2 className="text-[22px] font-bold text-gray-900 mb-6 tracking-tight">
          All Product Category
        </h2>

        {/* Search Bar */}
        <div className="relative mb-1">
          {' '}
          {/* Reduced margin to 1 to remove white space */}
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

        {/* Category List */}
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
            <span
              className={`text-xs font-bold ${isAllProductsActive ? 'opacity-80' : 'text-gray-400'}`}
            >
              20
            </span>
          </Link>

          {categories.map((cat, index) => {
            const isActive = currentCategory === cat.slug;
            return (
              <React.Fragment key={cat.id}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-full transition-all group ${
                    isActive
                      ? 'bg-[#233b8c] text-white shadow-md'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={
                        isActive
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-(--color-primary-500)'
                      }
                    >
                      {getIcon(cat.name)}
                    </span>
                    <span
                      className={`text-[15px] tracking-tight ${isActive ? 'font-bold' : 'font-medium group-hover:text-gray-900'}`}
                    >
                      {cat.name}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium ${isActive ? 'opacity-80' : 'text-gray-400 group-hover:text-gray-600'}`}
                  >
                    {cat.count}
                  </span>
                </Link>
                {index < categories.length - 1 && !isActive && (
                  <div className="h-[1px] bg-gray-50 mx-4" />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* 2. PROMOTIONAL IMAGE BANNER */}
      <div className="w-full rounded-[32px] overflow-hidden leading-[0]">
        <Image
          src="/assets/images/applogo.png"
          alt="Promotional Banner"
          width={400}
          height={500}
          className="w-full h-auto object-cover"
          priority
        />
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
