'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FiHome,
  FiHeart,
  FiActivity,
  FiSmile,
  FiZap,
  FiSearch,
  FiCommand,
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
  const currentCategory = searchParams.get('category');

  const [categories, setCategories] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);

      // Auto-expand the parent if a sub-category is active in the URL
      if (currentCategory) {
        const parent = data.find(
          cat =>
            cat.slug === currentCategory ||
            cat.subCategories?.some(sub => sub.slug === currentCategory),
        );
        if (parent) setExpandedId(parent.id);
      }
    };
    loadCategories();
  }, [currentCategory]);

  const getIcon = name => {
    switch (name) {
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

  return (
    <div className="w-full bg-white border border-(--color-gray-100) rounded-[32px] p-6 animate-in fade-in duration-700">
      <h2 className="text-[22px] font-bold text-(--color-gray-900) mb-6 tracking-tight">
        All Product Category
      </h2>

      {/* Search Bar */}
      <div className="relative mb-6">
        <FiSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search"
          className="w-full h-12 pl-11 pr-20 bg-white border border-(--color-gray-100) rounded-full text-sm focus:outline-none focus:border-(--color-primary-500) transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
            <FiCommand size={14} />
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold">
            K
          </div>
        </div>
      </div>

      {/* Category List */}
      <nav className="space-y-1">
        {categories.map(cat => {
          const isExpanded = expandedId === cat.id;
          const isActive = currentCategory === cat.slug;

          return (
            <div key={cat.id} className="flex flex-col">
              <Link
                href={`/products?category=${cat.slug}`}
                onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-full transition-all group ${
                  isActive || isExpanded
                    ? 'bg-(--color-primary-500) text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={
                      isActive || isExpanded
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-(--color-primary-500)'
                    }
                  >
                    {getIcon(cat.name)}
                  </span>
                  <span className="text-[15px] font-bold tracking-tight">
                    {cat.name}
                  </span>
                </div>
                <div
                  className={`flex items-center justify-center min-w-[28px] h-7 rounded-full text-xs font-bold ${
                    isActive || isExpanded
                      ? 'bg-white/20 text-white'
                      : 'text-gray-400'
                  }`}
                >
                  {cat.count}
                </div>
              </Link>

              {/* Sub-categories */}
              {isExpanded && cat.subCategories && (
                <div className="ml-6 mt-1 relative border-l border-gray-100">
                  {cat.subCategories.map((sub, idx) => {
                    const isSubActive = currentCategory === sub.slug;
                    return (
                      <div
                        key={idx}
                        className="relative flex items-center py-2 pl-6 group/sub"
                      >
                        <div className="absolute left-0 top-0 w-5 h-1/2 border-b border-gray-100 rounded-bl-xl" />

                        <Link
                          href={`/products?category=${sub.slug}`}
                          className={`flex items-center gap-3 w-full p-2 rounded-2xl transition-all ${
                            isSubActive ? 'bg-gray-100' : 'hover:bg-gray-50/50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            <div
                              className={`w-full h-full flex items-center justify-center text-[10px] font-bold ${
                                isSubActive
                                  ? 'bg-(--color-primary-500) text-white'
                                  : 'bg-gray-50 text-gray-400'
                              }`}
                            >
                              {sub.name.charAt(0)}
                            </div>
                          </div>
                          <span
                            className={`text-[14px] font-medium ${isSubActive ? 'text-gray-900 font-bold' : 'text-gray-600'}`}
                          >
                            {sub.name}
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isExpanded && <div className="h-px bg-gray-50 mx-4 my-0.5" />}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
