'use client';

import React, { useState } from 'react';
import {
  FiCheckCircle,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import Image from 'next/image';

const ProductDetailsTabs = () => {
  const [activeTab, setActiveTab] = useState('Description');
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = ['Description', 'Specification', 'Rating & Reviews'];

  // Mock Data Object
  const productData = {
    description: {
      title: 'Medicine Overview of Scabo 12mg Tablet',
      intro:
        'Scabo 12 is an antiparasitic medication. It is used to treat parasitic infections of your intestinal tract, skin, and eyes. Your doctor will explain how to take Scabo 12 and how much you need. Read the instructions that come with the medicine to make sure you take it correctly. Generally, it is taken on an empty stomach. You usually need to take it only once to get rid of your infection. However, if you do not feel better after taking it, talk to your doctor. To get the most benefit of the medicine, drink lots of fluids and avoid caffeine. It is important to complete the full course as prescribed by your healthcare provider to ensure the infection is completely cleared and does not return.',
      benefits: [
        'Deeply moisturizes and restores dry, damaged skin',
        'Contains oat extract for soothing and nourishment',
        'Effective against a wide range of parasitic organisms',
        'Fast-acting formula with high absorption rate',
      ],
      usage:
        'Take this medicine in the dose and duration as advised by your doctor. Swallow it as a whole. Do not chew, crush or break it. Scabo 12 is to be taken empty stomach.',
      works:
        'Scabo 12 is an antiparasitic medication. It works by binding to the muscle and nerve cells of worms, causing their paralysis and death. This treats your infection.',
      missed:
        'If you miss a dose of Scabo 12, please consult your doctor immediately.',
    },
    specification: [
      { label: 'GENERIC NAME', value: 'Ivermectin BP 12 mg' },
      { label: 'STRENGTH', value: '12 mg Tablet' },
      { label: 'PACK SIZE', value: '2 × 10 Tablets' },
      { label: 'DOSAGE FORM', value: 'Oral Tablet' },
      { label: 'CATEGORY', value: 'Antiparasitic Medicine' },
      { label: 'INDICATION', value: 'Strongyloidiasis, Onchocerciasis' },
    ],
    reviews: {
      average: 4.5,
      totalCount: 50,
      breakdown: [
        { stars: 5, percentage: 80 },
        { stars: 4, percentage: 15 },
        { stars: 3, percentage: 5 },
        { stars: 2, percentage: 2 },
        { stars: 1, percentage: 1 },
      ],
      list: [
        {
          id: 1,
          user: 'Ratul Khan',
          location: 'Kushtia',
          rating: 4.7,
          avatar: '/assets/images/avatar1.png',
          comment:
            "I've been ordering my monthly diabetes medicines from My Pharma, and every time the delivery is on time and the medicines are genuine. The prescription upload process is very smooth.",
          images: [
            '/assets/images/cart1.png',
            '/assets/images/cart1.png',
            '/assets/images/cart1.png',
          ],
        },
        {
          id: 2,
          user: 'Abu Fahim',
          location: 'Dhaka',
          rating: 4.7,
          avatar: '/assets/images/avatar1.png',
          comment:
            'I no longer need to visit multiple pharmacies. I upload my prescription and everything gets delivered to my home.',
          images: ['/assets/images/cart1.png', '/assets/images/cart1.png'],
        },
        {
          id: 3,
          user: 'Ahamed Antor',
          location: 'Khulna',
          rating: 4.7,
          avatar: '/assets/images/avatar1.png',
          comment:
            'Booked a home lab test through My Pharma. The sample collection was professional and I received my report digitally within a day. Very satisfied.',
          images: ['/assets/images/cart1.png', '/assets/images/cart1.png'],
        },
      ],
    },
  };

  const renderTruncatedText = (text, wordLimit) => {
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
      {/* 1. Tab Navigation Wrapper - Responsive Scroll */}
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
              <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">
                {productData.description.title}
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Introduction
                </h3>
                <div className="text-[15px] text-gray-600 leading-relaxed">
                  {renderTruncatedText(productData.description.intro, 60)}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Key Benefits:
                </h3>
                <ul className="space-y-3">
                  {productData.description.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-[15px] text-gray-700 font-medium"
                    >
                      <FiCheckCircle
                        className="text-(--color-primary-500) shrink-0"
                        size={20}
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">How to use</h3>
                <p className="text-[15px] text-gray-600 leading-relaxed">
                  {productData.description.usage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SPECIFICATION TAB */}
        {activeTab === 'Specification' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-10">
              Scabo Specification
            </h2>
            <div className="space-y-6">
              {productData.specification.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between w-full"
                >
                  <span className="text-[14px] sm:text-[16px] text-gray-500 font-medium tracking-wide uppercase shrink-0 w-1/3">
                    {spec.label}
                  </span>
                  <span className="text-gray-400 mx-4">-</span>
                  <span className="flex-1 text-[16px] sm:text-[20px] font-bold text-[#111827] text-right leading-tight">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RATING & REVIEWS TAB - Exactly matching the attached image */}
        {activeTab === 'Rating & Reviews' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Summary Section */}
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
              <div className="text-center md:text-left">
                <div className="flex items-baseline justify-center md:justify-start">
                  <span className="text-7xl font-bold text-gray-900">
                    {productData.reviews.average}
                  </span>
                  <span className="text-3xl font-bold text-gray-400 ml-2">
                    /5
                  </span>
                </div>
                <p className="text-gray-500 font-medium mt-2">
                  ({productData.reviews.totalCount} Reviews)
                </p>
              </div>

              <div className="flex-1 w-full max-w-md space-y-3">
                {productData.reviews.breakdown.map(item => (
                  <div key={item.stars} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 shrink-0 w-6">
                      <FiStar
                        className="text-amber-400 fill-amber-400"
                        size={16}
                      />
                      <span className="text-sm font-bold text-gray-700">
                        {item.stars}
                      </span>
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review List */}
            <div className="space-y-6">
              {productData.reviews.list.map(review => (
                <div
                  key={review.id}
                  className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={review.avatar}
                          alt={review.user}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {review.user}
                        </h4>
                        <p className="text-sm text-gray-400 font-medium">
                          {review.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiStar
                        className="text-amber-400 fill-amber-400"
                        size={18}
                      />
                      <span className="font-bold text-gray-900">
                        {review.rating}
                      </span>
                    </div>
                  </div>

                  <p className="text-[15px] text-gray-600 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Review Images */}
                  <div className="flex flex-wrap gap-3">
                    {review.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center p-2"
                      >
                        <Image
                          src={img}
                          alt="Review"
                          width={100}
                          height={100}
                          className="object-contain mix-blend-multiply"
                        />
                        {idx === 2 && review.images.length > 3 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xl">
                            2+
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-50">
              <p className="text-sm font-medium text-gray-500">
                Showing <span className="text-gray-900 font-bold">1 to 10</span>
              </p>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all cursor-pointer">
                  <FiChevronLeft size={20} />
                </button>
                <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                  <button className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50">
                    1
                  </button>
                  <button className="px-5 py-2.5 text-xs font-bold text-gray-500 border-l border-gray-100 hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-5 py-2.5 text-xs font-bold bg-black text-white border-l border-gray-100">
                    3
                  </button>
                  <button className="px-5 py-2.5 text-xs font-bold text-gray-500 border-l border-gray-100 hover:bg-gray-50">
                    ...
                  </button>
                  <button className="px-5 py-2.5 text-xs font-bold text-gray-500 border-l border-gray-100 hover:bg-gray-50">
                    5
                  </button>
                </div>
                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all cursor-pointer">
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsTabs;
