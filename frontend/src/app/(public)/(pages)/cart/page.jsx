// "use client"

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { TbCurrencyTaka } from "react-icons/tb";
import CartCard from "./components/CartCard";
import DealsSection from "../home/components/DealsSection";
import SmartHealthBundle from "../home/components/SmartHealthBundle";
import ShippingAddressCard from "./components/ShippingAddressCard";
import OrderSummaryCard from "./components/OrderSummaryCard";

const Cart = () => {
  return (
    <div className="px-7 pt-7 pb-28">
      {/* page heading  */}
      <div className="flex items-center gap-5">
        <Link href="/products">
          <button className="border border-info-500/10 bg-white rounded-[90px] px-3 lg:px-6 py-2 lg:py-1.5 text-center text-primary-500 flex gap-2 items-center text-sm font-semibold cursor-pointer">
            <span>
              <MdKeyboardArrowLeft />
            </span>
            Back
          </button>
        </Link>
        <h1 className="text-3xl font-semibold">Your Cart</h1>
      </div>

      {/* cart cards and shipping information container  */}
      <div className="mt-6 w-full flex gap-7 items-start">
        <div className="w-[55%] grid grid-cols-1 gap-4">
          <CartCard></CartCard>
          <CartCard></CartCard>
        </div>
        <div className="w-[45%] flex flex-col gap-7 ">
          <ShippingAddressCard></ShippingAddressCard>
          <OrderSummaryCard></OrderSummaryCard>
        </div>
      </div>

      {/* home page sections */}
      <div className="">
        <DealsSection></DealsSection>
        <SmartHealthBundle></SmartHealthBundle>
      </div>
    </div>
  );
};

export default Cart;
