"use client";

import { getFeaturedProducts } from "@/data/featureproduct";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { MdArrowForwardIos } from "react-icons/md";

const FeaturedCategory = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const response = await getFeaturedProducts();
      console.log(response);
      setFeaturedProducts(response);
    };
    fetchFeaturedProducts();
  }, []);

  console.log(featuredProducts);
  return (
    <div className="bg-white  p-3">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-lg lg:text-2xl">Featured Categories</h1>
        <button className="border border-info-500/10 rounded-[90px] px-3 lg:px-6 py-3 text-primary-500 flex gap-3 items-center text-sm font-semibold cursor-pointer">
          See More categories
          <span>
            <MdArrowForwardIos />
          </span>
        </button>
      </div>

      {/* product card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 mt-7">
        {/* cards */}

        {featuredProducts.map((featuredproduct) => (
          <div key={featuredproduct.id} className="relative text-center flex flex-col items-center">
            {/* Image wrapper */}
            <div className="relative bg-imageBG rounded-full w-1/2 lg:w-full aspect-square flex items-center justify-center overflow-hidden p-5">
              {/* Discount badge */}

              {/* Product image */}
              <Image
                src={featuredproduct.image}
                alt={featuredproduct.name}
                width={300}
                height={300}
                className="max-w-[75%] max-h-[75%] object-contain"
                priority
              />
            </div>

            {/* featuredproduct name  */}
            <h1 className="font-bold text-lg mt-4">{featuredproduct.name}</h1>
            <p className="font-normal text-base mt-4">{featuredproduct.quantity} Product</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCategory;
