'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaFacebook, FaLinkedin } from 'react-icons/fa';
import { BsInstagram } from 'react-icons/bs';
import { LuUpload } from 'react-icons/lu';
import { IoSearchOutline } from 'react-icons/io5';
import {
  FiBell,
  FiUser,
  FiHeart,
  FiEdit,
  FiLogOut,
  FiMapPin,
} from 'react-icons/fi';
import { BsCart3 } from 'react-icons/bs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import MobileDrawer from './MobileDrawer';
import AddressSelectorPopup from './AddressSelectorPopup';
import { uploadPrescriptionApi } from '../../(user)/api/prescriptionApi';
import { addToCartApi } from '../api/cartApi';
import { useAddress } from '../../(user)/hooks/useAddress';
import { useCart } from '../hooks/useCart';
import { useProfile } from '../../(user)/hooks/useProfile';

const Header = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { addresses } = useAddress();
  const { items, refresh: refreshCart } = useCart();
  const { formData: profile } = useProfile();

  const cartCount = items?.length || 0;
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setIsLoggedIn(true);

    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // SYNC LOGIC: Sync guest data (Prescriptions & Cart) to DB after login
  useEffect(() => {
    const syncGuestData = async () => {
      const token = localStorage.getItem('access_token');
      if (!isLoggedIn || !token) return;

      // 1. Sync Prescriptions
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
          console.error('Failed to sync guest prescriptions:', err);
        }
      }

      // 2. Sync Cart Items
      const guestCartData = localStorage.getItem('guest_cart');
      if (guestCartData) {
        try {
          const guestCart = JSON.parse(guestCartData);
          if (guestCart.items?.length > 0) {
            for (const item of guestCart.items) {
              // Pass ID, Quantity, and the stored Selected Dosage to the API
              await addToCartApi(
                token,
                item.id,
                item.quantity,
                item.selected_dosage,
              );
            }
          }
          localStorage.removeItem('guest_cart');
          await refreshCart(null, false); // Refresh global cart state
        } catch (err) {
          console.error('Failed to sync guest cart:', err);
        }
      }
    };

    syncGuestData();
  }, [isLoggedIn, refreshCart]);

  const handleSearch = e => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setIsLoggedIn(false);
    setIsProfileOpen(false);
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
        alert('Prescription uploaded successfully!');
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
          alert(
            'Prescription saved locally! Log in to sync with your account.',
          );
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      alert(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
      {/* Top Nav */}
      <div className="hidden lg:flex justify-between items-center text-black py-2.5 px-9 bg-gradient-to-r from-gray-50 to-green-50">
        <h1 className="text-sm text-gray-800 font-medium">
          <span className="font-bold">Call Us: </span>01755697233, 09677333000
        </h1>
        <p className="font-semibold text-sm text-black">
          Medicines and healthcare products delivered to your doorstep
        </p>
        <div className="flex items-center gap-5 text-lg">
          <a href="#">
            <FaFacebook />
          </a>
          <a href="#">
            <FaLinkedin />
          </a>
          <a href="#">
            <BsInstagram />
          </a>
        </div>
      </div>

      {/* Main Nav */}
      <div className="py-4 px-4 md:px-8 flex items-center gap-4 lg:gap-8 w-full">
        <div className="flex items-center gap-3 shrink-0">
          <div className="block lg:hidden">
            <MobileDrawer />
          </div>
          <Link href="/">
            <Logo className="h-10 md:h-12 w-auto" />
          </Link>
        </div>

        <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Search for "healthcare products"'
            className="w-full h-14 pl-6 pr-14 rounded-full border border-gray-100 text-sm focus:outline-none focus:ring-4 focus:ring-(--color-primary-500)/10 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-2 w-10 h-10 rounded-full bg-(--color-primary-500) flex items-center justify-center hover:scale-105 transition cursor-pointer"
          >
            <IoSearchOutline className="text-xl text-white" />
          </button>
        </form>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button
            onClick={handlePrescriptionClick}
            disabled={isUploading}
            className="hidden xl:flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-full text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
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

          <div
            className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm transition-all"
            onClick={() =>
              isLoggedIn ? setIsLocationOpen(true) : router.push('/login')
            }
          >
            <FiMapPin size={20} className="text-gray-700" />
          </div>

          <div className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm transition-all">
            <FiBell size={20} className="text-gray-700" />
          </div>

          <Link
            href="/cart"
            className="relative w-11 h-11 md:w-12 md:h-12 rounded-full border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm transition-all"
          >
            <BsCart3 size={20} className="text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-(--color-primary-500) text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={dropdownRef}>
            <div
              className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden shadow-sm transition-all hover:border-(--color-primary-500)/30"
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
              <div className="absolute right-0 top-[calc(100%+12px)] w-56 bg-white border border-gray-100 rounded-[24px] py-3 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="px-5 py-2 mb-2 border-b border-gray-50">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Account
                  </p>
                </div>
                <Link
                  href="/user/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-(--color-primary-500) transition-all"
                >
                  <FiUser size={18} /> View Profile
                </Link>
                <Link
                  href="/user/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-(--color-primary-500) transition-all"
                >
                  <FiEdit size={18} /> Edit Profile
                </Link>
                <Link
                  href="/user/wishlist"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-(--color-primary-500) transition-all"
                >
                  <FiHeart size={18} /> Wishlist
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-2.5 mt-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-all border-t border-gray-50 pt-3 cursor-pointer"
                >
                  <FiLogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <AddressSelectorPopup
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />
    </header>
  );
};

export default Header;
