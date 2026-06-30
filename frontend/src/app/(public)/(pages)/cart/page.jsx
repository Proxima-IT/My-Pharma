'use client';

import Image from 'next/image';
import LinkComponent from 'next/link';
import React from 'react';
import { useRouter } from 'next/navigation';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { FiShoppingBag } from 'react-icons/fi';
import CartCard from './components/CartCard';
import DealsSection from '../home/components/DealsSection';
import SmartHealthBundle from '../home/components/SmartHealthBundle';
import ShippingAddressCard from './components/ShippingAddressCard';
import OrderSummaryCard from './components/OrderSummaryCard';
import { useCart } from '../../hooks/useCart';
import { fetchDeliveryMethodsApi } from '../../api/cartApi';
import { useAuthModal } from '../../context/AuthModalContext';

/**
 * Cart Page
 * Updated: Integrated with AuthModal to trigger login popup if user attempts
 * to proceed to checkout while unauthenticated.
 */
const Cart = () => {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const {
    items,
    summary,
    isLoading,
    error,
    updateQuantity,
    removeItem,
    refresh,
    selectedDeliveryId,
    updateDeliveryOption,
  } = useCart();

  const [deliveryMethods, setDeliveryMethods] = React.useState([]);
  const selectedMethodId = selectedDeliveryId;
  const setSelectedMethodId = updateDeliveryOption;

  /**
   * Intercepts the proceed action.
   * If user is not logged in, opens the login modal with a redirect intent.
   */
  const handleProceedToCheckout = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      openAuthModal('/checkout');
    } else {
      router.push('/checkout');
    }
  };

  React.useEffect(() => {
    const getMethods = async () => {
      try {
        const methods = await fetchDeliveryMethodsApi();
        const methodList = methods.results || methods;
        const active = methodList.filter(m => m.is_active);
        setDeliveryMethods(active);

        // Auto-select first method if none selected/saved
        const savedId = localStorage.getItem('selected_delivery_id');
        if (!savedId && active.length > 0) {
          updateDeliveryOption(active[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch delivery methods:', err);
      }
    };
    getMethods();
  }, [updateDeliveryOption]);

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 md:px-7 pt-7 pb-28 text-center">
        <div className="bg-red-50 border border-red-100 rounded-[32px] p-12 max-w-2xl mx-auto shadow-none">
          <p className="text-red-600 font-bold">Error loading cart: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-(--color-primary-500) font-bold underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-7 pt-7 pb-28">
      <div className="flex items-center gap-5 mb-8">
        <LinkComponent href="/products">
          <button className="border border-gray-100 bg-white rounded-full px-6 py-2 text-center text-(--color-primary-500) flex gap-2 items-center text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all shadow-none">
            <MdKeyboardArrowLeft size={20} />
            Back
          </button>
        </LinkComponent>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Your Cart
        </h1>
      </div>

      {items.length > 0 ? (
        <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[58%] flex flex-col gap-4">
            {items.map((item, index) => (
              <CartCard
                key={item.id || `cart-item-${index}`}
                item={item}
                onUpdate={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="w-full lg:w-[42%] flex flex-col gap-8">
            <ShippingAddressCard />

            {/* Select Delivery Selection */}
            {deliveryMethods.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 transition-all shadow-none">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiShoppingBag className="text-(--color-primary-500)" />
                  Select Delivery
                </h3>
                <div className="flex flex-col gap-3">
                  {deliveryMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                      className={`flex items-center justify-between p-4 rounded-[24px] border transition-all text-left ${
                        selectedMethodId === method.id
                          ? 'border-(--color-primary-500) bg-(--color-primary-25)'
                          : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">
                          {method.name}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {method.duration || 'Standard delivery'}
                        </span>
                      </div>
                      <span className="text-base font-black text-gray-900">
                        ৳{parseFloat(method.price || 0).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <OrderSummaryCard
              summary={summary}
              items={items}
              refresh={refresh}
              onPlaceOrder={handleProceedToCheckout}
              showDiscountBreakdown={false}
            />
          </div>
        </div>
      ) : (
        <div className="w-full py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-[32px] text-center space-y-6 shadow-none">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
            <FiShoppingBag size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>
            <p className="text-gray-500 max-w-xs mx-auto">
              Looks like you haven&apos;t added any medicines yet.
            </p>
          </div>
          <LinkComponent href="/products">
            <button className="bg-(--color-primary-500) text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-(--color-primary-600) transition-all cursor-pointer shadow-none">
              Start Shopping
            </button>
          </LinkComponent>
        </div>
      )}

      <div className="mt-20 space-y-20">
        <DealsSection />
        <SmartHealthBundle />
      </div>
    </div>
  );
};

export default Cart;
