'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaFacebook, FaLinkedin } from 'react-icons/fa';
import { BsInstagram } from 'react-icons/bs';
import { LuUpload } from 'react-icons/lu';
import { IoSearchOutline, IoCloseSharp } from 'react-icons/io5';
import {
  FiBell,
  FiUser,
  FiHeart,
  FiEdit,
  FiLogOut,
  FiMapPin,
  FiFileText,
  FiCreditCard,
  FiShield,
  FiRefreshCcw,
  FiHelpCircle,
  FiShoppingBag,
} from 'react-icons/fi';
import { BsCart3 } from 'react-icons/bs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import MobileDrawer from './MobileDrawer';
import AddressSelectorPopup from './AddressSelectorPopup';
import SearchSuggestions from './SearchSuggestions';
import { uploadPrescriptionApi } from '../../(user)/api/prescriptionApi';
import { addToCartApi } from '../api/cartApi';
import { useAddress } from '../../(user)/hooks/useAddress';
import { useCart } from '../hooks/useCart';
import { useProfile } from '../../(user)/hooks/useProfile';
import { useLogoAdmin } from '../../(admin)/hooks/useLogoAdmin';
import { API_BASE_URL } from '@/app/(shared)/lib/apiConfig';

const TrackOrderIcon = ({ className, size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10.5418 4.5835H10.94C13.7333 4.5835 15.13 4.5835 15.6602 5.08518C16.1185 5.51883 16.3215 6.15767 16.1978 6.77636C16.0547 7.49209 14.9144 8.29861 12.6339 9.91165L8.90807 12.547C6.62758 14.16 5.48732 14.9666 5.34418 15.6823C5.22045 16.301 5.42355 16.9398 5.88183 17.3735C6.412 17.8752 7.80866 17.8752 10.602 17.8752H11.4585M7.3335 4.5835C7.3335 6.10228 6.10228 7.3335 4.5835 7.3335C3.06471 7.3335 1.8335 6.10228 1.8335 4.5835C1.8335 3.06471 3.06471 1.8335 4.5835 1.8335C6.10228 1.8335 7.3335 3.06471 7.3335 4.5835ZM20.1668 17.4168C20.1668 18.9356 18.9356 20.1668 17.4168 20.1668C15.898 20.1668 14.6668 18.9356 14.6668 17.4168C14.6668 15.898 15.898 14.6668 17.4168 14.6668C18.9356 14.6668 20.1668 15.898 20.1668 17.4168Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Search Suggestion States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { addresses } = useAddress();
  const { items, refresh: refreshCart } = useCart();
  const { formData: profile } = useProfile();
  const { logos } = useLogoAdmin();

  const systemLogo = logos?.find(l => l.slug === 'LOGO' || l.slug === 'logo');
  const cartCount = items?.length || 0;

  const base64ToFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Sync isLoggedIn status when path changes
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, [pathname]);

  // Sync isLoggedIn status when auth-change event fires
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Click Outside logic for Profile and Search
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setIsLoggedIn(true);

    const handleClickOutside = event => {
      const isMobile = window.innerWidth < 1024;
      if (!isMobile && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time Search Logic with Backend Autocomplete
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length >= 1) {
      setShowSuggestions(true);
      setIsSearching(true);

      const timer = setTimeout(() => {
        fetch(
          `${API_BASE_URL}/products/search/?q=${encodeURIComponent(q)}&autocomplete=true`,
        )
          .then(res => res.json())
          .then(data => {
            // Autocomplete mode returns a lightweight array of suggestions
            setSuggestions(Array.isArray(data) ? data.slice(0, 6) : []);
          })
          .catch(err => console.error('Search API error:', err))
          .finally(() => setIsSearching(false));
      }, 300); // Debounce for network efficiency

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const syncGuestData = async () => {
      const token = localStorage.getItem('access_token');
      if (!isLoggedIn || !token) return;
      const guestPresData = localStorage.getItem('guest_prescriptions');
      if (guestPresData) {
        try {
          const prescriptions = JSON.parse(guestPresData);
          for (const item of prescriptions) {
            const file = base64ToFile(item.fileData, item.fileName);
            const formData = new FormData();
            formData.append('file', file);
            await uploadPrescriptionApi(token, formData);
          }
          localStorage.removeItem('guest_prescriptions');
        } catch (err) {
          console.error(err);
        }
      }
      const guestCartData = localStorage.getItem('guest_cart');
      if (guestCartData) {
        try {
          const guestCart = JSON.parse(guestCartData);
          if (guestCart.items?.length > 0) {
            for (const item of guestCart.items) {
              await addToCartApi(
                token,
                item.id,
                item.quantity,
                item.selected_dosage,
              );
            }
          }
          localStorage.removeItem('guest_cart');
          await refreshCart(null, false);
        } catch (err) {
          console.error(err);
        }
      }
    };
    syncGuestData();
  }, [isLoggedIn, refreshCart]);

  const handleSearchSubmit = e => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    window.dispatchEvent(new Event('auth-change'));
    router.replace('/login');
  };

  const handlePrescriptionClick = e => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const token = localStorage.getItem('access_token');
      if (isLoggedIn && token) {
        const formData = new FormData();
        formData.append('file', file);
        await uploadPrescriptionApi(token, formData);
        toast.success('Prescription uploaded successfully!');
        router.push('/user/prescriptions');
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          const guestPrescriptions = JSON.parse(
            localStorage.getItem('guest_prescriptions') || '[]',
          );
          guestPrescriptions.push({
            id: Date.now(),
            fileName: file.name,
            fileData: base64String,
            uploadedAt: new Date().toISOString(),
          });
          localStorage.setItem(
            'guest_prescriptions',
            JSON.stringify(guestPrescriptions),
          );
          toast.success(
            'Prescription saved locally! Log in to sync with your account.',
          );
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const iconContainerClass =
    'w-10 h-10 md:w-12 md:h-12 rounded-full border-[2px] border-gray-200/60 flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300';

  const DropdownItem = ({ href, icon: Icon, label }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setIsProfileOpen(false)}
        className={`flex items-center gap-4 px-4 py-2 rounded-full text-[14px] transition-all duration-200 group ${isActive ? 'bg-[#233b8c] text-white shadow-md' : 'text-gray-700 hover:bg-[#233b8c] hover:text-white'}`}
      >
        <Icon
          size={18}
          className={
            isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
          }
        />
        <span className={isActive ? 'font-bold' : 'font-medium'}>{label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div className="hidden lg:flex justify-between items-center text-white py-2.5 px-9 bg-(--color-primary-500)">
        <h1 className="text-sm text-white font-medium">
          <span className="font-bold">Call Us: </span>01755697233, 09677333000
        </h1>
        <p className="font-semibold text-sm text-white">
          Medicines and healthcare products delivered to your doorstep
        </p>
        <div className="flex items-center gap-5 text-lg">
          <a href="https://www.facebook.com/mypharmabd" target="_blank" rel="noopener noreferrer">
            <FaFacebook />
          </a>
          <a href="https://www.linkedin.com/company/mypharmabd/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
          </a>
          <a href="https://www.instagram.com/mypharmaltd" target="_blank" rel="noopener noreferrer">
            <BsInstagram />
          </a>
        </div>
      </div>

      <div className="py-4 px-4 md:px-8 flex flex-col lg:flex-row items-center gap-4 lg:gap-8 w-full">
        <div className="flex items-center justify-between w-full lg:w-auto shrink-0">
          <div className="flex items-center gap-3">
            <div className="block lg:hidden">
              <MobileDrawer />
            </div>
            <Link href="/">
              <Image
                src={
                  systemLogo?.image_url || '/assets/images/my-pharma-logo.png'
                }
                alt="My Pharma Logo"
                width={160}
                height={45}
                className="h-9 md:h-12 w-auto object-contain"
                priority
                unoptimized
              />
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <Link href="/user/orders" className={iconContainerClass}>
              <TrackOrderIcon size={18} className="text-gray-700" />
            </Link>
            <Link href="/cart" className={`relative ${iconContainerClass}`}>
              <BsCart3 size={18} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-(--color-primary-500) text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <div
              className={`${iconContainerClass} overflow-hidden`}
              onClick={() =>
                isLoggedIn
                  ? setIsProfileOpen(!isProfileOpen)
                  : router.push('/login')
              }
            >
              {isLoggedIn && profile?.avatar_preview ? (
                <Image
                  src={profile.avatar_preview}
                  alt="Profile"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser size={18} className="text-gray-700" />
              )}
            </div>
          </div>
        </div>

        {/* Search Bar with Suggestions */}
        <div
          className="flex items-center gap-2 w-full lg:flex-1 relative"
          ref={searchRef}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 min-w-0"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() =>
                searchQuery.length >= 1 && setShowSuggestions(true)
              }
              placeholder='Search for "healthcare products"'
              className="w-full h-12 md:h-14 pl-6 pr-14 rounded-full border border-gray-100 text-sm outline-none ring-4 ring-(--color-primary-500)/10 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 w-9 h-9 md:w-11 md:h-11 rounded-full bg-(--color-primary-500) flex items-center justify-center hover:scale-105 transition cursor-pointer"
            >
              <IoSearchOutline className="text-lg md:text-xl text-white" />
            </button>
          </form>

          {/* Suggestions Dropdown */}
          <SearchSuggestions
            suggestions={suggestions}
            isLoading={isSearching}
            visible={showSuggestions}
            searchQuery={searchQuery}
            onSelect={() => {
              setShowSuggestions(false);
              setSearchQuery('');
            }}
          />

          <button
            onClick={handlePrescriptionClick}
            className="lg:hidden w-12 h-12 rounded-full border-[2px] border-gray-200/60 flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-none transition-all duration-300 shrink-0"
          >
            <LuUpload className="text-(--color-primary-500)" size={22} />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 md:gap-4 shrink-0">
          <button
            onClick={handlePrescriptionClick}
            disabled={isUploading}
            className="flex items-center gap-2 px-6 py-3.5 bg-white border-[2px] border-gray-200/60 rounded-full text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <LuUpload className="text-(--color-primary-500)" />{' '}
            {isUploading ? '...' : 'Upload Prescription'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
          />
          <Link href="/user/orders" className={iconContainerClass}>
            <TrackOrderIcon className="text-gray-700" />
          </Link>
          <div className={iconContainerClass}>
            <FiBell size={20} className="text-gray-700" />
          </div>
          <Link href="/cart" className={`relative ${iconContainerClass}`}>
            <BsCart3 size={20} className="text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-(--color-primary-500) text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="relative" ref={dropdownRef}>
            <div
              className={`${iconContainerClass} overflow-hidden hover:border-(--color-primary-500)/30`}
              onClick={() =>
                isLoggedIn
                  ? setIsProfileOpen(!isProfileOpen)
                  : router.push('/login')
              }
            >
              {profile?.avatar_preview ? (
                <Image
                  src={profile.avatar_preview}
                  alt="Profile"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser size={20} className="text-gray-700" />
              )}
            </div>
            {isLoggedIn && isProfileOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-72 bg-white border border-gray-100 rounded-[28px] p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="px-4 pt-2 pb-4">
                  <h3 className="text-xl font-bold text-gray-900">Account</h3>
                </div>
                <div className="flex flex-col gap-0.5">
                  <DropdownItem
                    href="/user/profile"
                    icon={FiUser}
                    label="Profile"
                  />
                  <div className="h-px bg-gray-50 mx-4 my-0.5" />
                  <DropdownItem
                    href="/user/orders"
                    icon={TrackOrderIcon}
                    label="Track Order"
                  />
                  <div className="h-px bg-gray-50 mx-4 my-0.5" />
                  <DropdownItem
                    href="/user/prescriptions"
                    icon={FiFileText}
                    label="Prescriptions"
                  />
                  <div className="h-px bg-gray-50 mx-4 my-0.5" />
                  <DropdownItem
                    href="/user/wishlist"
                    icon={FiHeart}
                    label="Wishlist"
                  />
                  <div className="h-px bg-gray-50 mx-4 my-0.5" />
                  <DropdownItem
                    href="/user/address"
                    icon={FiMapPin}
                    label="Manage Address"
                  />
                  <div className="h-px bg-gray-50 mx-4 my-0.5" />
                  <DropdownItem
                    href="/user/transactions"
                    icon={FiCreditCard}
                    label="Transaction History"
                  />
                  <div className="h-px bg-gray-50 mx-4 my-0.5" />
                  <DropdownItem
                    href="/terms"
                    icon={FiFileText}
                    label="Terms & Conditions"
                  />
                  <div className="h-px bg-gray-50 mx-4 my-0.5" />
                  <DropdownItem
                    href="/privacy"
                    icon={FiShield}
                    label="Privacy Policy"
                  />
                  <div className="h-px bg-gray-50 mx-4 my-0.5" />
                  <DropdownItem
                    href="/return-policy"
                    icon={FiRefreshCcw}
                    label="Refund Policy"
                  />
                  <div className="h-px bg-gray-50 mx-4 my-0.5" />
                  <DropdownItem
                    href="/user/faq"
                    icon={FiHelpCircle}
                    label="FAQ"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AddressSelectorPopup
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />

      {/* Mobile Profile Sidebar */}
      <div 
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-500 ${isLoggedIn && isProfileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setIsProfileOpen(false)}
        />
        
        {/* Sidebar Panel */}
        <div 
          className={`absolute right-0 top-0 h-full w-[280px] bg-white transition-transform duration-500 ease-out transform ${isLoggedIn && isProfileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex flex-col h-full overflow-hidden">
            {/* User Info Header */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-(--color-primary-500) overflow-hidden shrink-0">
                  {profile?.avatar_preview ? (
                    <Image src={profile.avatar_preview} alt="Profile" width={40} height={40} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser size={20} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{profile?.fullName || profile?.username || 'User Account'}</p>
                  <p className="text-[10px] text-gray-500 font-medium truncate">{profile?.email || profile?.phone}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <IoCloseSharp size={20} />
              </button>
            </div>

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 no-scrollbar">
              <DropdownItem href="/user/profile" icon={FiUser} label="Profile" />
              <div className="h-px bg-gray-50 mx-4 my-0.5" />
              <DropdownItem href="/user/orders" icon={TrackOrderIcon} label="Track Order" />
              <div className="h-px bg-gray-50 mx-4 my-0.5" />
              <DropdownItem href="/user/prescriptions" icon={FiFileText} label="Prescriptions" />
              <div className="h-px bg-gray-50 mx-4 my-0.5" />
              <DropdownItem href="/user/wishlist" icon={FiHeart} label="Wishlist" />
              <div className="h-px bg-gray-50 mx-4 my-0.5" />
              <DropdownItem href="/user/address" icon={FiMapPin} label="Manage Address" />
              <div className="h-px bg-gray-50 mx-4 my-0.5" />
              <DropdownItem href="/user/transactions" icon={FiCreditCard} label="Transaction History" />
              <div className="h-px bg-gray-100/50 mx-4 my-3" />
              <DropdownItem href="/terms" icon={FiFileText} label="Terms & Conditions" />
              <div className="h-px bg-gray-50 mx-4 my-0.5" />
              <DropdownItem href="/privacy" icon={FiShield} label="Privacy Policy" />
              <div className="h-px bg-gray-50 mx-4 my-0.5" />
              <DropdownItem href="/return-policy" icon={FiRefreshCcw} label="Refund Policy" />
              <div className="h-px bg-gray-50 mx-4 my-0.5" />
              <DropdownItem href="/user/faq" icon={FiHelpCircle} label="FAQ" />
            </div>  
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
