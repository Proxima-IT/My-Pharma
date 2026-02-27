'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BsCart3 } from 'react-icons/bs';
import { GoStarFill } from 'react-icons/go';
import { MdArrowForwardIos } from 'react-icons/md';
import { TbCurrencyTaka } from 'react-icons/tb';
import { useCart } from '@/app/(public)/hooks/useCart';
import { formatCurrency } from '@/app/(user)/lib/formatters';

const DealsSection = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, isUpdating } = useCart();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        // Fetching products. In a real scenario, you might filter by brand 'Unilever'
        // or a 'is_deal' flag. Here we fetch general products to map data.
        const response = await fetch(
          'http://localhost:8000/api/products/?is_active=true',
        );
        const data = await response.json();

        // Filter products that actually have a discount for the "Deals" section
        const deals = (data.results || data)
          .filter(p => p.discount_percentage && p.discount_percentage > 0)
          .slice(0, 4); // Limit to 4 deals for the grid

        setProducts(deals);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(productId, 1);
  };

  if (isLoading)
    return (
      <div className="h-40 flex items-center justify-center text-gray-400 font-bold">
        Loading Deals...
      </div>
    );
  if (products.length === 0) return null;

  return (
    <div className="pt-[70px] px-4 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-lg lg:text-2xl text-gray-900 tracking-tight">
          Top Deals you can&apos;t miss
        </h1>
        <Link href="/products">
          <button className="border border-gray-100 bg-white rounded-full px-4 lg:px-6 py-2 lg:py-3 text-(--color-primary-500) flex gap-2 lg:gap-3 items-center text-xs lg:text-sm font-bold cursor-pointer hover:border-(--color-primary-500) transition-all active:scale-95">
            See All Products
            <span>
              <MdArrowForwardIos />
            </span>
          </button>
        </Link>
      </div>

      {/* Product card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-7">
        {products.map(product => (
          <Link
            href={`/product/${product.slug}`}
            key={product.id}
            className="group"
          >
            <div className="relative flex flex-col md:flex-row gap-5 bg-white p-3 rounded-[24px] border border-gray-100 transition-all hover:border-(--color-primary-500)/30">
              {/* 1. Image wrapper */}
              <div className="relative bg-(--color-imageBG) rounded-[18px] w-full md:w-[160px] lg:w-[180px] aspect-square flex items-center justify-center overflow-hidden p-4 shrink-0 border border-gray-50">
                {/* Real Discount badge from API */}
                {product.discount_percentage && (
                  <span className="absolute top-2 right-2 bg-(--success-500) text-white text-[10px] font-black px-2.5 py-1 rounded-full z-10 uppercase tracking-tighter">
                    {product.discount_percentage}% OFF
                  </span>
                )}

                {/* Product image using global loader */}
                <Image
                  src={product.image || '/assets/images/placeholder.png'}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="max-w-[85%] max-h-[85%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  priority
                />
              </div>

              {/* 2. Product Information */}
              <div className="flex flex-col flex-1 py-1 pr-2">
                <div>
                  <h1 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-(--color-primary-500) transition-colors">
                    {product.name}
                  </h1>
                  <div className="flex gap-2 items-center mt-2">
                    <GoStarFill className="text-[#FFC831]" />
                    <span className="text-sm font-bold text-gray-900">
                      {parseFloat(product.rating_avg || 0).toFixed(1)}
                    </span>
                    <p className="text-xs text-gray-400 font-medium">
                      ({product.review_count || 0} Reviews)
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase mt-2 tracking-widest">
                    {product.unit_label || 'Standard Pack'}
                  </p>
                </div>

                {/* 3. Price and Buy Section */}
                <div className="flex items-center justify-between mt-auto pt-4">
                  <div className="flex flex-col">
                    <div className="flex items-center text-xl font-black text-gray-900">
                      <TbCurrencyTaka className="text-2xl -ml-1" />
                      <span>{parseFloat(product.price).toLocaleString()}</span>
                    </div>

                    {product.original_price && (
                      <span className="flex items-center text-xs text-gray-400 line-through font-bold ml-1">
                        <TbCurrencyTaka />
                        <span>
                          {parseFloat(product.original_price).toLocaleString()}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Cart Button */}
                  <button
                    onClick={e => handleAddToCart(e, product.id)}
                    disabled={isUpdating}
                    className="w-11 h-11 bg-(--color-primary-25) rounded-full border border-(--color-primary-50) flex items-center justify-center text-(--color-primary-500) cursor-pointer hover:bg-(--color-primary-500) hover:text-white transition-all active:scale-90 disabled:opacity-50"
                  >
                    <BsCart3
                      size={18}
                      className={isUpdating ? 'animate-bounce' : ''}
                    />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DealsSection;
