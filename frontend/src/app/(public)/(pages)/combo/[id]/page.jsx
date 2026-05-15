'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiShoppingBag,
  FiCheckCircle,
  FiChevronRight,
  FiMinus,
  FiPlus,
} from 'react-icons/fi';
import { TbCurrencyTaka } from 'react-icons/tb';
import {
  API_BASE_URL,
  getMediaUrl,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';
import { useCart } from '../../../hooks/useCart';
import PopularProductCard from '../../home/components/PopularProductCard';
import UiButton from '@/app/(public)/components/UiButton';

/**
 * ComboDetailsPage
 * Refactored: Aligned with the standard product detail page layout for consistency.
 * Design: Two-column grid (Image | Summary), premium rounded corners, no shadows.
 */
export default function ComboDetailsPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { addItem, isUpdating } = useCart();
  const [combo, setCombo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchCombo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/combos/${id}/`);
        const data = await parseJsonResponse(res);
        setCombo(data);
      } catch (err) {
        console.error('Failed to load combo details', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchCombo();
  }, [id]);

  const handleAddAllToCart = async () => {
    if (!combo?.products || combo.products.length === 0) return;

    try {
      for (const product of combo.products) {
        await addItem(product, quantity);
      }
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 3000);
    } catch (err) {
      console.error('Failed to add combo products to cart', err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="w-full py-20 text-center bg-white">
        <h2 className="text-2xl font-bold text-gray-900 uppercase">
          Combo Not Found
        </h2>
        <Link
          href="/"
          className="text-(--color-primary-500) font-bold underline mt-4 inline-block"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700 pb-20 bg-gray-50/50 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 pt-8">
        <div className="bg-white rounded-[48px] border border-gray-100 p-6 md:p-12 lg:p-16 shadow-[0_24px_80px_rgba(0,0,0,0.02)]">
          {/* 1. Breadcrumbs */}
          <nav className="bg-gray-50 border border-gray-100 rounded-full px-6 py-2.5 w-fit mb-12">
            <ol className="flex items-center gap-2 text-[11px] whitespace-nowrap uppercase tracking-wider">
              <li className="flex items-center gap-2">
                <Link
                  href="/"
                  className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-bold"
                >
                  Home
                </Link>
                <span className="text-gray-300 font-light">{'>'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-900 font-black truncate max-w-[150px]">
                  {combo.title}
                </span>
              </li>
            </ol>
          </nav>

          {/* 2. Main Detail Grid */}
          <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 items-start w-full">
            {/* Left: Image Container */}
            <div className="w-full lg:w-1/2 min-w-0">
              <div
                className="rounded-[40px] p-8 border border-gray-100 w-full flex items-center justify-center overflow-hidden shadow-sm"
                style={{ backgroundColor: combo.bg_color || '#F9FAFB' }}
              >
                {combo.image_url ? (
                  <Image
                    src={getMediaUrl(combo.image_url)}
                    alt={combo.title}
                    width={600}
                    height={600}
                    className="w-full h-auto block rounded-[32px] hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <span className="text-gray-300 font-bold uppercase text-center px-4">
                      No Image Available
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Summary Card */}
            <div className="w-full lg:w-1/2 min-w-0 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-(--color-primary-50) rounded-full">
                  <span className="w-2 h-2 bg-(--color-primary-500) rounded-full animate-pulse" />
                  <span className="text-[12px] font-black text-(--color-primary-600) uppercase tracking-widest">
                    Exclusive Bundle
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tighter uppercase">
                  {combo.title}
                </h1>
              </div>

              <p className="text-gray-500 font-medium text-base md:text-lg leading-relaxed max-w-xl">
                {combo.description}
              </p>

              <div className="h-px bg-gray-100 w-full" />

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl md:text-6xl font-black text-gray-900 flex items-center tracking-tighter">
                    <span className="text-3xl mr-1">৳</span>
                    {parseFloat(combo.price).toLocaleString()}
                  </span>
                  {combo.original_price && (
                    <span className="text-2xl text-gray-300 line-through font-bold">
                      ৳{parseFloat(combo.original_price).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-500" />
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                    Guaranteed Savings on this Bundle
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              {/* Quantity Selector */}
              <div className="flex items-center gap-8">
                <span className="text-[12px] font-black text-gray-900 uppercase tracking-widest">
                  Select Quantity
                </span>
                <div className="flex items-center bg-gray-50 rounded-full p-1.5 border border-gray-100">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-gray-600 bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <FiMinus size={18} />
                  </button>
                  <span className="w-16 text-center text-xl font-black text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-gray-600 bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleAddAllToCart}
                  disabled={isUpdating}
                  className={`flex-1 h-20 rounded-full font-black text-base uppercase tracking-[0.25em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 cursor-pointer border-none shadow-xl ${
                    isAdded
                      ? 'bg-green-600 text-white shadow-green-200'
                      : 'bg-black text-white hover:bg-gray-900 shadow-gray-200'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <FiCheckCircle size={24} /> Bundle Added
                    </>
                  ) : (
                    <>
                      <FiShoppingBag size={24} /> Add Bundle to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 3. Included Products List */}
          <div className="mt-24 space-y-12">
            <div className="flex flex-col items-start gap-3 border-b border-gray-100 pb-8">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase">
                What&apos;s Inside
              </h2>
              <p className="text-gray-500 font-medium text-lg">
                This package includes {combo.products?.length || 0} essential
                medical products.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {combo.products?.map(product => (
                <PopularProductCard key={product.id} product={product} />
              ))}

              {(!combo.products || combo.products.length === 0) && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[40px] bg-gray-50/30">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                    No products currently linked to this combo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
