'use client';

import React, { useState } from 'react';
import {
  FiCheckCircle,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
} from 'react-icons/fi';
import Image from 'next/image';

const ProductDetailsTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('Description');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!product) return null;

  const tabs = ['Description', 'Specification', 'Rating & Reviews'];

  // Prepare Specifications from API data
  const specs = [
    { label: 'Generic Name', value: product.ingredient_name || 'N/A' },
    { label: 'Brand', value: product.brand_name || 'N/A' },
    { label: 'Category', value: product.category_name || 'N/A' },
    { label: 'Dosage', value: product.dosage || 'N/A' },
    { label: 'Unit / Pack Size', value: product.unit_label || 'N/A' },
    // Merge custom specifications from the JSON field
    ...Object.entries(product.specifications || {}).map(([key, val]) => ({
      label: key,
      value: val,
    })),
  ];

  const renderTruncatedText = (text, wordLimit) => {
    if (!text)
      return <p className="text-gray-400 italic">No description available.</p>;
    const words = text.split(' ');
    if (words.length <= wordLimit || isExpanded) {
      return (
        <p>
          {text}
          {words.length > wordLimit && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-(--color-primary-500) font-bold ml-2 cursor-pointer hover:underline"
            >
              Show less
            </button>
          )}
        </p>
      );
    }
    return (
      <p>
        {words.slice(0, wordLimit).join(' ')}...
        <button
          onClick={() => setIsExpanded(true)}
          className="text-(--color-primary-500) font-bold ml-2 cursor-pointer hover:underline"
        >
          Show more
        </button>
      </p>
    );
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      {/* 1. Tab Navigation */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="bg-white border border-gray-100 rounded-full p-2 w-fit flex items-center gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsExpanded(false);
              }}
              className={`px-6 sm:px-10 py-2.5 rounded-full text-[14px] font-bold transition-all cursor-pointer whitespace-nowrap border ${
                activeTab === tab
                  ? 'bg-black text-white border-black'
                  : 'bg-transparent text-gray-400 border-gray-100 hover:border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Content Wrapper */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-12">
        {/* DESCRIPTION TAB */}
        {activeTab === 'Description' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-8">
              <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 tracking-tight">
                Medicine Overview of {product.name}
              </h2>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FiInfo className="text-gray-400" /> Introduction
                </h3>
                <div className="text-[15px] text-gray-600 leading-relaxed">
                  {renderTruncatedText(product.description, 60)}
                </div>
              </div>

              {product.key_benefits?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Key Benefits:
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.key_benefits.map((benefit, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-[15px] text-gray-700 font-medium bg-gray-50/50 p-4 rounded-2xl border border-gray-50"
                      >
                        <FiCheckCircle
                          className="text-(--color-primary-500) shrink-0 mt-0.5"
                          size={18}
                        />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SPECIFICATION TAB */}
        {activeTab === 'Specification' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 tracking-tight mb-10">
              Product Specifications
            </h2>
            <div className="space-y-1">
              {specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between w-full py-4 border-b border-gray-50 last:border-0"
                >
                  <span className="text-[13px] text-gray-400 font-black uppercase tracking-widest mb-1 sm:mb-0">
                    {spec.label}
                  </span>
                  <span className="text-[15px] sm:text-[18px] font-bold text-gray-900 text-left sm:text-right">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RATING & REVIEWS TAB */}
        {activeTab === 'Rating & Reviews' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Summary Section */}
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
              <div className="text-center md:text-left">
                <div className="flex items-baseline justify-center md:justify-start">
                  <span className="text-7xl font-bold text-gray-900">
                    {parseFloat(product.rating_avg).toFixed(1)}
                  </span>
                  <span className="text-3xl font-bold text-gray-400 ml-2">
                    /5
                  </span>
                </div>
                <p className="text-gray-500 font-medium mt-2">
                  ({product.review_count} Reviews)
                </p>
              </div>

              {/* Star Breakdown (Mocked logic based on average) */}
              <div className="flex-1 w-full max-w-md space-y-3">
                {[5, 4, 3, 2, 1].map(stars => {
                  // Mock percentage for UI consistency until Review API is ready
                  const isHigh = stars >= Math.floor(product.rating_avg);
                  return (
                    <div key={stars} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 shrink-0 w-6">
                        <FiStar
                          className={
                            isHigh
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-200'
                          }
                          size={16}
                        />
                        <span className="text-sm font-bold text-gray-700">
                          {stars}
                        </span>
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full transition-all duration-1000"
                          style={{
                            width: isHigh ? `${(stars / 5) * 100}%` : '5%',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review List Placeholder */}
            <div className="py-20 text-center bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
              <FiStar className="mx-auto text-gray-300 mb-4" size={48} />
              <h4 className="text-lg font-bold text-gray-900">
                No reviews yet
              </h4>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">
                Be the first to review this product after your purchase!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsTabs;
