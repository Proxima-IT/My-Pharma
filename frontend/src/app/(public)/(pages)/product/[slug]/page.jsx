'use client';

import React, { use, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiChevronRight } from 'react-icons/fi';
import ProductSummaryCard from './components/ProductSummaryCard';
import ProductImageViewer from './components/ProductImageViewer';
import ProductDetailsTabs from './components/ProductDetailsTabs';
import AlternativeProductCard from './components/AlternativeProductCard';
import BundleSlider from '../../home/components/BundleSlider';
import PopularProductCard from '../../home/components/PopularProductCard';
import UploadPrescriptionBanner from '../../home/components/UploadPrescriptionBanner';
import { useProductDetails } from '../../../hooks/useProductDetails';
import { useProductData } from '../../../hooks/useProductData';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * ProductSingle Page
 * Fixed: Filtered related products to strictly show items from the same category only.
 */
const ProductSingle = ({ params }) => {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const pathname = usePathname();

  const {
    product,
    isLoading,
    error,
    refresh: refreshProduct,
  } = useProductDetails(slug);

  // Memoize parameters to stabilize object reference and prevent infinite loops
  const relatedParams = useMemo(
    () => ({
      category: product?.category || '',
      is_active: 'true',
    }),
    [product?.category],
  );

  const { products: relatedProducts } = useProductData(relatedParams);

  // FIXED: Added explicit category filtering to ensure only same-category products are displayed
  const displayRelated = useMemo(() => {
    const productList = Array.isArray(relatedProducts)
      ? relatedProducts
      : relatedProducts?.results || [];
    return productList
      .filter(p => p.category === product?.category && p.id !== product?.id)
      .slice(0, 8);
  }, [relatedProducts, product?.id, product?.category]);

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

  const getProductImages = () => {
    if (!product) return [];
    const images = [];
    if (product.image) images.push(getMediaUrl(product.image));
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => images.push(getMediaUrl(img)));
    }
    return [...new Set(images)].filter(Boolean);
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
    <div className="w-full animate-in fade-in duration-700 pb-10 overflow-hidden">
      {/* Breadcrumbs */}
      <nav className="bg-white border border-gray-100/50 rounded-full px-4 md:px-6 py-2 w-fit mb-6 lg:mb-5">
        <ol className="flex items-center gap-2 text-[10px] sm:text-xs lg:text-[11px] whitespace-nowrap">
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
                <span className="text-gray-900 font-bold truncate max-w-[100px] lg:max-w-none">
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

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start w-full">
        <div className="w-full lg:w-[62%] min-w-0 space-y-6 lg:space-y-5">
          <ProductImageViewer images={getProductImages()} />
          <ProductDetailsTabs
            product={product}
            onReviewSuccess={refreshProduct}
          />
        </div>

        <div className="w-full lg:w-[38%] min-w-0 space-y-6 lg:space-y-5">
          <ProductSummaryCard product={product} />

          <div className="bg-white border border-gray-100 rounded-[32px] lg:rounded-[20px] p-5 lg:p-4 shadow-sm">
            <h3 className="text-lg lg:text-base font-bold text-gray-900 tracking-tight mb-3 px-1">
              Bundle/Combo Package
            </h3>
            <BundleSlider cardsToShow={1} />
          </div>

          <div className="bg-white border border-gray-100 rounded-[32px] lg:rounded-[20px] p-5 lg:p-4 space-y-4 shadow-sm">
            <h3 className="text-lg lg:text-base font-bold text-gray-900 tracking-tight px-1">
              Alternative Brands
            </h3>
            <div className="flex flex-col gap-3">
              <AlternativeProductCard />
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {displayRelated.length > 0 && (
        <div className="mt-16 lg:mt-12 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl lg:text-xl font-bold text-gray-900 tracking-tight">
              You May Also Like
            </h2>
            <Link href={`/products?category=${product.category || ''}`}>
              <button className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-100 rounded-full text-xs lg:text-[13px] font-bold text-(--color-primary-500) hover:bg-gray-50 transition-all cursor-pointer">
                See More Product <FiChevronRight />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {displayRelated.map(item => (
              <PopularProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-16 lg:mt-12">
        <UploadPrescriptionBanner />
      </div>
    </div>
  );
};

export default ProductSingle;
