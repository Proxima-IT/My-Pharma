'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaFacebook, FaLinkedin } from 'react-icons/fa';
import { BsInstagram } from 'react-icons/bs';
import { LuUpload } from 'react-icons/lu';
import { IoSearchOutline } from 'react-icons/io5';
import { FiBell, FiUser } from 'react-icons/fi';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { BsCart3 } from 'react-icons/bs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import MobileDrawer from './MobileDrawer';
import AddressSelectorPopup from './AddressSelectorPopup';
import { uploadPrescriptionApi } from '../../(user)/api/prescriptionApi';
import { useAddress } from '../../(user)/hooks/useAddress';
import { useCart } from '../hooks/useCart';

const Header = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Real Data Hooks
  const { addresses } = useAddress();
  const { items } = useCart();

  // 2. Logic for dynamic display
  const activeAddress = addresses?.find(a => a.is_default) || addresses?.[0];
  const cartCount = items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // State for dynamic search
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSearch = e => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePrescriptionClick = e => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fileInputRef.current.click();
    }
  };

  const handleLocationClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setIsLocationOpen(true);
    }
  };

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
    ];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PNG, JPG, or PDF file.');
      return;
    }
    if (file.size > maxSize) {
      alert('File size must be less than 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `Uploaded_${new Date().getTime()}`);

      await uploadPrescriptionApi(token, formData);
      alert('Prescription uploaded successfully!');
      router.push('/user/prescriptions');
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err.message || 'Failed to upload prescription. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white">
      {/* top nav */}
      <div
        className="flex flex-col md:flex-row justify-between items-center text-black py-3 px-6 md:px-9"
        style={{
          background:
            'linear-gradient(-180deg, rgba(233,235,244,1) 0%, rgba(230,247,237,1) 100%)',
        }}
      >
        <h1 className="text-sm md:text-base text-gray-800 lg:block hidden">
          <span className="font-bold">Call Us: </span>01755697233, 09677333000
        </h1>
        <p className="font-semibold text-xs md:text-base text-center text-black my-1 md:my-0">
          Medicines and healthcare products delivered to your doorstep
        </p>
        <div className="lg:flex hidden items-center gap-5 text-xl">
          <a href="https://www.facebook.com/">
            <FaFacebook />
          </a>
          <div className="h-6 w-0.5 bg-black/10" />
          <a href="https://www.linkedin.com/">
            <FaLinkedin />
          </a>
          <div className="h-6 w-0.5 bg-black/10" />
          <a href="https://www.instagram.com/?hl=en">
            <BsInstagram />
          </a>
        </div>
      </div>

      {/* MAIN NAV */}
      <div className="py-0 md:py-4 px-6 md:px-8 flex flex-col lg:flex-row items-center gap-2 md:gap-4 lg:gap-10 justify-center w-full">
        {/* LEFT – logo */}
        <div className="flex w-full lg:w-auto gap-3 justify-between items-center">
          <div className="block lg:hidden ">
            <MobileDrawer />
          </div>
          <div className="shrink-0 lg:w-auto lg:text-left">
            <Link
              href="/"
              className="block hover:opacity-80 transition-opacity duration-300"
            >
              <Logo className="h-16 w-3/4 lg:w-5/6 " />
            </Link>
          </div>
          <Link
            href={isLoggedIn ? '/user/profile' : '/login'}
            className="block lg:hidden"
          >
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-(--color-gray-100) flex items-center justify-center cursor-pointer hover:bg-(--color-gray-50)">
              <FiUser size={20} />
            </div>
          </Link>
        </div>

        {/* MIDDLE – Search & Upload */}
        <div className="flex items-center gap-3 w-full min-w-0 flex-1 order-last lg:order-none">
          <div className="shrink-0 hidden md:block">
            <button
              onClick={handlePrescriptionClick}
              disabled={isUploading}
              className="inline-flex items-center gap-2 whitespace-nowrap px-6 py-3.5 bg-white border border-(--color-gray-200) rounded-full text-sm font-bold text-black cursor-pointer hover:bg-(--color-gray-50) transition-all disabled:opacity-50"
            >
              <LuUpload
                className={`text-lg text-(--color-primary-500) ${isUploading ? 'animate-bounce' : ''}`}
              />
              {isUploading ? 'Uploading...' : 'Upload Prescription'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Dynamic Search Bar */}
          <form onSubmit={handleSearch} className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search for "healthcare products"'
              className="w-full h-10 md:h-12 pl-5 pr-14 rounded-full border border-(--color-gray-200) text-gray-700 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary-500)/30"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-(--color-primary-500) flex items-center justify-center hover:scale-105 transition cursor-pointer"
            >
              <IoSearchOutline className="text-xl text-white" />
            </button>
          </form>
        </div>

        {/* RIGHT – icons + location */}
        <div className="flex items-center justify-center lg:justify-end gap-4 md:gap-6 w-full lg:w-auto shrink-0">
          {/* Location - Updated Alignment to Left */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={handleLocationClick}
          >
            <HiOutlineLocationMarker className="text-2xl text-gray-700 group-hover:text-(--color-primary-500) transition-colors" />
            <div className="text-left hidden sm:block">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Delivery to
              </p>
              <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">
                {activeAddress
                  ? `${activeAddress.thana || activeAddress.district}`
                  : 'Select Location'}
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-(--color-gray-100) flex items-center justify-center cursor-pointer hover:bg-(--color-gray-50)">
              <FiBell size={20} />
            </div>
            <Link href="/cart">
              <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full border border-(--color-gray-100) flex items-center justify-center cursor-pointer hover:bg-(--color-gray-50)">
                <BsCart3 size={20} />
                {/* Dynamic Cart Badge */}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-(--color-primary-500) text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center z-10">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            <Link
              href={isLoggedIn ? '/user/profile' : '/login'}
              className="hidden lg:block"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-(--color-gray-100) flex items-center justify-center cursor-pointer hover:bg-(--color-gray-50)">
                <FiUser size={20} />
              </div>
            </Link>
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
