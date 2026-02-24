"use client";

import { useState } from "react";
import { GoStarFill } from "react-icons/go";
import { TbCurrencyTaka } from "react-icons/tb";
import { BsCart3 } from "react-icons/bs";
import { MdArrowForwardIos } from "react-icons/md";

const dosages = ["6mg", "12mg", "24mg", "36mg"];

const ProductSummaryCard = () => {
  const [selectedDosage, setSelectedDosage] = useState("12mg");
  const [quantity, setQuantity] = useState(2);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 w-full max-w-[360px] space-y-4">
      {/* Category */}
      <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
        Body Lotion & Cream
      </p>

      {/* Product Name */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Scabo 12 Tablets</h1>
        <p className="text-sm text-gray-500">Ivermectin BP 12 mg</p>
        <button className="flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">
          Delta Pharma Limited
          <MdArrowForwardIos size={11} />
        </button>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <GoStarFill className="text-yellow-400" />
        <span className="font-semibold text-gray-800">5.0</span>
        <span className="text-gray-400">(1.2k+ Reviews)</span>
      </div>

      {/* Price */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center text-2xl font-bold text-gray-900">
            <TbCurrencyTaka />
            1250
          </span>
          <span className="flex items-center text-sm text-gray-400 line-through">
            <TbCurrencyTaka />
            1900.99
          </span>
        </div>
        <p className="text-xs text-gray-500">10 Tablets (1 Strip)</p>
      </div>

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Dosage */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-800">Available Dosage</p>
        <div className="flex gap-2 flex-wrap">
          {dosages.map((dose) => (
            <button
              key={dose}
              onClick={() => setSelectedDosage(dose)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedDosage === dose
                  ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-200"
              }`}
            >
              {dose}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-800">Quantity</p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDecrease}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition text-lg font-light"
          >
            −
          </button>
          <span className="text-base font-semibold text-gray-800 w-4 text-center">
            {quantity}
          </span>
          <button
            onClick={handleIncrease}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition text-lg font-light"
          >
            +
          </button>
        </div>
        <p className="text-xs text-gray-400">
          {quantity} Strip ({quantity * 10} Tablets)
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-1">
        <button className="flex-1 flex items-center justify-center gap-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-full py-3 text-sm font-semibold transition">
          <BsCart3 size={16} />
          Add to Cart
        </button>
        <button className="flex items-center gap-1 border border-gray-200 rounded-full px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
          Buy Now
          <MdArrowForwardIos size={12} />
        </button>
      </div>
    </div>
  );
};

export default ProductSummaryCard;