'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BsCart3 } from 'react-icons/bs';
import { GoStarFill } from 'react-icons/go';
import { FiBox } from 'react-icons/fi'; // Imported Box Icon
import { MdArrowForwardIos } from 'react-icons/md';
import { TbCurrencyTaka } from 'react-icons/tb';
import { useCart } from '@/app/(public)/hooks/useCart';
import { formatCurrency } from '@/app/(user)/lib/formatters';
import { PRODUCT_ENDPOINTS, getMediaUrl } from '@/app/(shared)/lib/apiConfig';

const DealsSection = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, isUpdating } = useCart();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch(
          `${PRODUCT_ENDPOINTS.BASE}?is_active=true`,
        );
        const data = await response.json();

        const deals = (data.results || data)
          .filter(p => p.discount_percentage && p.discount_percentage > 0)
          .slice(0, 4);

        setProducts(deals);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product, 1);
  };

  if (isLoading)
    return (
      <div className="h-40 flex items-center justify-center text-gray-400 font-bold">
        Loading Deals...
      </div>
    );
  if (products.length === 0) return null;

  return (
    <div className="pb-[70px] px-4 animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-bold text-lg lg:text-2xl text-gray-900 tracking-tight">
          Unilever: Deals you can&apos;t miss
        </h1>
        <Link href="/products">
          <button className="border border-gray-100 bg-white rounded-full px-5 lg:px-8 py-2.5 lg:py-3.5 text-(--color-primary-500) flex gap-2 lg:gap-3 items-center text-xs lg:text-[14px] font-bold cursor-pointer hover:border-(--color-primary-500) transition-all active:scale-95">
            See All Products
            <MdArrowForwardIos size={14} />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-7">
        {products.map(product => (
          <Link
            href={`/product/${product.slug}`}
            key={product.id}
            className="group"
          >
            <div className="relative flex flex-col md:flex-row gap-5 bg-white p-3 rounded-[24px] border border-gray-100 transition-all hover:border-(--color-primary-500)/30">
              <div className="relative bg-(--color-imageBG) rounded-[18px] w-full md:w-[160px] lg:w-[180px] aspect-square flex items-center justify-center overflow-hidden p-4 shrink-0 border border-gray-50">
                {product.discount_percentage && (
                  <span className="absolute top-2 right-2 bg-(--success-500) text-white text-[10px] font-black px-2.5 py-1 rounded-full z-10 uppercase tracking-tighter">
                    {product.discount_percentage}% OFF
                  </span>
                )}

                {/* Conditional Rendering: Image vs Icon */}
                {product.image ? (
                  <Image
                    src={getMediaUrl(product.image)}
                    alt={product.name}
                    fill
                    className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 p-4"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <FiBox size={48} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      No Photo
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 py-1 pr-2">
                <div>
                  <h1 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-(--color-primary-500) transition-colors truncate">
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

                  <button
                    onClick={e => handleAddToCart(e, product)}
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
