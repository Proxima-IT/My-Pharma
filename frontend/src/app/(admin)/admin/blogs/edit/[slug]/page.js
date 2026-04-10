'use client';

import React, { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiArrowLeft,
  FiSave,
  FiImage,
  FiX,
  FiUpload,
  FiType,
  FiEye,
  FiRefreshCw,
  FiHash,
} from 'react-icons/fi';
import { useBlogAdmin } from '../../../../hooks/useBlogAdmin';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * AdminBlogEditPage
 * Strictly follows the Super Admin "Sharp Minimalist" design system.
 * Features: Data pre-filling, multipart update support, and category mapping.
 */
export default function AdminBlogEditPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const fileInputRef = useRef(null);

  const {
    categories,
    fetchCategories,
    fetchPostBySlug,
    updatePost,
    isUpdating,
    error,
  } = useBlogAdmin();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    short_description: '',
    content: '',
    is_published: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  // 1. Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true);
      try {
        await fetchCategories({ is_active: true });
        const post = await fetchPostBySlug(slug);

        if (post) {
          setFormData({
            title: post.title || '',
            slug: post.slug || '',
            category: post.category || '',
            short_description: post.short_description || '',
            content: post.content || '',
            is_published: post.is_published ?? true,
          });
          if (post.article_image_url || post.article_image) {
            setPreviewUrl(
              getMediaUrl(post.article_image_url || post.article_image),
            );
          }
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setIsFetching(false);
      }
    };
    loadData();
  }, [slug, fetchCategories, fetchPostBySlug]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const data = new FormData();
    // Only append fields that are present
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append('article_image', imageFile);

    const success = await updatePost(slug, data);
    if (success) {
      router.push('/admin/blogs');
    }
  };

  if (isFetching) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <FiRefreshCw className="animate-spin text-[#3A5A40]" size={32} />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#8A8A78]">
          Retrieving Article Data...
        </span>
      </div>
    );
  }

  const labelClass =
    'font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-11 px-4 bg-white border border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-200 text-[#1B1B1B]';
  const textareaClass =
    'w-full p-4 bg-white border border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all placeholder:text-gray-200 text-[#1B1B1B]';

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-6">
        <div className="space-y-4">
          <Link
            href="/admin/blogs"
            className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#8A8A78] hover:text-[#1B1B1B] transition-colors"
          >
            <FiArrowLeft /> Back to Archive
          </Link>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-[#1B1B1B]">
            Edit Article
          </h1>
          <div className="flex gap-4 font-mono text-[10px] font-bold text-[#8A8A78] mt-2 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <FiHash /> Slug: {slug}
            </span>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="h-14 px-10 bg-[#1B1B1B] text-white font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 hover:bg-[#3A5A40] transition-all cursor-pointer disabled:opacity-50"
        >
          {isUpdating ? (
            'Updating...'
          ) : (
            <>
              <FiSave size={18} /> Save Changes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-xs uppercase">
          System Error: {typeof error === 'object' ? 'Update failed' : error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest border-b border-gray-50 pb-4 mb-4 flex items-center gap-2 text-[#1B1B1B]">
              <FiType className="text-[#3A5A40]" /> Editorial Content
            </h3>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>Article Headline</label>
                <input
                  name="title"
                  required
                  className={inputClass + ' text-lg font-bold h-14'}
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className={labelClass}>Short Teaser Description</label>
                <textarea
                  name="short_description"
                  rows="3"
                  className={textareaClass + ' uppercase'}
                  value={formData.short_description}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Main Body Content (HTML Supported)
                </label>
                <textarea
                  name="content"
                  required
                  rows="15"
                  className={textareaClass}
                  value={formData.content}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Metadata Area */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest border-b border-gray-50 pb-4 flex items-center gap-2 text-[#1B1B1B]">
              <FiEye className="text-[#3A5A40]" /> Meta Configuration
            </h3>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>URL Slug Identifier</label>
                <input
                  name="slug"
                  required
                  className={inputClass}
                  value={formData.slug}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className={labelClass}>Content Category</label>
                <select
                  name="category"
                  required
                  className={inputClass}
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {categories.results?.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 border border-gray-100 group">
                  <input
                    type="checkbox"
                    name="is_published"
                    className="w-5 h-5 accent-[#3A5A40]"
                    checked={formData.is_published}
                    onChange={handleInputChange}
                  />
                  <span className="font-mono text-[11px] font-bold text-[#1B1B1B] uppercase tracking-widest group-hover:text-[#3A5A40] transition-colors">
                    Published Status
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest border-b border-gray-50 pb-4 flex items-center gap-2 text-[#1B1B1B]">
              <FiImage className="text-[#3A5A40]" /> Cover Asset
            </h3>

            <div
              onClick={() => fileInputRef.current.click()}
              className="relative aspect-video border-2 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#3A5A40] transition-all overflow-hidden group"
            >
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={24} />
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <FiUpload className="mx-auto text-gray-300 mb-2" size={24} />
                  <p className="font-mono text-[9px] font-bold text-gray-400 uppercase">
                    Change Hero Image
                  </p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
