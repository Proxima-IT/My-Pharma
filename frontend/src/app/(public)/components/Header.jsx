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
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import MobileDrawer from './MobileDrawer';
import AddressSelectorPopup from './AddressSelectorPopup';
import { uploadPrescriptionApi } from '../../(user)/api/prescriptionApi';
import { useAddress } from '../../(user)/hooks/useAddress';
import { useCart } from '../hooks/useCart';
import { useProfile } from '../../(user)/hooks/useProfile';

const Header = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { addresses } = useAddress();
  const { items } = useCart();
  const { formData: profile } = useProfile();

  const cartCount = items?.length || 0;
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setIsLoggedIn(true);
  }, []);

  const handleSearch = e => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePrescriptionClick = e => {
    e.preventDefault();
    if (!isLoggedIn) router.push('/login');
    else fileInputRef.current.click();
  };

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);
      await uploadPrescriptionApi(token, formData);
      alert('Prescription uploaded successfully!');
      router.push('/user/prescriptions');
    } catch (err) {
      alert(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
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
        {/* Logo Section */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="block lg:hidden">
            <MobileDrawer />
          </div>
          <Link href="/">
            <Logo className="h-10 md:h-12 w-auto" />
          </Link>
        </div>

        {/* Search Bar - Flex-1 makes it take all remaining space */}
        <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Search for "healthcare products"'
            className="w-full h-12 pl-5 pr-14 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary-500)/30"
          />
          <button
            type="submit"
            className="absolute right-2 top-1.5 w-9 h-9 rounded-full bg-(--color-primary-500) flex items-center justify-center hover:scale-105 transition cursor-pointer"
          >
            <IoSearchOutline className="text-lg text-white" />
          </button>
        </form>

        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button
            onClick={handlePrescriptionClick}
            disabled={isUploading}
            className="hidden xl:flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold hover:bg-gray-50 transition-all"
          >
            <LuUpload className="text-(--color-primary-500)" />{' '}
            {isUploading ? '...' : 'Upload Prescription'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div
            className="w-11 h-11 rounded-full border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50"
            onClick={() =>
              isLoggedIn ? setIsLocationOpen(true) : router.push('/login')
            }
          >
            <HiOutlineLocationMarker size={20} />
          </div>
          <div className="w-11 h-11 rounded-full border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50">
            <FiBell size={20} />
          </div>
          <Link
            href="/cart"
            className="relative w-11 h-11 rounded-full border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50"
          >
            <BsCart3 size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-(--color-primary-500) text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href={isLoggedIn ? '/user/profile' : '/login'}>
            <div className="w-11 h-11 rounded-full border border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden">
              {profile?.avatar_preview ? (
                <Image
                  src={profile.avatar_preview}
                  alt="Profile"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser size={20} />
              )}
            </div>
          </Link>
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
