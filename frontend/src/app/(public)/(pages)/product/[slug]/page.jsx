'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProductSummaryCard from './components/ProductSummaryCard';
import ProductImageViewer from './components/ProductImageViewer';
import ProductDetailsTabs from './components/ProductDetailsTabs';
import AlternativeProductCard from './components/AlternativeProductCard';
import BundleSlider from '../../home/components/BundleSlider';
import PopularProduct from '../../home/components/PopularProduct';
import UploadPrescriptionBanner from '../../home/components/UploadPrescriptionBanner';
import { useProductDetails } from '../../../hooks/useProductDetails';

const ProductSingle = ({ params }) => {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const pathname = usePathname();

  const { product, isLoading, error } = useProductDetails(slug);

  // 1. Generate Breadcrumbs
  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;

    let name =
      isLast && product
        ? product.name
        : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    return { name, href, isLast };
  });

  // 2. Process Images for Viewer
  const getProductImages = () => {
    if (!product) return [];
    const images = [];
    if (product.image) images.push(product.image);

    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images);
    } else if (product.images && typeof product.images === 'string') {
      try {
        const extraImages = JSON.parse(product.images);
        if (Array.isArray(extraImages)) images.push(...extraImages);
      } catch {
        const extraImages = product.images.split(',').map(img => img.trim());
        images.push(...extraImages);
      }
    }
    return [...new Set(images)];
  };

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
        <p className="text-gray-500">
          {error || 'The product you are looking for does not exist.'}
        </p>
        <Link
          href="/products"
          className="inline-block text-(--color-primary-500) font-bold underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700 pb-10">
      {/* Breadcrumb Navigation - Responsive Padding */}
      <nav className="bg-white border border-gray-100/50 rounded-full px-4 md:px-6 py-2.5 w-fit mb-6 md:mb-8">
        <ol className="flex items-center gap-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
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
                <span className="text-gray-900 font-bold truncate max-w-[120px] sm:max-w-none">
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
        Main Grid Strategy:
        1. Large Screen (xl): 10-column grid (7:3 split)
        2. Laptop Screen (lg): 1-column grid (Stacked to accommodate Category Sidebar)
        3. Tab Screen (md): 1-column grid
        4. Phone Screen (base): 1-column grid
      */}
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 md:gap-8 items-start">
        {/* LEFT COLUMN: Image Viewer & Tabs (on Large Screens) */}
        <div className="xl:col-span-7 flex flex-col gap-6 md:gap-8 min-w-0">
          <ProductImageViewer images={getProductImages()} />

          {/* Tabs shown here only on Large screens to keep the summary card visible on the right */}
          <div className="hidden xl:block">
            <ProductDetailsTabs product={product} />
          </div>
        </div>

        {/* RIGHT COLUMN: Summary, Alternatives, and Tabs (on Laptop/Mobile) */}
        <div className="xl:col-span-3 flex flex-col gap-6 md:gap-8 min-w-0">
          <ProductSummaryCard product={product} />

          {/* Tabs move here for Laptop, Tab, and Phone screens for better vertical flow */}
          <div className="block xl:hidden">
            <ProductDetailsTabs product={product} />
          </div>

          {/* Bundle Section */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-5 md:p-6">
            <BundleSlider cardsToShow={1} />
          </div>

          {/* Alternative Brands Section */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-5 md:p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight px-1">
              Alternative Brands
            </h3>
            <div className="flex flex-col gap-4">
              {/* Currently showing placeholder as per previous instruction */}
              <AlternativeProductCard />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Sections */}
      <div className="space-y-10 mt-10">
        <PopularProduct />
        <UploadPrescriptionBanner />
      </div>
    </div>
  );
};

export default ProductSingle;
