'use client';

import Image from 'next/image';
import React from 'react';

const PaymentMethodCard = ({ selected, onSelect }) => {
  const methods = [
    { id: 'NAGAD', name: 'Nagad', img: '/assets/images/nagad.png' },
    { id: 'BKASH', name: 'Bkash', img: '/assets/images/bkash.png' },
    { id: 'ROCKET', name: 'Rocket', img: '/assets/images/rocket.png' },
    { id: 'UPAY', name: 'Upay', img: '/assets/images/upay.png' },
    { id: 'SSL', name: 'SSL Commerz', img: '/assets/images/ssl.png' },
    { id: 'CARD', name: 'Card', img: '/assets/images/card.png' },
    { id: 'COD', name: 'COD', img: '/assets/images/cod.png' },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 w-full transition-all">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Payment Method
        </h2>
        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest pt-4">
          Select Payment Option
        </p>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {methods.map(method => {
          const isActive = selected === method.id;

          return (
            <div
              key={method.id}
              onClick={() => onSelect?.(method.id)}
              className={`flex flex-col justify-center items-center p-4 rounded-[24px] border-2 transition-all cursor-pointer group ${
                isActive
                  ? 'border-(--color-primary-500) bg-(--color-primary-25)'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className="relative w-full h-12 mb-2">
                <Image
                  src={method.img}
                  alt={method.name}
                  fill
                  className="object-contain mix-blend-multiply transition-transform group-hover:scale-110"
                />
              </div>
              <h3
                className={`text-[13px] font-bold text-center leading-tight ${
                  isActive ? 'text-(--color-primary-500)' : 'text-gray-500'
                }`}
              >
                {method.name}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodCard;
