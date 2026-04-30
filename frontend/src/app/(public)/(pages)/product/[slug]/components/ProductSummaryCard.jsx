'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoStarFill } from 'react-icons/go';
import { BsCart3 } from 'react-icons/bs';
import { FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../../../../hooks/useCart';
import { API_BASE_URL, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

/**
 * ProductSummaryCard Component
 * Refined Scaling for Laptop (1280x800) and Desktop.
 * Updated: Implemented ID-to-Slug mapping for Category navigation and dynamic units.
 * Design: No shadows, rounded-[32px], premium typography.
 */
const ProductSummaryCard = ({ product }) => {
  const router = useRouter();
  const { addItem, isUpdating } = useCart();
  const [selectedDosage, setSelectedDosage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [categorySlug, setCategorySlug] = useState('');
  const maxStock = Number(product?.quantity_in_stock || 0);

  // --- ID TO SLUG MAPPING LOGIC ---
  useEffect(() => {
    const fetchMapping = async () => {
      if (!product?.category) return;
      try {
        // Fetch categories to find the slug corresponding to the category ID
        const res = await fetch(`${API_BASE_URL}/categories/`);
        const data = await parseJsonResponse(res);
        const list = Array.isArray(data) ? data : data.results || [];
        const match = list.find(c => c.id === product.category);
        if (match) {
          setCategorySlug(match.slug);
        }
      } catch (err) {
        console.error('Failed to map category slug:', err);
      }
    };
    fetchMapping();
  }, [product?.category]);

  const ratingAvg = useMemo(() => {
    const val = parseFloat(product?.rating_avg || 0);
    return isNaN(val) ? '0.0' : val.toFixed(1);
  }, [product?.rating_avg]);

  const reviewCountDisplay = useMemo(() => {
    const count = product?.review_count || 0;
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : count;
  }, [product?.review_count]);

  const availableDosages = useMemo(() => {
    if (!product?.dosages) return [];
    if (Array.isArray(product.dosages)) return product.dosages;
    return product.dosages
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);
  }, [product?.dosages]);

  useEffect(() => {
    if (availableDosages.length > 0 && !selectedDosage) {
      setSelectedDosage(availableDosages[0]);
    }
  }, [availableDosages, selectedDosage]);

  const handleAddToCart = async () => {
    if (maxStock > 0 && quantity > maxStock) {
      return;
    }
    if (product?.id) {
      const productWithSelection = {
        ...product,
        selected_dosage: selectedDosage,
      };
      await addItem(productWithSelection, quantity);
    }
  };

  /**
   * Logic to determine the display unit (e.g., Strip, Bottle, Box)
   * derived from the backend unit_name.
   */
  const unitName = useMemo(() => {
    const label = product?.unit_name || '';
    // Extract the packaging type (first word) e.g. 'Strip' from 'Strip of 10 Tablets'
    return label.split(' ')[0] || 'Unit';
  }, [product?.unit_name]);

  const quantitySubtext = useMemo(() => {
    const unitsPerPackage = parseInt(
      product?.unit_name?.match(/\d+/)?.[0] || 1,
    );
    const pluralUnit = quantity > 1 ? `${unitName}s` : unitName;
    return `${quantity} ${pluralUnit} (${quantity * unitsPerPackage} Total Units)`;
  }, [quantity, product?.unit_name, unitName]);

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-5 lg:p-5 xl:p-8 w-full space-y-4 lg:space-y-4 xl:space-y-7 shadow-none transition-all">
      {/* 1. Clickable Category - Using mapped slug */}
      <Link
        href={categorySlug ? `/category/${categorySlug}` : '#'}
        className="text-[11px] lg:text-[12px] xl:text-[15px] font-bold text-[#10B981] uppercase tracking-tight hover:underline block w-fit"
      >
        {product?.category_name || 'Category'}
      </Link>

      {/* 2. Title & Clickable Generic Name */}
      <div className="space-y-0.5 lg:space-y-1">
        <h1 className="text-xl sm:text-2xl lg:text-[22px] xl:text-[32px] 2xl:text-[40px] font-bold text-gray-900 leading-[1.1] tracking-tight uppercase">
          {product?.name || 'Product Name'}
        </h1>
        <Link
          href={`/products?ingredient_id=${product?.ingredient || ''}`}
          className="text-sm sm:text-base lg:text-[15px] xl:text-[18px] 2xl:text-[20px] text-gray-500 font-medium hover:text-[#1D3583] hover:underline transition-colors block w-fit"
        >
          {product?.ingredient_name || 'Generic Name'}
        </Link>
      </div>

      {/* 3. Brand Link */}
      <Link
        href={`/products?brand=${product?.brand}`}
        className="flex items-center gap-1 text-[12px] lg:text-[13px] xl:text-[15px] font-bold text-[#1D3583] uppercase tracking-wide hover:underline w-fit"
      >
        {product?.brand_name || 'Brand Name'}
        <FiChevronRight className="w-3.5 h-3.5 xl:w-4 xl:h-4" strokeWidth={3} />
      </Link>

      {/* 4. Rating Section */}
      <div className="flex items-center gap-2 py-0.5">
        <GoStarFill className="text-[#FFC831] text-base lg:text-lg xl:text-[22px]" />
        <span className="text-sm lg:text-base xl:text-[20px] font-bold text-gray-900">
          {ratingAvg}
        </span>
        <span className="text-[11px] lg:text-[13px] xl:text-[18px] text-gray-400 font-medium">
          ({reviewCountDisplay} Reviews)
        </span>
      </div>

      <div className="h-px bg-gray-100 w-full" />

      {/* 5. Pricing & Unit */}
      <div className="space-y-0.5">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl lg:text-[28px] xl:text-[36px] 2xl:text-[42px] font-bold text-gray-900 flex items-center">
            <span className="text-lg sm:text-xl lg:text-[20px] xl:text-[28px] mr-0.5">
              ৳
            </span>
            {Math.floor(product?.price || 0)}
          </span>
          {product?.original_price && (
            <span className="text-sm sm:text-lg lg:text-[16px] xl:text-[22px] text-gray-400 line-through font-medium flex items-center">
              <span className="mr-0.5">৳</span>
              {product.original_price}
            </span>
          )}
        </div>
        <p className="text-[11px] lg:text-[13px] xl:text-[18px] text-gray-500 font-bold uppercase tracking-tight">
          {product?.unit_name || 'Unit'}
        </p>
      </div>

      <div className="h-px bg-gray-100 w-full" />

      {/* 7. Quantity Selector */}
      <div className="space-y-2 lg:space-y-3 xl:space-y-4">
        <p className="text-sm lg:text-[15px] xl:text-[18px] font-bold text-gray-900 uppercase">
          Select Quantity
        </p>
        <div className="space-y-1.5 lg:space-y-2">
          <div className="flex items-center gap-3 xl:gap-4">
            <button
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              className="w-9 h-9 lg:w-10 xl:w-[54px] lg:h-10 xl:h-[54px] rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#1D3583] hover:brightness-95 transition-all cursor-pointer shadow-none"
            >
              <FiMinus
                className="w-4 h-4 lg:w-5 xl:w-6 xl:h-6"
                strokeWidth={2.5}
              />
            </button>
            <div className="w-14 lg:w-16 xl:w-[110px] h-9 lg:h-10 xl:h-[54px] bg-white border border-gray-100 rounded-xl xl:rounded-[20px] flex items-center justify-center shadow-none">
              <span className="text-sm lg:text-base xl:text-[20px] font-bold text-gray-900">
                {quantity}
              </span>
            </div>
            <button
              onClick={() => setQuantity(quantity + 1)}
              disabled={maxStock > 0 && quantity >= maxStock}
              className="w-9 h-9 lg:w-10 xl:w-[54px] lg:h-10 xl:h-[54px] rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#1D3583] hover:brightness-95 transition-all cursor-pointer shadow-none"
            >
              <FiPlus
                className="w-4 h-4 lg:w-5 xl:w-6 xl:h-6"
                strokeWidth={2.5}
              />
            </button>
          </div>
          {/* <p className="text-[11px] lg:text-[12px] xl:text-[15px] text-gray-500 font-bold uppercase pl-1 tracking-tight">
            {quantitySubtext}
          </p> */}
        </div>
      </div>

      <div className="h-px bg-gray-100 w-full pt-1" />

      {maxStock > 0 && quantity >= maxStock && (
        <p className="text-xs text-amber-600 font-bold uppercase tracking-tight">
          Maximum available stock reached ({maxStock}).
        </p>
      )}

      {/* 8. Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 xl:gap-4 pt-1">
        <button
          onClick={handleAddToCart}
          disabled={isUpdating}
          className="flex-1 h-12 lg:h-12 xl:h-[64px] 2xl:h-[72px] flex items-center justify-center gap-2 xl:gap-3 bg-[#1D3583] hover:bg-[#162a6b] text-white rounded-full text-sm lg:text-[14px] xl:text-[16px] 2xl:text-[18px] font-bold transition-all cursor-pointer active:scale-[0.98] shadow-none border-none"
        >
          <BsCart3 className="w-4 h-4 xl:w-5 xl:h-5" strokeWidth={0.5} />
          <span>Add to Cart</span>
        </button>
        <button
          onClick={() => {
            handleAddToCart();
            router.push('/cart');
          }}
          className="flex-1 h-12 lg:h-12 xl:h-[64px] 2xl:h-[72px] flex items-center justify-center gap-1 xl:gap-2 bg-[#F8FAFF] border border-[#E0E7FF] rounded-full text-sm lg:text-[14px] xl:text-[16px] 2xl:text-[18px] font-bold text-[#1D3583] hover:bg-[#EEF2FF] transition-all cursor-pointer active:scale-[0.98] shadow-none"
        >
          <span>Buy Now</span>
          <FiChevronRight className="w-4 h-4 xl:w-5 xl:h-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default ProductSummaryCard;
