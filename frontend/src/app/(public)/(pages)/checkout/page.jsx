import Link from "next/link";
import React from "react";

import { MdKeyboardArrowLeft } from "react-icons/md";

import CartCard from "../cart/components/CartCard";
import ShippingAddressCard from "../cart/components/ShippingAddressCard";
import OrderSummaryCard from "../cart/components/OrderSummaryCard";
import PaymentMethodCard from "../cart/components/PaymentMethodCard";

const Checkout = () => {
  return (
    <div>
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
          <h1 className="text-3xl font-semibold">Check Out</h1>
        </div>

        {/* cart cards and shipping information container  */}
        <div className="mt-6 w-full flex gap-7 items-start">
          <div className="w-[45%] flex flex-col gap-7 ">
            <ShippingAddressCard></ShippingAddressCard>
            <PaymentMethodCard></PaymentMethodCard>
            
          </div>
          <div className="w-[55%] gap-7 flex flex-col ">
            <div className="bg-white rounded-[20px] p-6  ">
              <h1 className="text-3xl font-semibold mb-6">Cart Product</h1>
              <div className="grid grid-cols-1 gap-4">
                <CartCard></CartCard>
                <CartCard></CartCard>
              </div>
            </div>

            <OrderSummaryCard></OrderSummaryCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
