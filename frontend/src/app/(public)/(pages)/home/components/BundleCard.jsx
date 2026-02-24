import Image from "next/image";
import React from "react";
import { MdArrowForwardIos } from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";

const BundleCard = ({bundle}) => {
  return (
    <div>
      {/* card 1  */}
      <div className={ `relative  rounded-2xl w-full aspect-square flex flex-col items-start justify-center gap-4  p-5 ${bundle.bgColor}`}>
        <h1 className="text-base font-bold">{bundle.title}</h1>
        <p>{bundle.description}</p>

        <div className="flex items-center gap-1">
          {/* originalPrice  */}
          <div className=" flex items-center text-xl font-bold text-black">
            <TbCurrencyTaka />
            <sub>{bundle.price}</sub>
          </div> 

          {/* discountPercent  */}
          <sub className=" flex items-center text-xl text-gray-500">
            <TbCurrencyTaka />
            <sub>
              <del>{bundle.oldPrice}</del>
            </sub>
          </sub>
        </div>

        <button className="border border-info-500/10 bg-white rounded-[90px] px-4 py-2 text-primary-500 flex gap-3 items-center text-sm font-semibold cursor-pointer">
          See Package
          <span>
            <MdArrowForwardIos />
          </span>
        </button>

        {/* Product image */}

        <Image
          src={bundle.image}
          alt=""
          width={300}
          height={300}
          className="max-w-[75%] max-h-[75%] object-contain mx-auto "
          priority
        />
      </div>
    </div>
  );
};

export default BundleCard;
