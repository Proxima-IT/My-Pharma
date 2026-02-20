"use client"

import React from "react";

import Link from "next/link";

import { IoIosArrowDown } from "react-icons/io";
import PopularProductCard from "../home/components/PopularProductCard";
import { useProductData } from "../../hooks/useProductData";

const Products = () => {
  const { loading, products } = useProductData();

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center">Product Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-2xl ">14 items found in medicine</h1>
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
  );
};

export default Products;
