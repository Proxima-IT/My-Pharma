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
  // 1. Unwrap params using React.use()
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const pathname = usePathname();

  // 2. Call the real API hook
  const { product, isLoading, error } = useProductDetails(slug);

  // 3. Generate Breadcrumbs
  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;

    // Use real product name for the last breadcrumb if available
    let name =
      isLast && product
        ? product.name
        : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    return { name, href, isLast };
  });

  // 4. Process Images for Viewer
  const getProductImages = () => {
    if (!product) return [];
    const images = [];
    if (product.image) images.push(product.image);

    if (product.images && typeof product.images === 'string') {
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

  // Mock data for Alternative Brands (Keep UI only for now)
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
    <div className="w-full animate-in fade-in duration-700">
      {/* Breadcrumb Navigation - Fully Rounded & Content Width */}
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
                <span className="text-gray-900 font-bold">{crumb.name}</span>
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
        - Desktop: 10 columns (7 for Left, 3 for Right)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        {/* LEFT COLUMN ITEMS (7/10 width) */}
        <div className="order-1 lg:col-span-7 flex flex-col gap-8 min-w-0">
          <ProductImageViewer images={getProductImages()} />
          <div className="hidden lg:block">
            <ProductDetailsTabs product={product} />
          </div>
        </div>

        {/* RIGHT COLUMN ITEMS (3/10 width) */}
        <div className="order-2 lg:col-span-3 flex flex-col gap-8 min-w-0">
          {/* Passing the real product data to the Summary Card */}
          <ProductSummaryCard product={product} />

          <div className="block lg:hidden">
            <ProductDetailsTabs product={product} />
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

      <PopularProduct />
      <div className="mt-10">
        <UploadPrescriptionBanner />
      </div>
    </div>
  );
};

export default ProductSingle;
