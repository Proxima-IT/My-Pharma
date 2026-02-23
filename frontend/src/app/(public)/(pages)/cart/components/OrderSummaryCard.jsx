import React from "react";
import { IoPricetagOutline } from "react-icons/io5";
import { TbCurrencyTaka } from "react-icons/tb";

const OrderSummaryCard = () => {
  return (
    <div>
      <div className="bg-white rounded-[20px] border border-[#EEEFF2] p-6 shadow-sm w-full ">
        {/* Title */}
        <h2 className="text-3xl font-medium text-[#0D0E10] mb-5">
          Order Summary
        </h2>

        {/* Line Items */}
        <div className="space-y-3 mb-4">
          {[
            { label: "Subtotal", value: "3,750", color: "text-primary-900" },
            { label: "Delivery Fee", value: "150", color: "text-primary-900" },
            { label: "Discount (-20%)", value: "-113", color: "text-red-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xl text-[#00000099]">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">-</span>
                <span
                  className={`text-2xl font-medium flex items-center ${color}`}
                >
                  <TbCurrencyTaka />
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Total */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xl font-bold text-black">Total</span>
          <div className="flex items-center gap-2">
            <span className="text-[#00000099] text-sm">-</span>
            <span className="text-2xl font-medium text-primary-900">
              ৳3,787
            </span>
          </div>
        </div>

        {/* Coupon */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 flex-1 bg-gray-100 rounded-full px-4 py-2.5">
            <IoPricetagOutline className="-rotate-90 text-gray-600" />

            <input
              type="text"
              placeholder="Enter Coupon Code"
              className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
            />
          </div>
          <button className="bg-[#0000F705] hover:bg-gray-200 transition text-primary-500 text-sm font-semibold border-[1.5px] border-[#0000F70D] rounded-full px-5 py-2.5">
            Apply
          </button>
        </div>

        {/* Place Order */}
        <button className="w-full bg-primary-500 hover:bg-blue-800 transition text-white font-semibold rounded-full py-3.5 flex items-center shadow justify-center gap-2">
          Place Order
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
