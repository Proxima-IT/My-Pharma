'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from '@/app/(public)/components/Sidebar';
import ProductSummaryCard from './components/ProductSummaryCard';
import ProductImageViewer from './components/ProductImageViewer';
import ProductDetailsTabs from './components/ProductDetailsTabs';
import AlternativeProductCard from './components/AlternativeProductCard';
import BundleSlider from '../../home/components/BundleSlider';
import PopularProduct from '../../home/components/PopularProduct';
import UploadPrescriptionBanner from '../../home/components/UploadPrescriptionBanner';

const ProductSingle = ({ params }) => {
  const pathname = usePathname();

  // Generate Breadcrumbs from Pathname
  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    let name =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { name, href, isLast };
  });

  const mockImages = [
    '/assets/images/cart1.png',
    '/assets/images/bundle1.png',
    '/assets/images/bundle2.png',
  ];

  // Mock data for Alternative Brands
  const alternativeProducts = [
    {
      id: 101,
      name: 'Fenac 50',
      brand: 'ACME',
      generic: 'Diclofenac Sodium BP 50mg',
      price: 620,
      oldPrice: 1230,
      slug: 'fenac-50',
      image: '/assets/images/cart1.png',
    },
    {
      id: 102,
      name: 'Diclo-12',
      brand: 'SQUARE',
      generic: 'Diclofenac Sodium BP 50mg',
      price: 580,
      oldPrice: 1100,
      slug: 'diclo-12',
      image: '/assets/images/cart1.png',
    },
  ];

  return (
    <div className="w-full overflow-x-hidden animate-in fade-in duration-700">
      <div className="flex gap-8 px-4 md:px-7 pt-7 pb-20 items-start">
        {/* 1. Left Sidebar - Fixed width on Desktop */}
        <div className="hidden lg:block shrink-0 w-[280px]">
          <Sidebar />
        </div>

        {/* 2. Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumb Navigation */}
          <nav className="bg-white border border-gray-100/50 rounded-full px-6 py-2.5 w-fit mb-8">
            <ol className="flex items-center gap-2 text-xs md:text-sm whitespace-nowrap">
              <li className="flex items-center gap-2">
                <Link
                  href="/"
                  className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-medium"
                >
                  Home
                </Link>
                <span className="text-gray-300 font-light">{'>'}</span>
              </li>
              {breadcrumbs.map(crumb => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {crumb.isLast ? (
                    <span className="text-gray-900 font-bold">
                      {crumb.name}
                    </span>
                  ) : (
                    <>
                      <Link
                        href={crumb.href}
                        className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-medium"
                      >
                        {crumb.name}
                      </Link>
                      <span className="text-gray-300 font-light">{'>'}</span>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* 
            Main Grid Container:
            - Mobile: 1 column
            - Desktop: 10 columns (7 for Left, 3 for Right)
            - min-w-0 on children prevents content from pushing grid width
          */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            {/* LEFT COLUMN ITEMS (7/10 width) */}
            <div className="order-1 lg:col-span-7 flex flex-col gap-8 min-w-0">
              <ProductImageViewer images={mockImages} />
              <div className="hidden lg:block">
                <ProductDetailsTabs />
              </div>
            </div>

            {/* RIGHT COLUMN ITEMS (3/10 width) */}
            <div className="order-2 lg:col-span-3 flex flex-col gap-8 min-w-0">
              <ProductSummaryCard />

              {/* Mobile Only: Tabs move here after Summary */}
              <div className="block lg:hidden">
                <ProductDetailsTabs />
              </div>

              <div className="bg-white border border-gray-100 rounded-[32px] p-6">
                <BundleSlider cardsToShow={1} />
              </div>

              <div className="bg-white border border-gray-100 rounded-[32px] p-6 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight px-1">
                  Alternative Brands
                </h3>
                <div className="flex flex-col gap-4">
                  {alternativeProducts.map(alt => (
                    <AlternativeProductCard key={alt.id} product={alt} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Global Sections */}
      <PopularProduct />
      <div className="px-4 md:px-7 mt-10">
        <UploadPrescriptionBanner />
      </div>
    </div>
  );
};

export default ProductSingle;
