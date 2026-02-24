'use client';

import React, { useEffect, useState, useRef } from 'react';
import { IoCloseSharp, IoSearchOutline } from 'react-icons/io5';
import { AiOutlineMenu } from 'react-icons/ai';
import {
  FiHome,
  FiHeart,
  FiActivity,
  FiSmile,
  FiZap,
  FiSearch,
  FiCommand,
  FiPlus,
  FiChevronDown,
} from 'react-icons/fi';
import {
  GiPill,
  GiHerbsBundle,
  GiHealthCapsule,
  GiDogBowl,
} from 'react-icons/gi';
import {
  MdOutlineScience,
  MdOutlineFaceRetouchingNatural,
  MdOutlineHomeWork,
} from 'react-icons/md';
import { FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa6';
import { LuUpload } from 'react-icons/lu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import { getCategories } from '@/data/categories';
import { uploadPrescriptionApi } from '../../(user)/api/prescriptionApi';

const MobileDrawer = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [expandedId, setExpandedId] = useState(2);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, [open]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  const getIcon = name => {
    switch (name) {
      case 'Home':
        return <FiHome size={20} />;
      case 'Medicine':
        return <GiPill size={20} />;
      case 'Healthcare':
        return <FiHeart size={20} />;
      case 'Lab Test':
        return <MdOutlineScience size={20} />;
      case 'Beauty':
        return <MdOutlineFaceRetouchingNatural size={20} />;
      case 'Sexual Wellness':
        return <FiZap size={20} />;
      case 'Baby Care':
        return <FiSmile size={20} />;
      case 'Herbal':
        return <GiHerbsBundle size={20} />;
      case 'Home Care':
        return <MdOutlineHomeWork size={20} />;
      case 'Supplement':
        return <GiHealthCapsule size={20} />;
      case 'Pet Care':
        return <GiDogBowl size={20} />;
      case 'Nutrition':
        return <FiActivity size={20} />;
      default:
        return <FiHome size={20} />;
    }
  };

  const handlePrescriptionClick = () => {
    if (!isLoggedIn) {
      setOpen(false);
      router.push('/login');
    } else {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `Mobile_Upload_${new Date().getTime()}`);
      await uploadPrescriptionApi(token, formData);
      alert('Prescription uploaded successfully!');
      setOpen(false);
      router.push('/user/prescriptions');
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <button onClick={() => setOpen(true)} className="p-2 -ml-2">
        <AiOutlineMenu className="text-2xl text-gray-900" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 w-[85%] max-w-[360px] h-full bg-white z-[70] transform transition-transform duration-500 ease-in-out overflow-y-auto no-scrollbar ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 flex justify-between items-center border-b border-gray-50">
            <Link href="/" onClick={() => setOpen(false)}>
              <Logo className="h-12 w-auto" />
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500"
            >
              <IoCloseSharp size={24} />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Socials & Contact */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-400">
                <FaFacebook
                  size={20}
                  className="hover:text-primary-500 transition-colors"
                />
                <FaLinkedin
                  size={20}
                  className="hover:text-primary-500 transition-colors"
                />
                <FaInstagram
                  size={20}
                  className="hover:text-primary-500 transition-colors"
                />
                <div className="h-4 w-px bg-gray-100 mx-2" />
                <span className="text-xs font-bold text-gray-900">
                  01755697233
                </span>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handlePrescriptionClick}
              disabled={isUploading}
              className="w-full h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center gap-3 text-[15px] font-bold text-gray-900 hover:bg-gray-50 transition-all"
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

            {/* Search Bar */}
            <div className="relative">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full h-12 pl-11 pr-12 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:border-(--color-primary-500) transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold">
                K
              </div>
            </div>

            {/* Categories Tree */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                Categories
              </h3>
              <nav className="space-y-1">
                {categories.map(cat => {
                  const isExpanded = expandedId === cat.id;
                  return (
                    <div key={cat.id} className="flex flex-col">
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : cat.id)
                        }
                        className={`flex items-center justify-between px-4 py-3 rounded-full transition-all ${
                          isExpanded
                            ? 'bg-(--color-primary-500) text-white'
                            : 'text-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={
                              isExpanded ? 'text-white' : 'text-gray-400'
                            }
                          >
                            {getIcon(cat.name)}
                          </span>
                          <span className="text-[15px] font-bold tracking-tight">
                            {cat.name}
                          </span>
                        </div>
                        <div
                          className={`flex items-center justify-center min-w-[24px] h-6 rounded-full text-[10px] font-bold ${
                            isExpanded
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {cat.count}
                        </div>
                      </button>

                      {isExpanded && cat.subCategories && (
                        <div className="ml-6 mt-1 relative border-l border-gray-100">
                          {cat.subCategories.map((sub, idx) => (
                            <div
                              key={idx}
                              className="relative flex items-center py-2 pl-6"
                            >
                              <div className="absolute left-0 top-0 w-5 h-1/2 border-b border-gray-100 rounded-bl-xl" />
                              <div className="flex items-center gap-3 w-full p-2 rounded-2xl bg-gray-50/50">
                                <div className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[9px] font-bold text-primary-500">
                                  {sub.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                  {sub.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default MobileDrawer;
