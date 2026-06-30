'use client';
 
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProductImageUrl } from '@/app/(shared)/lib/apiConfig';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { BsCart3 } from 'react-icons/bs';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';

/**
 * SearchSuggestions Component
 * Displays a floating list of product matches under the search bar.
 * Design: Public Premium (rounded-[24px], soft shadows).
 */
const SearchSuggestions = ({ suggestions, isLoading, onSelect, visible, searchQuery }) => {
  const { addItem } = useCart();
  const [addingProductId, setAddingProductId] = useState(null);

  if (!visible) return null;

  const getDisplayName = (product) => {
    const name = product.name || '';
    const dosage = product.dosage || '';
    if (!dosage) return name;
    
    // Clean name and dosage for checking
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const cleanDosage = dosage.toLowerCase().replace(/\s+/g, '');
    
    if (cleanName.includes(cleanDosage)) {
      return name;
    }
    return `${name} ${dosage}`;
  };

  const getDisplayForm = (product) => {
    // 1. Try product.dosage (if it's a non-numeric string, it's the form in production)
    if (product.dosage) {
      const val = product.dosage.trim();
      const hasDigits = /\d/.test(val);
      const isStrengthUnit = /^(mg|ml|gm|g|iu|mcg)$/i.test(val);
      if (!hasDigits && !isStrengthUnit) {
        let form = val;
        if (form.toLowerCase().endsWith('tablets')) form = 'Tablet';
        else if (form.toLowerCase().endsWith('capsules')) form = 'Capsule';
        else if (form.endsWith('s') && !form.toLowerCase().endsWith('drops') && !form.toLowerCase().endsWith('syrup')) {
          form = form.slice(0, -1);
        }
        return form;
      }
    }

    // 2. Try product.content_type (if it's a non-numeric string, and not a simple strength unit, it's the form in local/seeded)
    if (product.content_type) {
      const val = product.content_type.trim();
      const isStrengthUnit = /^(mg|ml|gm|g|iu|mcg)$/i.test(val);
      if (!isStrengthUnit) {
        let form = val;
        // Strip any leading measurements if any (e.g. "ml Syrup" -> "Syrup")
        const words = form.split(/\s+/);
        if (words.length > 1 && /^(ml|mg|gm|g)$/i.test(words[0])) {
          form = words.slice(1).join(' ');
        }
        
        if (form.toLowerCase().endsWith('tablets')) form = 'Tablet';
        else if (form.toLowerCase().endsWith('capsules')) form = 'Capsule';
        else if (form.toLowerCase().includes('cream')) form = 'Cream';
        else if (form.toLowerCase().includes('liquid')) form = 'Liquid';
        else if (form.toLowerCase().includes('condoms')) form = 'Condom';
        else if (form.endsWith('s') && !form.toLowerCase().endsWith('drops') && !form.toLowerCase().endsWith('syrup')) {
          form = form.slice(0, -1);
        }
        return form;
      }
    }

    // 3. Try parsing from product.unit_type (e.g., "Strip x 10 Tablets" -> "Tablet")
    if (product.unit_type) {
      const val = product.unit_type.toLowerCase();
      if (val.includes('tablet')) return 'Tablet';
      if (val.includes('capsule')) return 'Capsule';
      if (val.includes('syrup')) return 'Syrup';
      if (val.includes('suspension')) return 'Suspension';
      if (val.includes('cream')) return 'Cream';
      if (val.includes('gel')) return 'Gel';
      if (val.includes('ointment')) return 'Ointment';
      if (val.includes('injection')) return 'Injection';
      if (val.includes('drop')) return 'Drops';
      if (val.includes('spray')) return 'Spray';
      if (val.includes('sachet')) return 'Sachet';
      if (val.includes('condom')) return 'Condom';
      if (val.includes('shampoo')) return 'Shampoo';
    }

    // 4. Try parsing from name
    const nameLower = (product.name || '').toLowerCase();
    if (nameLower.includes('tablet')) return 'Tablet';
    if (nameLower.includes('capsule')) return 'Capsule';
    if (nameLower.includes('syrup')) return 'Syrup';
    if (nameLower.includes('suspension')) return 'Suspension';
    if (nameLower.includes('cream')) return 'Cream';
    if (nameLower.includes('ointment')) return 'Ointment';
    if (nameLower.includes('gel')) return 'Gel';
    if (nameLower.includes('drop')) return 'Drops';
    if (nameLower.includes('spray')) return 'Spray';

    // 5. Fallback to product.unit_type
    return product.unit_type || '';
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (product?.id) {
      setAddingProductId(product.id);
      try {
        const success = await addItem(product, 1);
        if (success) {
          toast.success(`${product.name} added to cart!`);
        } else {
          toast.error(`Failed to add ${product.name} to cart.`);
        }
      } catch (err) {
        toast.error(err.message || 'Something went wrong');
      } finally {
        setAddingProductId(null);
      }
    }
  };

  return (
    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-[28px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
      <div className="max-h-[460px] overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-(--color-primary-500) rounded-full animate-spin" />
            <p className="text-[11px] font-bold uppercase tracking-widest">
              Searching Catalog...
            </p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="py-2">
            <div className="px-6 py-2 border-b border-gray-50 mb-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Product Matches
              </span>
            </div>
            {suggestions.map(product => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={onSelect}
                className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {getProductImageUrl(product) ? (
                      <Image
                        src={getProductImageUrl(product)}
                        alt={product.name}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[8px] font-bold uppercase">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[15px] font-bold text-gray-900 group-hover:text-(--color-primary-500) transition-colors truncate">
                        {getDisplayName(product)}
                      </h4>
                    </div>
                    {getDisplayForm(product) && (
                      <p className="text-[12px] text-gray-600 font-semibold uppercase tracking-wider text-[10px] leading-tight">
                        {getDisplayForm(product)}
                      </p>
                    )}
                    {(product.ingredient_name || product.generic_name) && (
                      <p className="text-[12px] text-gray-500 font-medium leading-tight truncate">
                        {product.ingredient_name || product.generic_name}
                      </p>
                    )}
                    {product.brand_name && (
                      <p className="text-[11px] text-gray-400 font-semibold leading-tight truncate uppercase tracking-wide">
                        {product.brand_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex flex-col items-end shrink-0 min-w-[70px]">
                    <span className="text-sm font-black text-gray-900 flex items-center">
                      ৳{parseFloat(product.price || 0).toLocaleString()}
                    </span>
                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                      <span className="text-[10px] text-gray-400 line-through font-bold">
                        ৳{parseFloat(product.original_price).toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {product.quantity_in_stock > 0 ? (
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={addingProductId === product.id}
                      className="px-4 py-2 bg-(--color-primary-25) text-(--color-primary-600) font-bold text-xs rounded-full hover:bg-(--color-primary-500) hover:text-white transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50 flex items-center gap-1.5 border border-(--color-primary-50)"
                    >
                      {addingProductId === product.id ? (
                        <div className="w-3 h-3 border-2 border-(--color-primary-600) border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <BsCart3 size={13} />
                      )}
                      Add
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-400 font-bold text-xs rounded-full select-none text-[10px] uppercase tracking-wider">
                      Out of Stock
                    </span>
                  )}
                </div>
              </Link>
            ))}
            <Link
              href={`/products?search=${encodeURIComponent(searchQuery || '')}`}
              onClick={onSelect}
              className="flex items-center justify-center gap-2 py-4 bg-gray-50/50 text-(--color-primary-500) text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              View all results <FiSearch size={14} />
            </Link>
          </div>
        ) : (
          <div className="p-10 text-center space-y-2">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <FiSearch size={24} />
            </div>
            <p className="text-sm font-bold text-gray-900">No products found</p>
            <p className="text-xs text-gray-500">Try a different keyword</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestions;
