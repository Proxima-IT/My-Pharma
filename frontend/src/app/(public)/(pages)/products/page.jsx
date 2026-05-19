'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoIosArrowDown } from 'react-icons/io';
import { IoReloadOutline } from 'react-icons/io5';
import { TbCurrencyTaka } from 'react-icons/tb';
import { FiFilter, FiChevronDown } from 'react-icons/fi';
import PopularProductCard from '../home/components/PopularProductCard';
import { useProductData } from '../../hooks/useProductData';
import Sidebar from '../../components/Sidebar';
import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';
import { searchProducts } from '../../lib/productSearchEngine';

/**
 * Products Page Component
 * Fixed: Updated Ingredient filter logic to store and transmit IDs (integers) instead of Names (strings)
 * to resolve the 400 Bad Request error from the backend.
 */
const Products = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. URL Params
  const categoryFilter = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const brandIdFromUrl = searchParams.get('brand') || '';

  // 2. State Declarations
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]); // Now stores IDs
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hasDiscount, setHasDiscount] = useState('');
  const [isAvailable, setIsAvailable] = useState('');

  // 3. Data Hook
  const { loading, products, page, setPage, totalCount } = useProductData({
    category: categoryFilter,
    search: searchQuery,
    brand_id: brandIdFromUrl,
    // FIXED: Passing the ID (integer) instead of the Name (string)
    ingredient_id: selectedIngredients.length > 0 ? selectedIngredients[0] : '',
    discounted: hasDiscount,
    available: isAvailable,
    min_price: minPrice,
    max_price: maxPrice,
  });

  // 4. Effects
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brands
        const brandsResponse = await fetch(
          `${API_BASE_URL}/brands/?is_active=true`,
        );
        const brandsData = await brandsResponse.json();
        const brandList = brandsData.results || brandsData;
        setBrands(brandList);

        if (brandIdFromUrl) {
          const brandObj = brandList.find(
            b => b.id.toString() === brandIdFromUrl,
          );
          if (brandObj) setSelectedBrands([brandObj.name]);
        }

        // Fetch ingredients
        const ingredientsResponse = await fetch(`${API_BASE_URL}/ingredients/`);
        const ingredientsData = await ingredientsResponse.json();
        const ingredientList = ingredientsData.results || ingredientsData;
        setIngredients(ingredientList);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, [brandIdFromUrl]);

  // 6. Handlers
  const toggleBrand = brandName => {
    setSelectedBrands(prev =>
      prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName],
    );
    if (brandIdFromUrl) router.push('/products');
  };

  // FIXED: Logic updated to handle Ingredient IDs
  const toggleIngredient = ingredientId => {
    setSelectedIngredients(prev =>
      prev.includes(ingredientId)
        ? prev.filter(i => i !== ingredientId)
        : [...prev, ingredientId],
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedIngredients([]);
    setMinPrice('');
    setMaxPrice('');
    setHasDiscount('');
    setIsAvailable('');
    router.push('/products');
  };

  const totalPages = Math.ceil(totalCount / 20);

  const handlePageChange = newPage => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      <aside className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-36 lg:self-start lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto pr-2 lg:pr-4 [scrollbar-width:thin] [scrollbar-color:var(--color-gray-200)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="lg:hidden w-full flex items-center justify-between bg-white border border-gray-100 rounded-full px-6 py-4 mb-4 cursor-pointer transition-all active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-(--color-primary-25) flex items-center justify-center text-(--color-primary-500)">
              <FiFilter size={18} />
            </div>
            <span className="font-bold text-gray-900">
              Filters & Categories
            </span>
          </div>
          <FiChevronDown
            className={`text-gray-400 transition-transform duration-300 ${isMobileFilterOpen ? 'rotate-180' : ''}`}
            size={20}
          />
        </button>

        <div
          className={`${isMobileFilterOpen ? 'flex' : 'hidden'} lg:flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300`}
        >
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Product Filter
            </h2>
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-(--color-primary-500) hover:underline uppercase tracking-widest cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                Price Range
              </h3>
              <button
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="text-gray-400 hover:text-(--color-primary-500) transition-colors cursor-pointer"
              >
                <IoReloadOutline size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2">
                <TbCurrencyTaka className="text-gray-400" size={18} />
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold outline-none"
                />
              </div>
              <span className="text-gray-300">—</span>
              <div className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2">
                <TbCurrencyTaka className="text-gray-400" size={18} />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                Brands
              </h3>
              <button
                onClick={() => setSelectedBrands([])}
                className="text-gray-400 hover:text-(--color-primary-500) transition-colors cursor-pointer"
              >
                <IoReloadOutline size={18} />
              </button>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--color-gray-100)_transparent] [&::-webkit-scrollbar]:w-1 [scrollbar-color:var(--color-gray-100)_transparent] [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full">
              {brands.map(brand => (
                <label
                  key={brand.id}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.name)}
                      onChange={() => toggleBrand(brand.name)}
                      className="w-5 h-5 rounded border-gray-300 text-(--color-primary-500) focus:ring-(--color-primary-500) cursor-pointer accent-(--color-primary-500)"
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${selectedBrands.includes(brand.name) ? 'text-gray-900 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}
                    >
                      {brand.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                Generic
              </h3>
              <button
                onClick={() => setSelectedIngredients([])}
                className="text-gray-400 hover:text-(--color-primary-500) transition-colors cursor-pointer"
              >
                <IoReloadOutline size={18} />
              </button>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--color-gray-100)_transparent] [&::-webkit-scrollbar]:w-1 [scrollbar-color:var(--color-gray-100)_transparent] [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full">
              {ingredients.map(ingredient => (
                <label
                  key={ingredient.id}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      // FIXED: Checking by ID
                      checked={selectedIngredients.includes(ingredient.id)}
                      // FIXED: Toggling by ID
                      onChange={() => toggleIngredient(ingredient.id)}
                      className="w-5 h-5 rounded border-gray-300 text-(--color-primary-500) focus:ring-(--color-primary-500) cursor-pointer accent-(--color-primary-500)"
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${selectedIngredients.includes(ingredient.id) ? 'text-gray-900 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}
                    >
                      {ingredient.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                Discount
              </h3>
              <button
                onClick={() => setHasDiscount('')}
                className="text-gray-400 hover:text-(--color-primary-500) transition-colors cursor-pointer"
              >
                <IoReloadOutline size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all group">
                <input
                  type="radio"
                  name="discount"
                  checked={hasDiscount === ''}
                  onChange={() => setHasDiscount('')}
                  className="w-5 h-5 rounded border-gray-300 text-(--color-primary-500) focus:ring-(--color-primary-500) cursor-pointer accent-(--color-primary-500)"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  All Products
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all group">
                <input
                  type="radio"
                  name="discount"
                  checked={hasDiscount === 'true'}
                  onChange={() => setHasDiscount('true')}
                  className="w-5 h-5 rounded border-gray-300 text-(--color-primary-500) focus:ring-(--color-primary-500) cursor-pointer accent-(--color-primary-500)"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  On Discount
                </span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                Availability
              </h3>
              <button
                onClick={() => setIsAvailable('')}
                className="text-gray-400 hover:text-(--color-primary-500) transition-colors cursor-pointer"
              >
                <IoReloadOutline size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all group">
                <input
                  type="radio"
                  name="availability"
                  checked={isAvailable === ''}
                  onChange={() => setIsAvailable('')}
                  className="w-5 h-5 rounded border-gray-300 text-(--color-primary-500) focus:ring-(--color-primary-500) cursor-pointer accent-(--color-primary-500)"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  All Products
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all group">
                <input
                  type="radio"
                  name="availability"
                  checked={isAvailable === 'true'}
                  onChange={() => setIsAvailable('true')}
                  className="w-5 h-5 rounded border-gray-300 text-(--color-primary-500) focus:ring-(--color-primary-500) cursor-pointer accent-(--color-primary-500)"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  In Stock
                </span>
              </label>
            </div>
          </div>

          <Sidebar />
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 px-2">
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight">
            {searchQuery ? (
              <>Search results for &quot;{searchQuery}&quot;</>
            ) : brandIdFromUrl && brands.length > 0 ? (
              <>
                Products by{' '}
                {brands.find(b => b.id.toString() === brandIdFromUrl)?.name}
              </>
            ) : (
              <>
                {totalCount} items found{' '}
                {categoryFilter
                  ? `in ${categoryFilter.replace(/-/g, ' ')}`
                  : ''}
              </>
            )}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <PopularProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="w-full py-20 text-center bg-white rounded-[40px] border border-gray-100">
            <p className="text-gray-400 font-medium text-lg">
              No products found matching your criteria.
            </p>
            <button
              onClick={clearAllFilters}
              className="text-(--color-primary-500) font-bold mt-2 inline-block hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 pb-10">
            <button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronDown className="rotate-90" size={18} />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                    page === p
                      ? 'bg-(--color-primary-500) text-white shadow-lg shadow-(--color-primary-500)/20'
                      : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronDown className="-rotate-90" size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
