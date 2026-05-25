'use client';

import React, { use, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiChevronRight } from 'react-icons/fi';
import ProductSummaryCard from './components/ProductSummaryCard';
import ProductImageViewer from './components/ProductImageViewer';
import ProductDetailsTabs from './components/ProductDetailsTabs';
import AlternativeProductCard from './components/AlternativeProductCard';
import ProductBundleSlider from './components/ProductBundleSlider';
import PopularProductCard from '../../home/components/PopularProductCard';
import UploadPrescriptionBanner from '../../home/components/UploadPrescriptionBanner';
import { useProductDetails } from '../../../hooks/useProductDetails';
import { useProductData } from '../../../hooks/useProductData';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * ProductSingle Page
 * Features: Dynamic Generic Suggestions based on chemical ingredient matching.
 * Design: Public Zone (Premium, rounded-[32px]).
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

  // Memoize parameters for related products query
  const relatedParams = useMemo(
    () => ({
      category: product?.category || '',
      is_active: 'true',
    }),
    [product?.category],
  );

  const { products: relatedProducts } = useProductData(relatedParams);

  // Filter related products to strictly show items from the same category only
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
        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tighter">
          Product Not Found
        </h2>
        <Link
          href="/products"
          className="inline-block text-(--color-primary-500) font-bold underline decoration-2 underline-offset-4"
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
        <ol className="flex items-center gap-2 text-[10px] sm:text-xs lg:text-[11px] whitespace-nowrap uppercase tracking-wider">
          <li className="flex items-center gap-2">
            <Link
              href="/"
              className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-bold"
            >
              Home
            </Link>
            <span className="text-gray-300 font-light">{'>'}</span>
          </li>
          {breadcrumbs.map(crumb => (
            <li key={crumb.href} className="flex items-center gap-2">
              {crumb.isLast ? (
                <span className="text-gray-900 font-black truncate max-w-[150px] lg:max-w-none">
                  {crumb.name}
                </span>
              ) : (
                <>
                  <Link
                    href={crumb.href}
                    className="text-gray-400 hover:text-(--color-primary-500) transition-colors font-bold"
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
        {/* Gallery & Descriptions */}
        <div className="w-full lg:w-[62%] min-w-0 space-y-6 lg:space-y-5">
          <ProductImageViewer images={getProductImages()} />
          {/* Mobile Summary Card: Placed after image for mobile stack order */}
          <div className="lg:hidden">
            <ProductSummaryCard product={product} />
          </div>
          <ProductDetailsTabs
            product={product}
            onReviewSuccess={refreshProduct}
          />
        </div>

        {/* Purchase Info & Generic Suggestions */}
        <div className="w-full lg:w-[38%] min-w-0 space-y-6 lg:space-y-5">
          {/* Desktop Summary Card: Hidden on mobile to maintain stack order */}
          <div className="hidden lg:block">
            <ProductSummaryCard product={product} />
          </div>

          {/* Bundle/Combo Offerings */}
          <div className="bg-white border border-gray-100 rounded-[32px] lg:rounded-[24px] p-6 lg:p-5">
            <h3 className="text-lg lg:text-base font-black text-gray-900 tracking-tight mb-3 px-1 uppercase">
              Bundle Packages
            </h3>
            <ProductBundleSlider />
          </div>

          {/* Generic Alternatives Engine */}
          <div className="bg-white border border-gray-100 rounded-[32px] lg:rounded-[24px] p-6 lg:p-5 space-y-4">
            <div>
              <h3 className="text-lg lg:text-base font-black text-gray-900 tracking-tight px-1 uppercase leading-tight">
                Alternative Brands For {product.name}
              </h3>
              <p className="text-[11px] font-medium text-gray-500 px-1 mt-1 leading-relaxed"></p>
            </div>
            {/* Component now handles its own fetching based on product.ingredient ID */}
            <AlternativeProductCard currentProduct={product} />
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {displayRelated.length > 0 && (
        <div className="mt-16 lg:mt-12 space-y-8">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-2xl lg:text-xl font-black text-gray-900 tracking-tighter uppercase">
              You May Also Like
            </h2>
            <Link href={`/products?category=${product.category || ''}`}>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-xs font-black text-(--color-primary-500) hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer uppercase tracking-widest">
                Explore More <FiChevronRight />
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

      {/* Marketing / Prescription Banner */}
      <div className="mt-20 lg:mt-16">
        <UploadPrescriptionBanner />
      </div>
    </div>
  );
};

export default ProductSingle;
