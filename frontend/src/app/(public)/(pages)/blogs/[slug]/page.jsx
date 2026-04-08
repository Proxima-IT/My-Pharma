'use client';

import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiCalendar,
  FiUser,
  FiChevronRight,
  FiImage,
  FiSend,
  FiClock,
} from 'react-icons/fi';
import { useBlogDetails } from '../../../hooks/useBlogDetails';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import { formatDate } from '@/app/(user)/lib/formatters';

/**
 * BlogDetailsPage Component
 * 100% Dynamic implementation. All hardcoded/dummy content removed.
 * Logic: Renders only what is provided by the API.
 */
export default function BlogDetailsPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { post, relatedPosts, isLoading, error } = useBlogDetails(
    resolvedParams.slug,
  );

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <h2 className="text-2xl font-bold text-gray-900">Article Not Found</h2>
        <button
          onClick={() => router.push('/blogs')}
          className="text-(--color-primary-500) font-bold underline cursor-pointer"
        >
          Return to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 animate-in fade-in duration-1000">
      {/* 1. TOP NAVIGATION */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-8 flex items-center gap-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-full text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
        >
          <FiArrowLeft /> Back
        </button>
      </div>

      <article className="max-w-[1000px] mx-auto px-4 sm:px-6">
        {/* 2. DYNAMIC HERO SECTION */}
        <header className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center gap-3">
            {post.category_name && (
              <span className="px-5 py-1.5 bg-[#10B981] text-white text-[12px] font-bold rounded-full uppercase tracking-wide">
                {post.category_name}
              </span>
            )}
            {post.read_time && (
              <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                <FiClock size={14} /> {post.read_time}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight max-w-4xl mx-auto">
            {post.title}
          </h1>

          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <FiCalendar className="text-gray-400" />
              <span>Updated on {formatDate(post.created_at)}</span>
            </div>

            {post.author_name && (
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-200">
                  {post.author_image ? (
                    <Image
                      src={getMediaUrl(post.author_image)}
                      alt={post.author_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <FiUser size={14} />
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                    Written by
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {post.author_name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 3. DYNAMIC CONTENT */}
        <section className="space-y-10">
          {(post.article_image_url || post.image) && (
            <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl shadow-black/5">
              <Image
                src={getMediaUrl(post.article_image_url || post.image)}
                alt={post.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none text-gray-600 leading-relaxed
              prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-3xl prose-h3:text-xl
              prose-p:mb-8
              prose-img:rounded-[32px] prose-img:shadow-lg
              prose-li:font-medium"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </section>

        {/* 4. DYNAMIC COMMENTS SECTION */}
        <section className="mt-20 pt-10 border-t border-gray-100 space-y-10">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Comments{' '}
            <span className="text-gray-300 font-light">
              ({post.comments?.length || 0})
            </span>
          </h3>

          <div className="space-y-8">
            {post.comments?.map(comment => (
              <CommentItem
                key={comment.id}
                name={comment.user_name}
                text={comment.text}
                date={formatDate(comment.created_at)}
              />
            ))}
          </div>

          {/* Comment Input Form */}
          <div className="bg-white p-2 rounded-[32px] border border-gray-100 flex flex-col sm:flex-row items-center gap-2 shadow-sm">
            <input
              type="text"
              placeholder="Your name"
              className="w-full sm:w-1/3 h-14 px-6 rounded-full bg-gray-50/50 border-none outline-none text-sm font-medium focus:bg-white transition-all"
            />
            <div className="flex-1 w-full relative">
              <input
                type="text"
                placeholder="Write your comments ..."
                className="w-full h-14 pl-6 pr-24 rounded-full bg-gray-50/50 border-none outline-none text-sm font-medium focus:bg-white transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                  <FiImage size={20} />
                </button>
                <button className="w-10 h-10 bg-[#1D3583] text-white rounded-full flex items-center justify-center hover:bg-black transition-all cursor-pointer shadow-lg shadow-blue-900/20">
                  <FiSend size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </article>

      {/* 5. DYNAMIC RELATED BLOGS */}
      {relatedPosts.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 md:px-10 mt-32">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Related Blog
            </h2>
            <Link href="/blogs">
              <button className="px-8 py-3 bg-[#1D3583] text-white rounded-full font-bold text-sm flex items-center gap-2 hover:bg-black transition-all cursor-pointer">
                See more Blog <FiChevronRight />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map(related => (
              <Link
                key={related.id}
                href={`/blogs/${related.slug}`}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden mb-6">
                  <Image
                    src={getMediaUrl(
                      related.article_image_url || related.image,
                    )}
                    alt={related.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                    <FiCalendar /> {formatDate(related.created_at)}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-(--color-primary-500) transition-colors line-clamp-2">
                    {related.title}
                  </h4>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                    {related.short_description}
                  </p>
                  <div className="flex items-center gap-1 text-(--color-primary-500) font-bold text-sm pt-1">
                    Read More <FiChevronRight strokeWidth={3} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Comment Item Component
 */
const CommentItem = ({ name, text, date }) => (
  <div className="flex gap-4">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-50 overflow-hidden relative">
      <FiUser size={24} className="text-gray-300" />
    </div>
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h4 className="font-bold text-gray-900">{name || 'Anonymous'}</h4>
      </div>
      <p className="text-[15px] text-gray-600 leading-relaxed max-w-2xl">
        {text}
      </p>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-1">
        {date}
      </p>
    </div>
  </div>
);
