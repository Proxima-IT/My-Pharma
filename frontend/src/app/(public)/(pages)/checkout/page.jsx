'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MdKeyboardArrowLeft,
  MdTimer,
  MdLocalShipping,
  MdFlashOn,
} from 'react-icons/md';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiShoppingBag,
} from 'react-icons/fi';
import CartCard from '../cart/components/CartCard';
import ShippingAddressCard from '../cart/components/ShippingAddressCard';
import OrderSummaryCard from '../cart/components/OrderSummaryCard';
import PaymentMethodCard from '../cart/components/PaymentMethodCard';
import { useCart } from '../../hooks/useCart';
import { useAuthModal } from '../../context/AuthModalContext';
import {
  fetchDeliveryMethodsApi,
  buyNowPreviewApi,
  buyNowPlaceOrderApi,
  validateCouponApi,
} from '../../api/cartApi';
import { fetchProductDetailsApi } from '../../api/productApi';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import UiButton from '@/app/(public)/components/UiButton';
import { formatCurrency } from '@/app/(user)/lib/formatters';

const Checkout = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuthModal();
  const {
    items,
    summary,
    isLoading,
    error,
    placeOrder,
    refresh,
    updateQuantity,
    removeItem,
    appliedCoupon,
  } = useCart();

  // Buy Now Search Parameters
  const buyNow = searchParams.get('buyNow') === 'true';
  const productId = searchParams.get('productId');
  const slug = searchParams.get('slug');
  const initialQty = parseInt(searchParams.get('qty') || '1', 10);
  const dosage = searchParams.get('dosage') || '';

  // Buy Now Specific State
  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [buyNowQty, setBuyNowQty] = useState(initialQty);
  const [buyNowSummary, setBuyNowSummary] = useState(null);
  const [buyNowCoupon, setBuyNowCoupon] = useState(null);
  const [buyNowCouponCode, setBuyNowCouponCode] = useState('');
  const [buyNowCouponError, setBuyNowCouponError] = useState('');
  const [isApplyingBuyNowCoupon, setIsApplyingBuyNowCoupon] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(buyNow);
  const [buyNowError, setBuyNowError] = useState('');
  const [isPlacingBuyNowOrder, setIsPlacingBuyNowOrder] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [callbackMessage, setCallbackMessage] = useState('');

  // Fetch Delivery Methods (Shared)
  useEffect(() => {
    const loadDeliveryOptions = async () => {
      try {
        const data = await fetchDeliveryMethodsApi();
        const activeOptions = (
          Array.isArray(data) ? data : data.results || []
        ).filter(opt => opt.is_active);
        setDeliveryOptions(activeOptions);

        if (activeOptions.length > 0) {
          setSelectedMethodId(activeOptions[0].id);
        }
      } catch (err) {
        console.error('Failed to load delivery methods', err);
      }
    };
    loadDeliveryOptions();
  }, []);

  // Fetch Product Details for Buy Now flow
  useEffect(() => {
    if (!buyNow || !slug) return;
    const loadProductDetails = async () => {
      try {
        setBuyNowLoading(true);
        const data = await fetchProductDetailsApi(slug);
        setBuyNowProduct(data);
      } catch (err) {
        console.error('Failed to load Buy Now product details', err);
        setBuyNowError('Failed to load product details.');
      } finally {
        setBuyNowLoading(false);
      }
    };
    loadProductDetails();
  }, [buyNow, slug]);

  // Fetch Dynamic Buy Now Preview on quantity, delivery method, selected address, or coupon change
  useEffect(() => {
    if (!buyNow || !productId) return;

    const loadBuyNowPreview = async () => {
      try {
        const payload = {
          product: parseInt(productId, 10),
          quantity: buyNowQty,
        };
        if (selectedAddressId) {
          payload.shipping_address_id = Number(selectedAddressId);
        }
        if (selectedMethodId) {
          payload.delivery_method_id = Number(selectedMethodId);
        }
        if (buyNowCouponCode) {
          payload.coupon_code = buyNowCouponCode;
        }
        if (dosage) {
          payload.dosage = dosage;
        }

        const previewData = await buyNowPreviewApi(payload);
        setBuyNowSummary(previewData);
      } catch (err) {
        console.error('Failed to load buy now preview', err);
      }
    };

    loadBuyNowPreview();
  }, [
    buyNow,
    productId,
    buyNowQty,
    selectedAddressId,
    selectedMethodId,
    buyNowCouponCode,
    dosage,
  ]);

  // Refresh Standard Cart (Standard flow only)
  useEffect(() => {
    if (buyNow) return;
    if (selectedAddressId || selectedMethodId) {
      refresh(
        {
          address_id: selectedAddressId,
          delivery_method_id: selectedMethodId,
        },
        false,
      );
    }
  }, [selectedAddressId, selectedMethodId, refresh, buyNow]);

  // Handle Payment Callback — redirect to order details if order_id is present
  // NOTE: useSearchParams() can return empty during Suspense hydration, so we
  // also read window.location.search directly as a reliable fallback.
  useEffect(() => {
    const rawParams =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : null;
    const paymentStatus = (
      searchParams.get('payment_status') ||
      rawParams?.get('payment_status') ||
      ''
    ).toLowerCase();
    const orderId = searchParams.get('order_id') || rawParams?.get('order_id');

    if (!paymentStatus) {
      setCallbackMessage('');
      return;
    }

    // Order is already placed but unpaid — redirect to order details page
    if (
      (paymentStatus === 'failed' || paymentStatus === 'cancelled') &&
      orderId
    ) {
      router.replace(`/user/orders/${orderId}`);
      return;
    }

    if (paymentStatus === 'failed') {
      setCallbackMessage(
        'Payment failed. Please try again or choose another payment method.',
      );
      return;
    }
    if (paymentStatus === 'cancelled') {
      setCallbackMessage(
        'Payment was cancelled. You can review your order and try again.',
      );
      return;
    }
    setCallbackMessage('');
  }, [searchParams, router]);

  // Redirect Standard empty cart to cart page (Standard flow only)
  // Skip redirect if returning from a payment callback (order already placed, cart is empty)
  // NOTE: useSearchParams() can return empty during Suspense hydration, so we
  // also read window.location.search directly to avoid a premature /cart redirect.
  useEffect(() => {
    if (buyNow) return;
    const rawSearch =
      typeof window !== 'undefined' ? window.location.search : '';
    const paymentStatus =
      searchParams.get('payment_status') ||
      new URLSearchParams(rawSearch).get('payment_status');
    if (paymentStatus) return;
    if (!isLoading && items.length === 0 && !orderSuccess) {
      router.replace('/cart');
    }
  }, [items, isLoading, router, orderSuccess, buyNow, searchParams]);

  // Coupon handling for stateless Buy Now flow
  const handleApplyBuyNowCoupon = async code => {
    if (!code || !buyNowProduct || isApplyingBuyNowCoupon) return;
    setIsApplyingBuyNowCoupon(true);
    setBuyNowCouponError('');
    try {
      const subtotal = parseFloat(buyNowProduct.price || 0) * buyNowQty;
      const res = await validateCouponApi(code, subtotal);
      if (res.is_valid) {
        setBuyNowCoupon({
          code: res.code,
          discount_amount: res.discount_amount,
        });
        setBuyNowCouponCode(res.code);
      } else {
        setBuyNowCouponError(res.message || 'Invalid coupon code');
      }
    } catch (err) {
      console.error('Failed to validate coupon', err);
      setBuyNowCouponError(err.message || 'Failed to validate coupon');
    } finally {
      setIsApplyingBuyNowCoupon(false);
    }
  };

  const handleRemoveBuyNowCoupon = async () => {
    setBuyNowCoupon(null);
    setBuyNowCouponCode('');
    setBuyNowCouponError('');
  };

  // Quantity updates inside Review Items (Buy Now flow)
  const handleUpdateBuyNowQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    if (buyNowProduct && newQty > buyNowProduct.quantity_in_stock) {
      setBuyNowError(
        `Insufficient stock for ${buyNowProduct.name}. Available: ${buyNowProduct.quantity_in_stock}`,
      );
      setTimeout(() => setBuyNowError(''), 5000);
      return;
    }
    setBuyNowQty(newQty);
  };

  // Removing item redirects to product detail page (Buy Now flow)
  const handleRemoveBuyNowItem = () => {
    if (buyNowProduct?.slug) {
      router.push(`/product/${buyNowProduct.slug}`);
    } else {
      router.push('/');
    }
  };

  // Order Placement
  const handleConfirmOrder = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      openAuthModal();
      return;
    }

    if (!selectedAddressId) {
      alert('Please select a shipping address');
      return;
    }

    if (buyNow) {
      setIsPlacingBuyNowOrder(true);
      setBuyNowError('');
      try {
        const orderPayload = {
          product: parseInt(productId, 10),
          quantity: buyNowQty,
          shipping_address_id: Number(selectedAddressId),
          delivery_method_id: selectedMethodId,
          payment_method: paymentMethod,
          notes: '',
        };
        if (buyNowCouponCode) {
          orderPayload.coupon_code = buyNowCouponCode;
        }
        if (dosage) {
          orderPayload.dosage = dosage;
        }

        const result = await buyNowPlaceOrderApi(orderPayload);
        if (result) {
          if (paymentMethod !== 'COD' && result.gateway_url) {
            window.location.href = result.gateway_url;
            return;
          }
          setOrderSuccess(result);
        }
      } catch (err) {
        console.error('Failed to place Buy Now order', err);
        setBuyNowError(err.message || 'Failed to place order.');
      } finally {
        setIsPlacingBuyNowOrder(false);
      }
      return;
    }

    // Standard Cart flow
    const orderPayload = {
      shipping_address_id: Number(selectedAddressId),
      delivery_method_id: selectedMethodId,
      payment_method: paymentMethod,
      notes: '',
    };

    if (appliedCoupon?.code) {
      orderPayload.coupon_code = appliedCoupon.code;
    }

    const result = await placeOrder(orderPayload);
    if (result) {
      if (paymentMethod !== 'COD' && result.gateway_url) {
        window.location.href = result.gateway_url;
        return;
      }
      setOrderSuccess(result);
    }
  };

  const getDeliveryIcon = type => {
    switch (type) {
      case 'SAME_DAY':
        return <MdTimer size={24} />;
      case 'EXPRESS':
        return <MdFlashOn size={24} />;
      default:
        return <MdLocalShipping size={24} />;
    }
  };

  const pageLoading = buyNow ? buyNowLoading : isLoading;

  if (pageLoading && !orderSuccess) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orderSuccess) {
    const isOnlinePayment =
      orderSuccess.payment_required && orderSuccess.gateway_url;
    return (
      <div className="w-full px-4 md:px-7 pt-10 pb-28 flex justify-center items-center animate-in fade-in duration-700">
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 md:p-16 max-w-3xl w-full flex flex-col items-center text-center shadow-none">
          <div className="w-24 h-24 bg-(--success-50) border-2 border-(--success-100) text-(--success-500) rounded-full flex items-center justify-center mb-8">
            <FiCheckCircle size={60} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500 font-medium text-lg leading-relaxed mb-2">
            Thank you for your purchase.
          </p>
          <p className="text-gray-500 font-medium text-lg mb-4">
            Your order ID is{' '}
            <span className="text-gray-900 font-bold">#{orderSuccess.id}</span>
          </p>

          {isOnlinePayment ? (
            <div className="mb-8 px-5 py-2.5 bg-amber-50 border border-amber-200 rounded-full">
              <span className="text-amber-700 text-sm font-bold uppercase tracking-wider">
                ⏳ Payment Pending
              </span>
            </div>
          ) : (
            <div className="mb-8 px-5 py-2.5 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-blue-700 text-sm font-bold uppercase tracking-wider">
                💵 Cash on Delivery
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {isOnlinePayment ? (
              <>
                <a href={orderSuccess.gateway_url} className="w-full">
                  <UiButton className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 shadow-none border-none">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <span>Pay Now</span>
                      <FiArrowRight />
                    </div>
                  </UiButton>
                </a>
                <Link
                  href={`/user/orders/${orderSuccess.id}`}
                  className="w-full"
                >
                  <UiButton
                    variant="outline"
                    className="w-full h-14 shadow-none border-gray-100"
                  >
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <span>Pay Later / Track Order</span>
                      <FiArrowRight />
                    </div>
                  </UiButton>
                </Link>
              </>
            ) : (
              <>
                <Link href="/user/orders" className="w-full">
                  <UiButton className="w-full h-14 shadow-none border-none">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <span>Track Order</span>
                      <FiArrowRight />
                    </div>
                  </UiButton>
                </Link>
                <Link href="/" className="w-full">
                  <UiButton
                    variant="outline"
                    className="w-full h-14 shadow-none border-gray-100"
                  >
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <FiShoppingBag />
                      <span>Continue Shopping</span>
                    </div>
                  </UiButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Construct items & summary displays
  const getBuyNowProductImage = () => {
    if (!buyNowProduct) return null;
    if (buyNowProduct.image) return getMediaUrl(buyNowProduct.image);
    if (buyNowProduct.images && buyNowProduct.images.length > 0) {
      const firstImg = buyNowProduct.images[0];
      return getMediaUrl(
        typeof firstImg === 'object' ? firstImg.image : firstImg,
      );
    }
    return null;
  };

  const mockBuyNowItem = buyNowProduct
    ? {
        id: buyNowProduct.id,
        product_name: buyNowProduct.name,
        image_url: getBuyNowProductImage(),
        current_price: buyNowProduct.price,
        product_original_price: buyNowProduct.original_price,
        product_description: buyNowProduct.description,
        product_unit_name:
          buyNowProduct.unit_name || buyNowProduct.unit?.name || 'Unit',
        dosage: dosage,
        quantity: buyNowQty,
      }
    : null;

  const defaultDeliveryPrice = selectedMethodId
    ? parseFloat(
        deliveryOptions.find(opt => opt.id === selectedMethodId)?.price || 0,
      )
    : 150;

  const calculatedBuyNowSummary = buyNowSummary || {
    sub_total: (parseFloat(buyNowProduct?.price || 0) * buyNowQty).toFixed(2),
    discount_amount: buyNowCoupon?.discount_amount
      ? parseFloat(buyNowCoupon.discount_amount).toFixed(2)
      : '0.00',
    delivery_fee: defaultDeliveryPrice.toFixed(2),
    total_amount: (
      parseFloat(buyNowProduct?.price || 0) * buyNowQty -
      (buyNowCoupon?.discount_amount
        ? parseFloat(buyNowCoupon.discount_amount)
        : 0) +
      defaultDeliveryPrice
    ).toFixed(2),
    base_delivery_fee: defaultDeliveryPrice.toFixed(2),
    delivery_option_charge: 0,
    delivery_option_name: selectedMethodId
      ? deliveryOptions.find(opt => opt.id === selectedMethodId)?.name ||
        'Delivery'
      : 'Delivery',
  };

  const displayItems = buyNow
    ? mockBuyNowItem
      ? [mockBuyNowItem]
      : []
    : items;
  const displaySummary = buyNow
    ? buyNowSummary
      ? {
          ...buyNowSummary,
          sub_total: parseFloat(buyNowSummary.subtotal || 0),
          discount_amount: parseFloat(buyNowSummary.discount_amount || 0),
          delivery_fee: parseFloat(buyNowSummary.delivery_fee || 0),
          total_amount: parseFloat(buyNowSummary.total_payable || 0),
          base_delivery_fee:
            buyNowSummary.base_delivery_fee != null
              ? parseFloat(buyNowSummary.base_delivery_fee)
              : null,
          delivery_option_charge: parseFloat(
            buyNowSummary.delivery_option_charge || 0,
          ),
          delivery_option_name: buyNowSummary.delivery_option_name || null,
          delivery_option_type: buyNowSummary.delivery_option_type || null,
        }
      : calculatedBuyNowSummary
    : summary;

  return (
    <div className="w-full px-4 md:px-7 pt-7 pb-28 animate-in fade-in duration-700">
      <div className="flex items-center gap-5 mb-8">
        <Link href={buyNow ? `/product/${slug}` : '/cart'}>
          <button className="border border-gray-100 bg-white rounded-full px-6 py-2 text-center text-(--color-primary-500) flex gap-2 items-center text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all shadow-none">
            <MdKeyboardArrowLeft size={20} />
            {buyNow ? 'Back to Product' : 'Back to Cart'}
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Check Out
        </h1>
      </div>

      {(error || buyNowError || callbackMessage) && (
        <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-[24px] flex items-center gap-4 text-red-600 animate-in slide-in-from-top-2 shadow-none">
          <FiAlertCircle className="shrink-0" size={24} />
          <div>
            <p className="text-sm font-bold uppercase tracking-wider">
              Order Failed
            </p>
            <p className="text-sm font-medium opacity-90">
              {callbackMessage || buyNowError || error}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-[42%] flex flex-col gap-8">
          <ShippingAddressCard
            onAddressSelect={id => setSelectedAddressId(id)}
          />

          <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 transition-all shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-(--color-primary-50) flex items-center justify-center text-(--color-primary-500)">
                <FiShoppingBag size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Delivery Method
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {deliveryOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setSelectedMethodId(option.id)}
                  className={`flex items-center justify-between p-4 rounded-[24px] border transition-all cursor-pointer text-left shadow-none ${
                    selectedMethodId === option.id
                      ? 'border-(--color-primary-500) bg-(--color-primary-25)'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedMethodId === option.id
                          ? 'bg-(--color-primary-100) text-(--color-primary-600)'
                          : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {getDeliveryIcon(option.delivery_type)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm uppercase tracking-tight">
                        {option.name}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {option.duration || 'Standard delivery time'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-lg font-black text-gray-900 tracking-tight">
                      {formatCurrency(option.price || 0)}
                    </p>
                    {selectedMethodId === option.id && (
                      <FiCheckCircle
                        className="text-(--color-primary-500) mt-1"
                        size={16}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <PaymentMethodCard
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />
        </div>

        <div className="w-full lg:w-[58%] flex flex-col gap-8">
          <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 transition-all shadow-none">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
              Review Items ({displayItems.length})
            </h2>
            <div className="flex flex-col gap-4">
              {displayItems.map(item => (
                <CartCard
                  key={item.id}
                  item={item}
                  onUpdate={buyNow ? handleUpdateBuyNowQty : updateQuantity}
                  onRemove={buyNow ? handleRemoveBuyNowItem : removeItem}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {displaySummary?.shipping_charge === 0 && (
              <div className="bg-(--success-50) border border-(--success-100) rounded-3xl p-4 flex items-center gap-3 animate-in slide-in-from-right-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-(--success-500) shadow-sm">
                  <FiCheckCircle size={20} />
                </div>
                <div>
                  <p className="text-(--success-700) font-black text-sm uppercase tracking-wider">
                    Free Delivery Applied
                  </p>
                  <p className="text-(--success-600) text-xs font-medium">
                    You saved{' '}
                    {formatCurrency(displaySummary.base_delivery_fee || 150)} on
                    shipping!
                  </p>
                </div>
              </div>
            )}
            <OrderSummaryCard
              summary={displaySummary}
              items={displayItems}
              refresh={buyNow ? () => {} : refresh}
              onPlaceOrder={handleConfirmOrder}
              applyCoupon={buyNow ? handleApplyBuyNowCoupon : undefined}
              removeCoupon={buyNow ? handleRemoveBuyNowCoupon : undefined}
              appliedCoupon={buyNow ? buyNowCoupon : undefined}
              isApplyingCoupon={buyNow ? isApplyingBuyNowCoupon : undefined}
              error={buyNow ? buyNowCouponError : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
