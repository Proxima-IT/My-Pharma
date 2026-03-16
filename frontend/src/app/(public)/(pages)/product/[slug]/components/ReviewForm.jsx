'use client';

import React, { useState, useRef } from 'react';
import {
  FiStar,
  FiSend,
  FiAlertCircle,
  FiCamera,
  FiX,
  FiPlus,
  FiLock,
} from 'react-icons/fi';
import { useReviews } from '../../../../hooks/useReviews';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

/**
 * ReviewForm Component
 * Updated: Handles login redirection, purchase validation errors, and multi-image uploads.
 */
const ReviewForm = ({ productId, onReviewSubmitted, onCancel }) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    submitReview,
    isSubmitting,
    error: hookError,
  } = useReviews(productId);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setLocalError('Maximum 5 images allowed.');
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setImages(prev => [...prev, ...files]);
    setLocalError('');
  };

  const removeImage = index => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLocalError('');

    // 1. Auth Check
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // 2. Validation
    if (rating === 0) {
      setLocalError('Please select a rating.');
      return;
    }
    if (!title.trim()) {
      setLocalError('Please add a title.');
      return;
    }
    if (comment.trim().length < 10) {
      setLocalError('Review is too short (min 10 chars).');
      return;
    }

    try {
      await submitReview({ rating, title, comment, images });
      // Reset on success
      setRating(0);
      setTitle('');
      setComment('');
      setImages([]);
      setPreviews([]);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      // Errors like "You haven't bought this product" are caught by the hook
    }
  };

  return (
    <div className="bg-gray-50/50 border border-gray-100 rounded-[32px] p-6 md:p-10 animate-in fade-in zoom-in-95 duration-300">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Write a Review</h3>
            <p className="text-sm text-gray-500">
              Only verified purchasers can submit reviews.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-fit px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>

        {/* Star Rating */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className="cursor-pointer transition-transform hover:scale-110 active:scale-90"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <FiStar
                  size={32}
                  className={
                    star <= (hover || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200'
                  }
                />
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 gap-6">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Review Title (e.g. Very Effective)"
            className="w-full h-14 px-6 bg-white border border-gray-100 rounded-full text-[15px] focus:outline-none focus:border-(--color-primary-500)/30 transition-all"
          />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Describe your experience with this product..."
            className="w-full min-h-[120px] p-6 bg-white border border-gray-100 rounded-[24px] text-[15px] focus:outline-none focus:border-(--color-primary-500)/30 transition-all resize-none"
          />
        </div>

        {/* Images */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {previews.map((src, index) => (
              <div
                key={index}
                className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 group"
              >
                <Image src={src} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                >
                  <FiX />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-(--color-primary-500) hover:border-(--color-primary-500) transition-all cursor-pointer"
              >
                <FiCamera size={24} />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* Error Display - Critical for Purchase Validation */}
        {(localError || hookError) && (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 p-5 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
            <FiAlertCircle className="shrink-0" size={20} />
            <p className="text-sm font-bold uppercase tracking-tight">
              {localError ||
                (typeof hookError === 'object'
                  ? 'Purchase Verification Failed'
                  : hookError)}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-12 h-16 bg-[#1D3583] text-white rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 shadow-xl shadow-blue-900/10"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Post Review</span>
              <FiSend size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
