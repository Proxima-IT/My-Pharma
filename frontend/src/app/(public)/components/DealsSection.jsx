"use client";

import { getProducts } from "@/data/productInfo";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { BsCart3 } from "react-icons/bs";
import { GoStarFill } from "react-icons/go";
import { MdArrowForwardIos } from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";

const DealsSection = () => {
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
    <div className="bg-white  py-17.5 px-4">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">Unilever: Deals you can't miss</h1>

        <button className="border border-info-500/10 rounded-[90px] px-6 py-3 text-primary-500 flex gap-3 items-center text-sm font-semibold cursor-pointer">
          See More Product{" "}
          <span>
            <MdArrowForwardIos />
          </span>
        </button>
      </div>

      {/* product card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-5 mt-7">
        {/* cards */}

        {/* Image wrapper */}
        {products.map((product) => (
          <div key={product.id} className="relative flex gap-3.5">
            {/* Image wrapper */}
            <div className="relative bg-imageBG rounded-xl w-2/3 aspect-square flex items-center justify-center overflow-hidden p-5">
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
                className="max-w-[70%] max-h-[70%] object-contain"
                priority
              />
            </div>

            <div>
              {/* product information  */}
              <h1 className="font-bold text-sm mt-4">{product.name}</h1>
              <div className="flex gap-2 items-center mt-2">
                <GoStarFill className="text-[#FFC831] font-bold" />
                <span className="text-sm font-bold">5.0</span>
                <p className="text-sm text-black/50">(1.2k+ Reviews)</p>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealsSection;
