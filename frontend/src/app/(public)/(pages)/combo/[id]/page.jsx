'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiPlus,
  FiShoppingBag,
  FiCheckCircle,
} from 'react-icons/fi';
import { TbCurrencyTaka } from 'react-icons/tb';
import {
  API_BASE_URL,
  getMediaUrl,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';
import { useCart } from '../../../hooks/useCart';
import PopularProductCard from '../../home/components/PopularProductCard';

/**
 * ComboDetailsPage
 * Public Zone: Displays a high-fidelity overview of a product bundle/combo.
 * Design: Premium e-commerce (rounded-[32px], soft shadows).
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

  /**
   * handleAddAllToCart
   * Logic: Iterates through all linked products in the combo and adds them
   * to the user's cart simultaneously.
   */
  const handleAddAllToCart = async () => {
    if (!combo?.products || combo.products.length === 0) return;

    try {
      // Loop through linked products and add each to cart
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
    <div className="w-full space-y-10 pb-20 animate-in fade-in duration-700">
      {/* 1. Hero Header Section */}
      <div
        className="relative w-full rounded-[40px] overflow-hidden min-h-[400px] flex flex-col md:flex-row items-center gap-10 p-8 md:p-16"
        style={{ backgroundColor: combo.bg_color || '#F3F4FF' }}
      >
        <Link
          href="/"
          className="absolute top-8 left-8 p-3 bg-white/20 hover:bg-white/40 rounded-full transition-all backdrop-blur-md z-10"
        >
          <FiArrowLeft size={24} className="text-gray-900" />
        </Link>

        {/* Text Content */}
        <div className="flex-1 space-y-6 z-10 text-center md:text-left">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
              {combo.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-700 font-medium max-w-xl mx-auto md:mx-0">
              {combo.description}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center text-4xl md:text-5xl font-black text-gray-900">
                <TbCurrencyTaka className="text-5xl -ml-2" />
                <span>{parseFloat(combo.price).toLocaleString()}</span>
              </div>
              {combo.original_price && (
                <div className="flex items-center text-xl md:text-2xl text-gray-400 line-through font-bold">
                  <TbCurrencyTaka />
                  <span>
                    {parseFloat(combo.original_price).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleAddAllToCart}
              disabled={isUpdating}
              className={`h-16 px-10 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer ${
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

        {/* Feature Image */}
        <div className="w-full md:w-1/3 aspect-square relative">
          <Image
            src={getMediaUrl(combo.image_url)}
            alt={combo.title}
            fill
            className="object-contain drop-shadow-2xl animate-in slide-in-from-right-10 duration-1000"
            unoptimized
          />
        </div>
      </div>

      {/* 2. Linked Products Grid */}
      <div className="space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight uppercase">
            What&apos;s Inside This Bundle
          </h2>
          <p className="text-gray-500 font-medium">
            Authentic medical products included in this special package.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {combo.products?.map(product => (
            <PopularProductCard key={product.id} product={product} />
          ))}

          {(!combo.products || combo.products.length === 0) && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
              <p className="text-gray-400 font-bold uppercase tracking-widest">
                No products currently linked to this combo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
