
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

import { RiDeleteBinLine } from "react-icons/ri";
import { TbCurrencyTaka } from "react-icons/tb";

const CartCard = () => {
  return (
    <div>
         {/* cart card 1 */}
          <div className="w-full flex flex-col md:flex-row items-center bg-white rounded-[18px] border-2 border-gray-100 gap-7 p-2">
            {/* Image wrapper */}
            <div className="relative bg-imageBG rounded-xl w-1/3  aspect-square flex items-center justify-center overflow-hidden  border-[1.5px] border-[#0000000A] shadow-[0px_2px_16px_0px_rgba(0,0,0,0.03)] ">
              {/* Product image */}
              <Image
                src="/assets/images/cart1.png"
                alt="product image"
                width={500}
                height={500}
                className="max-w-[80%] max-h-[80%] object-contain "
                priority
              />
            </div>
            <div className="w-full flex justify-between items-start gap-5 flex-1 py-4 pr-4">
              {/* product information  */}
              <div className="space-y-2 ">
                <h1 className="font-semibold text-2xl ">A-fenac 50</h1>

                <div className="flex items-center gap-1">
                  {/* originalPrice  */}
                  <div className=" flex items-center text-[18px] font-bold text-black">
                    <TbCurrencyTaka />
                    <sub>1250</sub>
                  </div>

                  {/* discountPercent  */}
                  <sub className=" flex items-center text-sm text-black/50">
                    <TbCurrencyTaka />
                    <sub>
                      <del>1900.99</del>
                    </sub>
                  </sub>
                </div>
                <div className="flex gap-2 items-center mt-2">
                  <p className="text-base font-medium text-gray-600">
                    10 Tablets (1 Strip)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <p className="font-medium text-base text-black">Quantity:</p>
                  <button className="w-11 h-11 md:w-12 md:h-12 rounded-full border-[1.5px] border-[#0000F70D] bg-[#0000F705] flex items-center shadow-[0px_2px_16px_0px_rgba(0,0,0,0.03)] justify-center cursor-pointer hover:bg-gray-50">
                    <FiMinus size={20} />
                  </button>
                  <button className="w-11 h-11 md:w-12 md:h-12 rounded-full border-[1.5px] border-[#0000F70D] bg-[#0000F705] flex items-center shadow-[0px_2px_16px_0px_rgba(0,0,0,0.03)] justify-center cursor-pointer hover:bg-gray-50">
                    2
                  </button>
                  <button className="w-11 h-11 md:w-12 md:h-12 rounded-full border-[1.5px] border-[#0000F70D] bg-[#0000F705] flex items-center shadow-[0px_2px_16px_0px_rgba(0,0,0,0.03)] justify-center cursor-pointer hover:bg-gray-50">
                    <FiPlus size={20} />
                  </button>
                </div>
              </div>
              {/* delete button */}
              <div className="">
                <div className="relative w-9 h-9 md:w-12 md:h-12 rounded-full border-[1.5px] border-[#FF33330D] bg-[#f93e3e05] text-[#FF3333] shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 ">
                  <RiDeleteBinLine className="text-xl" />
                </div>
              </div>
            </div>
          </div>
    </div>
  )
}

export default CartCard