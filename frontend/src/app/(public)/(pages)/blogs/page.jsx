'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiSearch,
  FiChevronRight,
  FiChevronLeft,
  FiCalendar,
} from 'react-icons/fi';
import { fetchBlogCategoriesApi, fetchBlogPostsApi } from '../../api/blogApi';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * Blogs Page Component
 * 100% Pixel-Perfect matching with the My Pharma Premium Design System.
 * Fixed: Implemented "Safe Fetch" pattern using a filter reference to prevent
 * "Invalid page" 404 errors when switching categories or searching.
 */
const Blogs = () => {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Ref to track filters from the previous render to detect changes
  const lastFilters = useRef({ category: 'All', search: '' });

  // 1. Fetch Categories once on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catsData = await fetchBlogCategoriesApi();
        setCategories(catsData.results || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    loadCategories();
  }, []);

  // 2. Safe Fetch Logic for Posts
  useEffect(() => {
    const fetchPosts = async () => {
      // SAFE FETCH CHECK: If category or search changed, we MUST be on page 1
      const hasFilterChanged =
        lastFilters.current.category !== activeCategory ||
        lastFilters.current.search !== searchQuery;

      if (hasFilterChanged && currentPage !== 1) {
        // Force page reset and exit. The effect will re-run automatically when currentPage becomes 1.
        setCurrentPage(1);
        return;
      }

      // Update ref for next comparison
      lastFilters.current = { category: activeCategory, search: searchQuery };

      try {
        setLoading(true);

        const categoryId =
          activeCategory !== 'All'
            ? categories.find(c => c.name === activeCategory)?.id
            : undefined;

        // Guard: If we want a specific category but categories list isn't ready, wait.
        if (activeCategory !== 'All' && !categoryId && categories.length > 0)
          return;

        const postsData = await fetchBlogPostsApi({
          page: currentPage,
          is_published: true,
          search: searchQuery,
          category: categoryId,
        });

        setPosts(postsData.results || []);
        setTotalCount(postsData.count || 0);
        setTotalPages(Math.ceil((postsData.count || 0) / 10) || 1);
      } catch (error) {
        console.error('Blog Fetch Error:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to prevent excessive API calls
    const timer = setTimeout(
      () => {
        fetchPosts();
      },
      searchQuery ? 400 : 0,
    );

    return () => clearTimeout(timer);
  }, [currentPage, activeCategory, searchQuery, categories]);

  // Data Slicing for the complex layout
  const featuredPost = posts[0];
  const sidebarPosts = posts.slice(1, 5);
  const horizontalPosts = posts.slice(5, 8);
  const gridPosts = posts.slice(8);

  const formatDate = dateString => {
    if (!dateString) return 'Feb 14, 2025';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCategoryClick = name => {
    if (name !== activeCategory) {
      setActiveCategory(name);
      // Page reset is handled by the "Safe Fetch" logic in useEffect
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 animate-in fade-in duration-700">
      <div className="w-full px-4 md:px-10">
        {/* --- SECTION 1: FEATURED & SIDEBAR --- */}
        <div className="pt-10 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
            Featured Article
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              {featuredPost && (
                <Link
                  href={`/blogs/${featuredPost.slug}`}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[16/9] rounded-[32px] overflow-hidden mb-6">
                    <Image
                      src={getMediaUrl(
                        featuredPost.article_image_url || featuredPost.image,
                      )}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                      unoptimized
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <FiCalendar className="text-gray-400" />
                      {formatDate(featuredPost.created_at)}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight group-hover:text-(--color-primary-500) transition-colors">
                      {featuredPost.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed line-clamp-2 text-lg">
                      {featuredPost.short_description ||
                        featuredPost.content?.substring(0, 160)}
                    </p>
                    <div className="inline-flex items-center gap-2 text-(--color-primary-500) font-bold hover:underline pt-2">
                      Read More <FiChevronRight strokeWidth={3} />
                    </div>
                  </div>
                </Link>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              {sidebarPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/blogs/${post.slug}`}
                  className="flex gap-4 group cursor-pointer border-b border-gray-50 pb-6 last:border-0"
                >
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                    <Image
                      src={getMediaUrl(post.article_image_url || post.image)}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <div className="text-[12px] text-gray-400 font-medium">
                      {formatDate(post.created_at)}
                    </div>
                    <h4 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-(--color-primary-500) transition-colors">
                      {post.title}
                    </h4>
                    <div className="text-[13px] text-(--color-primary-500) font-bold flex items-center gap-1">
                      Read More <FiChevronRight />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* --- SECTION 2: HORIZONTAL ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {horizontalPosts.map(post => (
            <BlogCard key={post.id} post={post} formatDate={formatDate} />
          ))}
        </div>

        {/* --- SECTION 3: MAIN BLOG LISTING --- */}
        <div className="pt-10 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Health & Wellness Blog
            </h2>
            <div className="relative w-full md:w-[400px]">
              <input
                type="text"
                placeholder="Search for 'healthcare products'"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-6 pr-14 rounded-full border border-gray-100 bg-gray-50/30 text-sm focus:outline-none focus:ring-4 focus:ring-(--color-primary-500)/5 focus:bg-white transition-all"
              />
              <button className="absolute right-1.5 top-1.5 w-11 h-11 rounded-full bg-[#1D3583] flex items-center justify-center text-white hover:bg-black transition-colors cursor-pointer">
                <FiSearch size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-12">
            <button
              onClick={() => handleCategoryClick('All')}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all cursor-pointer border ${
                activeCategory === 'All'
                  ? 'bg-black text-white border-black shadow-lg shadow-black/10'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
              }`}
            >
              All Articles
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all cursor-pointer border ${
                  activeCategory === cat.name
                    ? 'bg-black text-white border-black shadow-lg shadow-black/10'
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {posts.length > 0 ? (
              (gridPosts.length > 0 ? gridPosts : posts).map(post => (
                <BlogCard key={post.id} post={post} formatDate={formatDate} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                No articles found
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-50 pt-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Showing {posts.length} of {totalCount} articles
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all cursor-pointer disabled:opacity-30"
              >
                <FiChevronLeft size={20} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  disabled={loading}
                  className={`w-10 h-10 rounded-full font-bold text-sm transition-all cursor-pointer ${
                    currentPage === p
                      ? 'bg-black text-white shadow-md'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all cursor-pointer disabled:opacity-30"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogCard = ({ post, formatDate }) => (
  <Link
    href={`/blogs/${post.slug}`}
    className="group cursor-pointer flex flex-col h-full"
  >
    <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-5">
      <Image
        src={getMediaUrl(post.article_image_url || post.image)}
        alt={post.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        unoptimized
      />
    </div>
    <div className="flex flex-col flex-1 gap-2">
      <div className="flex items-center gap-2 text-gray-400 text-[13px] font-medium">
        <FiCalendar size={14} />
        {formatDate(post.created_at)}
      </div>
      <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-(--color-primary-500) transition-colors">
        {post.title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-2">
        {post.short_description || post.content?.substring(0, 100)}
      </p>
      <div className="mt-auto inline-flex items-center gap-1 text-(--color-primary-500) font-bold text-sm hover:underline">
        Read More <FiChevronRight strokeWidth={3} />
      </div>
    </div>
  </Link>
);

export default Blogs;
