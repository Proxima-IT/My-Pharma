"use client";

import React from "react";

import Link from "next/link";

import { IoIosArrowDown } from "react-icons/io";
import PopularProductCard from "../home/components/PopularProductCard";
import { useProductData } from "../../hooks/useProductData";
import Sidebar from "../../components/Sidebar";
import { IoReloadOutline } from "react-icons/io5";
import { TbCurrencyTaka } from "react-icons/tb";

const Products = () => {
  const { loading, products } = useProductData();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Product Loading...
      </div>
    );
  }

  return (
    <main className="lg:flex lg:gap-8 w-full px-2.5 lg:px-7 py-6">
      <div className="w-3/12 sticky top-0 h-screen overflow-y-auto space-y-4">
        {/* product filter  */}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Product Filter</h2>
          <button className="border border-info-500/10 bg-white rounded-[90px] px-3 lg:px-6 py-2 lg:py-3 text-primary-500 flex gap-3 items-center text-sm font-semibold cursor-pointer">
            Clear
          </button>
        </div>

        {/* Price Filter */}
        <div className="bg-white rounded-xl p-5 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Price</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <IoReloadOutline size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Min Price */}
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 flex items-center gap-2">
              <TbCurrencyTaka className="text-gray-600" size={20} />
              <span className="text-gray-900 font-semibold">2000</span>
            </div>

            {/* Separator */}
            <span className="text-gray-400">—</span>

            {/* Max Price */}
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 flex items-center gap-2">
              <TbCurrencyTaka className="text-gray-600" size={20} />
              <span className="text-gray-900 font-semibold">7000</span>
            </div>
          </div>
        </div>

        {/* Discount Filter */}
        <div className="bg-white rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Discount Range</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <IoReloadOutline size={20} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 ">
            <button className="bg-gray-50 py-3 rounded-full font-semibold text-sm text-gray-700 hover:bg-gray-100">
              10%
            </button>
            <button className="bg-blue-600 py-3 rounded-full font-semibold text-sm text-white shadow-lg">
              20%
            </button>
            <button className="bg-gray-50 py-3 rounded-full font-semibold text-sm text-gray-700 hover:bg-gray-100">
              30%
            </button>
            <button className="bg-gray-50 py-3 rounded-full font-semibold text-sm text-gray-700 hover:bg-gray-100">
              40%
            </button>
            <button className="bg-gray-50 py-3 rounded-full font-semibold text-sm text-gray-700 hover:bg-gray-100">
              50%
            </button>
            <button className="bg-gray-50 py-3 rounded-full font-semibold text-sm text-gray-700 hover:bg-gray-100">
              60%
            </button>
            <button className="bg-gray-50 py-3 rounded-full font-semibold text-sm text-gray-700 hover:bg-gray-100">
              70%
            </button>
            <button className="bg-gray-50 py-3 rounded-full font-semibold text-sm text-gray-700 hover:bg-gray-100">
              80%
            </button>
          </div>
        </div>

        <div>
          <Sidebar></Sidebar>
        </div>

        {/* Brands filter  */}

        <div className="w-full max-w-md bg-white rounded-xl p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Brands</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <IoReloadOutline size={20} />
            </button>
          </div>

          {/* Brands List */}
          <div className="space-y-3 ">
            {/* Brand Item 1 */}
            <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">
                  Renata Limited
                </span>
              </div>
              <span className="text-gray-400 text-sm">114</span>
            </label>

            {/* Brand Item 2 - Checked */}
            <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-900 font-medium">
                  OSL Pharma Limited
                </span>
              </div>
              <span className="text-gray-400 text-sm">114</span>
            </label>

            {/* Brand Item 3 */}
            <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">
                  Aristopharma Limited
                </span>
              </div>
              <span className="text-gray-400 text-sm">114</span>
            </label>

            {/* Brand Item 4 */}
            <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">ACI Limited</span>
              </div>
              <span className="text-gray-400 text-sm">114</span>
            </label>

            {/* Brand Item 5 */}
            <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">
                  Rainbow Traders
                </span>
              </div>
              <span className="text-gray-400 text-sm">114</span>
            </label>

            {/* Brand Item 6 */}
            <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">Biopharma Ltd</span>
              </div>
              <span className="text-gray-400 text-sm">114</span>
            </label>

            {/* Brand Item 7 - Faded */}
            <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition opacity-40">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">
                  Aristopharma Limited
                </span>
              </div>
              <span className="text-gray-400 text-sm">114</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h1 className="font-semibold text-2xl ">
            14 items found in medicine
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-500 text-sm">Sort by:</p>
            <Link href="/products">
              <button className="border border-info-500/10 bg-white rounded-[90px] px-3 lg:px-6 py-2 lg:py-3 text-primary-500 flex gap-3 items-center text-sm font-semibold cursor-pointer">
                Select an option
                <span>
                  <IoIosArrowDown />
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* all product grid  */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {products.map((product) => (
            <PopularProductCard
              key={product.id}
              product={product}
            ></PopularProductCard>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Products;
