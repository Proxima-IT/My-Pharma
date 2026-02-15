"use client";

import { getProducts } from "@/data/productInfo";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { BsCart3 } from "react-icons/bs";
import { GoStarFill } from "react-icons/go";
import { MdArrowForwardIos } from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";

const PopularProduct = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProducts();
      console.log(response);
      setProducts(response);
    };
    fetchProducts();
  }, []);

  console.log(products);

  return (
    <div className="bg-white  p-3">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-lg lg:text-2xl">Popular Products</h1>
        <button className="border border-info-500/10 rounded-[90px] px-3 lg:px-6 py-2 lg:py-3 text-primary-500 flex gap-3 items-center text-sm font-semibold cursor-pointer">
          See More Product{" "}
          <span>
            <MdArrowForwardIos />
          </span>
        </button>
      </div>

      {/* product card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-7">
        {/* cards */}

        {products.map((product) => (
          <div key={product.id} className="relative">
            {/* Image wrapper */}
            <div className="relative bg-imageBG rounded-xl w-full aspect-square flex items-center justify-center overflow-hidden p-5">
              {/* Discount badge */}
              <span className="absolute top-3 right-3 bg-green-600 text-white text-xs px-3 py-1 rounded-full z-10">
                -27% off
              </span>

              {/* Product image */}
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                className="max-w-[75%] max-h-[75%] object-contain"
                priority
              />
            </div>

            {/* product name  */}
            <h1 className="font-bold text-lg mt-4">{product.name}</h1>
            <div className="flex gap-2 items-center mt-2">
              <GoStarFill className="text-[#FFC831] font-bold" />
              <span className="text-lg font-bold">5.0</span>
              <p className="text-base text-black/50">(1.2k+ Reviews)</p>
            </div>
            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center gap-1">
                {/* originalPrice  */}
                <div className=" flex items-center text-xl font-bold text-black">
                  <TbCurrencyTaka />
                  <sub>1,250</sub>
                </div>

                {/* discountPercent  */}
                <sub className=" flex items-center text-xl text-gray-500">
                  <TbCurrencyTaka />
                  <sub>
                    <del>1,250</del>
                  </sub>
                </sub>
              </div>
              <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
                <BsCart3 size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularProduct;
