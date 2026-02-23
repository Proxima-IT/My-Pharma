'use client';
import React from 'react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiDroplet,
  FiClock,
  FiSun,
  FiMoon,
  FiShield,
  FiActivity,
  FiCoffee,
  FiInfo,
} from 'react-icons/fi';

export default function HealthTipsPage() {
  const healthPoints = [
    {
      title: 'Stay Hydrated',
      description:
        'Drink at least 8-10 glasses of water daily to help your kidneys flush out medicine byproducts effectively.',
      icon: <FiDroplet />,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Consistent Timing',
      description:
        'Take your medications at the same time every day to maintain a steady level of treatment in your bloodstream.',
      icon: <FiClock />,
      color: 'bg-primary-50 text-primary-600 border-primary-100',
    },
    {
      title: 'Morning Sunlight',
      description:
        'Try to get 15 minutes of morning sun. Vitamin D is essential for bone health and boosts your natural immunity.',
      icon: <FiSun />,
      color: 'bg-orange-50 text-orange-600 border-orange-100',
    },
    {
      title: 'Sleep Hygiene',
      description:
        'Aim for 7-8 hours of uninterrupted sleep. Your body performs most of its tissue repair and recovery during deep sleep.',
      icon: <FiMoon />,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Avoid Self-Medication',
      description:
        "Never take antibiotics or heavy painkillers without a doctor's prescription. Misuse can lead to long-term health risks.",
      icon: <FiShield />,
      color: 'bg-red-50 text-red-600 border-red-100',
    },
    {
      title: 'Light Exercise',
      description:
        'A simple 20-minute walk can improve blood circulation and help your body respond better to healthcare treatments.',
      icon: <FiActivity />,
      color: 'bg-green-50 text-green-600 border-green-100',
    },
    {
      title: 'Limit Caffeine',
      description:
        'Avoid excessive tea or coffee, especially near your medicine timings, as caffeine can interfere with certain drug absorptions.',
      icon: <FiCoffee />,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Mobile Sub-Page Header */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link
          href="/user"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Health Tips</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <h1 className="text-3xl font-bold text-(--gray-900) tracking-tight">
          Daily Health Points
        </h1>
        <p className="text-base text-(--gray-500) mt-2 font-normal max-w-xl leading-relaxed">
          Small habits lead to big changes. Follow these expert-verified tips to
          enhance your recovery and maintain a healthy lifestyle.
        </p>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {healthPoints.map((tip, index) => (
          <div
            key={index}
            className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-200 shadow-sm flex items-start gap-6 transition-all hover:shadow-md group"
          >
            <div
              className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl border ${tip.color} transition-transform group-hover:scale-110 duration-500`}
            >
              {tip.icon}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {tip.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-normal">
                {tip.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer Note */}
      <div className="flex items-center justify-center gap-3 p-6 bg-gray-50 rounded-[24px] border border-gray-100">
        <FiInfo className="text-gray-400 shrink-0" size={20} />
        <p className="text-xs text-gray-500 font-medium leading-relaxed italic">
          Note: These tips are for general wellness. Always consult your doctor
          before making significant changes to your medical routine or diet.
        </p>
      </div>
    </div>
  );
}
