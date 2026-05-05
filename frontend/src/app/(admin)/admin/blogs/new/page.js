'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  FiLayers,
  FiEye,
} from 'react-icons/fi';
import { useBlogAdmin } from '../../../hooks/useBlogAdmin';

/**
 * AdminBlogCreatePage
 * Strictly follows the Super Admin "Sharp Minimalist" design system.
 * Features: Image upload, category selection, and HTML-ready content area.
 */
export default function AdminBlogCreatePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { categories, fetchCategories, createPost, isUpdating, error } =
    useBlogAdmin();

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

  // Load categories for the dropdown
  useEffect(() => {
    fetchCategories({ is_active: true });
  }, [fetchCategories]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const newData = { ...prev, [name]: val };
      // Auto-generate slug from title if slug field hasn't been manually edited
      if (name === 'title' && !prev.slug) {
        newData.slug = value
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '');
      }
      return newData;
    });
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
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append('article_image', imageFile);

    const success = await createPost(data);
    if (success) {
      router.push('/admin/blogs');
    }
  };

  const labelClass =
    'font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-11 px-4 bg-white border border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-200 text-[#1B1B1B]';
  const textareaClass =
    'w-full p-4 bg-white border border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all placeholder:text-gray-200 text-[#1B1B1B]';

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-6">
        <div className="space-y-4">
          <Link
            href="/admin/blogs"
            className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#8A8A78] hover:text-[#1B1B1B] transition-colors"
          >
            <FiArrowLeft /> Return To Archive
          </Link>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-[#1B1B1B]">
            Draft New Article
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="h-14 px-10 bg-[#1B1B1B] text-white font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 hover:bg-[#3A5A40] transition-all cursor-pointer disabled:opacity-50"
        >
          {isUpdating ? (
            'SYNCING CORE...'
          ) : (
            <>
              <FiSave size={18} /> Deploy Article
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-xs uppercase">
          System Error:{' '}
          {typeof error === 'object' ? 'Validation Failed' : error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest border-b border-gray-50 pb-4 flex items-center gap-2 text-[#1B1B1B]">
              <FiType className="text-[#3A5A40]" /> Editorial Content
            </h3>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>Article Headline</label>
                <input
                  name="title"
                  required
                  className={inputClass + ' text-lg font-bold h-14'}
                  placeholder="ENTER TITLE HERE..."
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
                  placeholder="BRIEF SUMMARY FOR CARDS..."
                  value={formData.short_description}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Main Body Content (HTML SUPPORTED)
                </label>
                <textarea
                  name="content"
                  required
                  rows="15"
                  className={textareaClass}
                  placeholder="WRITE ARTICLE MARKUP HERE..."
                  value={formData.content}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Metadata Area */}
        <div className="lg:col-span-4 space-y-8">
          {/* Publication Settings */}
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
                  placeholder="article-url-slug"
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
                  <option value="">SELECT CATEGORY</option>
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
                    Publish Immediately
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Featured Image */}
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
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={24} />
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <FiUpload className="mx-auto text-gray-300 mb-2" size={24} />
                  <p className="font-mono text-[9px] font-bold text-gray-400 uppercase">
                    Click To Upload Hero Image
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
            {previewUrl && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(null);
                }}
                className="w-full py-2 font-mono text-[9px] font-bold text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
              >
                Remove Asset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
