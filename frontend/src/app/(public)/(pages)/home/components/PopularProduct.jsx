"use client";

import { getProducts } from "@/data/productInfo";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BsCart3 } from "react-icons/bs";
import { GoStarFill } from "react-icons/go";
import { MdArrowForwardIos } from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";
import PopularProductCard from "./PopularProductCard";
import { useProductData } from "@/app/(public)/hooks/useProductData";

const PopularProduct = () => {
  const { loading, products } = useProductData();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Product Loading...
      </div>
    );
  }

  return (
    <div className="  p-3">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-lg lg:text-2xl">Popular Products</h1>
        <Link href="/products">
          <button className="border border-info-500/10 bg-white rounded-[90px] px-3 lg:px-6 py-2 lg:py-3 text-primary-500 flex gap-3 items-center text-sm font-semibold cursor-pointer">
            See More Product{" "}
            <span>
              <MdArrowForwardIos />
            </span>
          </button>
        </Link>
      </div>

      {/* product card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-7">
        {/* cards */}

        {products.map((product) => (
          <PopularProductCard
            product={product}
            key={product.id}
          ></PopularProductCard>
        ))}
      </div>
    </div>
  );
};

export default PopularProduct;
