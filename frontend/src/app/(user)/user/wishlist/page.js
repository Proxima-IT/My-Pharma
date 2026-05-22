'use client';
import React from 'react';
import Link from 'next/link';
import { FiHeart, FiArrowLeft, FiInfo } from 'react-icons/fi';
import ProductCard from './components/ProductCard';
import UiButton from '@/app/(public)/components/UiButton';
import { useWishlist } from '@/app/(public)/hooks/useWishlist';

export default function WishlistPage() {
  const { items, isLoading, toggle } = useWishlist();

  const handleRemove = async wishlistId => {
    // Find the item to get the product_id for the toggle function
    const item = items.find(i => i.id === wishlistId);
    if (item) {
      await toggle({ id: item.product_id });
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Mobile Sub-Page Header */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          My Wishlist
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-normal">
          Products you&apos;ve saved for later.
        </p>
      </div>

      {isLoading ? (
        <div className="w-full py-20 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {items.map(item => (
            <ProductCard
              key={item.id}
              product={{
                id: item.id,
                name: item.product_name,
                price: item.product_price,
                oldPrice: item.product_original_price,
                image: item.image_url,
                slug: item.product_slug,
              }}
              onRemove={() => handleRemove(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] py-24 flex flex-col items-center text-center px-6 border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
            <FiHeart size={36} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Your wishlist is empty
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto font-normal leading-relaxed">
            Save your favorite healthcare products here to easily find and order
            them later.
          </p>
          <Link href="/" className="mt-8">
            <UiButton variant="outline">
              <span className="px-6">Start Shopping</span>
            </UiButton>
          </Link>
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-center justify-center gap-2 text-gray-400 pt-10">
        <FiInfo className="text-sm" />
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Prices and availability are subject to change
        </p>
      </div>
    </div>
  );
}
