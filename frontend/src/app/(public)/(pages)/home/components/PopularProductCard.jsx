import Image from "next/image";
import React from "react";
import { BsCart3 } from "react-icons/bs";
import { GoStarFill } from "react-icons/go";
import { TbCurrencyTaka } from "react-icons/tb";

const PopularProductCard = ({ product }) => {
  return (
    <div>
      <div key={product?.id} className="relative bg-white rounded-2xl p-2">
        {/* Image wrapper */}
        <div className="relative bg-imageBG rounded-xl w-full aspect-square flex items-center justify-center overflow-hidden p-5">
          {/* Discount badge */}
          <span className="absolute top-3 right-3 bg-green-600 text-white text-xs px-3 py-1 rounded-full z-10">
            -27% off
          </span>

          {/* Product image */}
          {product?.image && (
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="max-w-[75%] max-h-[75%] object-contain"
              priority
            />
          )}
        </div>

        {/* product name  */}
        <h1 className="font-bold text-lg mt-4">{product?.name}</h1>
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
    </div>
  );
};

export default PopularProductCard;
