'use client';
import React, { useState, useRef } from 'react';
import {
  FiImage,
  FiPlus,
  FiTrash2,
  FiRefreshCw,
  FiCheck,
  FiUpload,
  FiX,
  FiEdit2,
} from 'react-icons/fi';
import { useLogoAdmin } from '@/app/(admin)/hooks/useLogoAdmin';
import Image from 'next/image';

/**
 * LogoSettings Component
 * Features: Multi-part FormData Upload & Edit, Sharp Design System.
 */
export default function LogoSettings() {
  const { logos, loading, error, addLogo, updateLogo, deleteLogo, fetchLogos } =
    useLogoAdmin();
  const [newLogo, setNewLogo] = useState({ slug: '', file: null });
  const [isAdding, setIsAdding] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [editData, setEditData] = useState({ slug: '', file: null });
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setEditData({ ...editData, file: file });
      } else {
        setNewLogo({ ...newLogo, file: file });
      }
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddLogo = async e => {
    e.preventDefault();
    if (!newLogo.file || !newLogo.slug) return;
    try {
      const formData = new FormData();
      formData.append('slug', newLogo.slug);
      formData.append('image', newLogo.file);
      await addLogo(formData);
      resetForm();
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleUpdateLogo = async e => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('slug', editData.slug);
      if (editData.file) formData.append('image', editData.file);
      await updateLogo(editingSlug, formData);
      resetForm();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const resetForm = () => {
    setNewLogo({ slug: '', file: null });
    setEditData({ slug: '', file: null });
    setEditingSlug(null);
    setIsAdding(false);
    setPreview(null);
  };

  const startEdit = logo => {
    setEditingSlug(logo.slug);
    setEditData({ slug: logo.slug, file: null });
    setPreview(logo.image_url);
    setIsAdding(false);
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B]';

  return (
    <div className="bg-white border border-gray-100 p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-6">
        <h3 className="font-mono text-xs font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
          <FiImage className="text-[#3A5A40]" /> Brand Assets (Logos)
        </h3>
        <button
          onClick={() => fetchLogos()}
          className="p-2 hover:bg-gray-50 text-gray-400 hover:text-[#3A5A40] transition-colors"
        >
          <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 font-mono text-[10px] text-red-600 uppercase">
          Error: {typeof error === 'object' ? 'Action Failed' : error}
        </div>
      )}

      {/* Action Area: Add or Edit Form */}
      <div className="w-full">
        {isAdding || editingSlug ? (
          <form
            onSubmit={editingSlug ? handleUpdateLogo : handleAddLogo}
            className="w-full border-2 border-[#3A5A40] p-8 space-y-6 bg-white animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#3A5A40]">
                {editingSlug ? `Editing: ${editingSlug}` : 'New Brand Asset'}
              </span>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-400 hover:text-red-600"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Logo Identifier (Slug)</label>
                  <input
                    required
                    className={inputClass}
                    value={editingSlug ? editData.slug : newLogo.slug}
                    onChange={e => {
                      const val = e.target.value
                        .toUpperCase()
                        .replace(/\s+/g, '-');
                      editingSlug
                        ? setEditData({ ...editData, slug: val })
                        : setNewLogo({ ...newLogo, slug: val });
                    }}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-14 bg-[#3A5A40] text-white font-mono text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#1B1B1B] transition-colors disabled:opacity-50"
                  >
                    {loading
                      ? 'PROCESSING...'
                      : editingSlug
                        ? 'UPDATE ASSET'
                        : 'SAVE ASSET'}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>File Preview</label>
                <div
                  onClick={() =>
                    (editingSlug
                      ? editFileInputRef
                      : fileInputRef
                    ).current.click()
                  }
                  className="w-full aspect-[2/1] border border-gray-200 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all relative overflow-hidden bg-gray-50/50"
                >
                  {preview ? (
                    <>
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-contain p-6"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FiRefreshCw className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <>
                      <FiUpload size={32} className="text-gray-300 mb-3" />
                      <span className="font-mono text-[10px] text-gray-400 uppercase font-bold">
                        Click to select image
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={editingSlug ? editFileInputRef : fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={e => handleFileChange(e, !!editingSlug)}
                />
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full border-2 border-dashed border-gray-200 py-12 flex flex-col items-center justify-center gap-3 text-[#8A8A78] hover:text-[#3A5A40] hover:border-[#3A5A40] hover:bg-gray-50 transition-all group"
          >
            <FiPlus
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
              Upload New Logo Asset
            </span>
          </button>
        )}
      </div>

      {/* Existing Logos Grid */}
      {logos.length > 0 && !isAdding && !editingSlug && (
        <div className="pt-8 border-t border-gray-50">
          <label className={labelClass + ' mb-6'}>
            Existing Library Assets
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos.map(logo => (
              <div
                key={logo.id}
                className="group relative border border-gray-200 p-4 flex flex-col gap-4 hover:border-[#3A5A40] transition-all bg-white"
              >
                <div className="relative w-full aspect-[3/1] bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                  {logo.image_url ? (
                    <Image
                      src={logo.image_url}
                      alt={logo.slug}
                      fill
                      className="object-contain p-4"
                      unoptimized
                    />
                  ) : (
                    <FiImage size={24} className="text-gray-200" />
                  )}
                </div>
                <div className="flex items-center justify-between px-1">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-black text-[#1B1B1B] uppercase tracking-wider truncate">
                      {logo.slug}
                    </p>
                    <p className="font-mono text-[8px] text-[#8A8A78] mt-0.5 uppercase">
                      ID: {logo.id}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(logo)}
                      className="p-2 text-gray-300 hover:text-[#3A5A40] hover:bg-gray-50 transition-all"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteLogo(logo.slug)}
                      className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-50 flex items-center justify-between font-mono text-[9px] text-[#8A8A78] uppercase">
        <span className="flex items-center gap-1">
          <FiCheck className="text-green-600" /> API Connection: Verified
        </span>
        <span>System: v1.0.4-Stable</span>
      </div>
    </div>
  );
}
