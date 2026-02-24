import React from "react";

const ShippingAddressCard = () => {
  return (
    <div>
      <div className="bg-white rounded-[20px] border border-[#EEEFF2] p-6 shadow-sm w-full ">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold text-[#0D0E10]">
            Shipping Address
          </h2>
          <button className="flex items-center gap-1.5 bg-[#0000F705] border-[1.5px] border-[#0000F70D] rounded-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            Change
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between bg-gray-50 border-[1.5px] border-gray-100 rounded-full px-4 py-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100  flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-800"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-xl">Abu Fahim</p>
              <p className="text-base font-normal text-gray-500">
                design.fahim@proton.me
              </p>
            </div>
          </div>
          <span className="border border-success-600 bg-success-25 text-success-600 text-xs font-medium rounded-full px-4 py-2">
            Default
          </span>
        </div>

        {/* Address Details */}
        <div className="space-y-3">
          {[
            { label: "PHONE NUMBER", value: "+880 1347598372" },
            { label: "GENDER", value: "Male" },
            { label: "DEISTIC", value: "Kushtia" },
            { label: "THANA", value: "Bheramara" },
            { label: "FULL ADDRESS", value: "kasaripara, Merpur, Kushtia" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between w-full"
            >
              <span className="text-base font-semibold text-[#00000099] tracking-wide uppercase  shrink-0 w-2/5">
                {label}
              </span>
              <span className="text-[#00000099] mx-2 text-center w-1/12">
                -
              </span>
              <span className="text-lg font-medium text-primary-900 text-right w-1/2">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressCard;
