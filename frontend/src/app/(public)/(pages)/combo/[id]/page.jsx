'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiShoppingBag,
  FiCheckCircle,
  FiChevronRight,
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
        await addItem(product, 1);
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
    <div className="w-full animate-in fade-in duration-700 pb-20 overflow-hidden bg-white">
      {/* 1. Breadcrumbs */}
      <nav className="bg-white border border-gray-100/50 rounded-full px-6 py-2 w-fit mb-8 mt-4">
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
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start w-full">
        {/* Left: Image Container */}
        <div className="w-full lg:w-1/2 min-w-0">
          <div
            className="rounded-[32px] p-6 border border-gray-100 w-fit mx-auto lg:mx-0 overflow-hidden"
            style={{ backgroundColor: combo.bg_color || '#F9FAFB' }}
          >
            {combo.image_url ? (
              <Image
                src={getMediaUrl(combo.image_url)}
                alt={combo.title}
                width={600}
                height={600}
                className="max-w-full h-auto block rounded-[24px]"
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
        <div className="w-full lg:w-1/2 min-w-0 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 p-8 space-y-6 shadow-none">
            <div className="space-y-2">
              <span className="text-[12px] font-black text-(--color-primary-500) uppercase tracking-[0.1em]">
                Special Bundle Package
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-none tracking-tighter uppercase">
                {combo.title}
              </h1>
            </div>

            <p className="text-gray-500 font-medium text-sm md:text-base leading-relaxed">
              {combo.description}
            </p>

            <div className="h-px bg-gray-100 w-full" />

            {/* Pricing */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-black text-gray-900 flex items-center">
                  <span className="text-2xl mr-1">৳</span>
                  {parseFloat(combo.price).toLocaleString()}
                </span>
                {combo.original_price && (
                  <span className="text-xl text-gray-400 line-through font-bold">
                    ৳{parseFloat(combo.original_price).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Fixed Bundle Price
              </p>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleAddAllToCart}
                disabled={isUpdating}
                className={`flex-1 h-16 rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 cursor-pointer border-none shadow-none ${
                  isAdded
                    ? 'bg-green-600 text-white'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isAdded ? (
                  <>
                    <FiCheckCircle size={20} /> Bundle Added
                  </>
                ) : (
                  <>
                    <FiShoppingBag size={20} /> Add Bundle to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Included Products List */}
      <div className="mt-16 space-y-10">
        <div className="flex flex-col items-start gap-2 border-b border-gray-100 pb-6">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">
            Bundle Products
          </h2>
          <p className="text-gray-500 font-medium">
            This package includes {combo.products?.length || 0} essential
            medical products.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {combo.products?.map(product => (
            <PopularProductCard key={product.id} product={product} />
          ))}

          {(!combo.products || combo.products.length === 0) && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                No products currently linked to this combo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
