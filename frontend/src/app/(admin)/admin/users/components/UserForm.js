'use client';
import React, { useState, useEffect } from 'react';

const UserForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'REGISTERED_USER',
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role || 'REGISTERED_USER',
        is_active: initialData.is_active ?? true,
        password: '',
      });
    }
  }, [initialData]);

  const handleSubmit = e => {
    e.preventDefault();

    // হাইপোথিসিস ফিক্স: পাসওয়ার্ড খালি থাকলে সেটি রিকোয়েস্ট থেকে বাদ দেওয়া
    const finalPayload = { ...formData };
    if (!finalPayload.password || finalPayload.password.trim() === '') {
      delete finalPayload.password;
    }

    onSubmit(finalPayload);
  };

  const labelClass =
    'font-mono text-[11px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-gray-200 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-300 text-[#1B1B1B]';

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={labelClass}>FULL NAME / USERNAME</label>
          <input
            type="text"
            placeholder="E.G. ARIFUL ISLAM"
            className={inputClass}
            value={formData.username}
            onChange={e =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className={labelClass}>EMAIL ADDRESS</label>
          <input
            type="email"
            placeholder="USER@EXAMPLE.COM"
            className={inputClass}
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label className={labelClass}>PHONE NUMBER</label>
          <input
            type="text"
            placeholder="017XXXXXXXX"
            className={inputClass}
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClass}>
            {initialData
              ? 'NEW PASSWORD (LEAVE BLANK TO KEEP OLD)'
              : 'SET PASSWORD'}
          </label>
          <input
            type="password"
            className={inputClass}
            value={formData.password}
            onChange={e =>
              setFormData({ ...formData, password: e.target.value })
            }
            required={!initialData}
          />
        </div>

        <div>
          <label className={labelClass}>ACCESS LEVEL (ROLE)</label>
          <select
            className={inputClass + ' cursor-pointer'}
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="REGISTERED_USER">NORMAL CUSTOMER</option>
            <option value="PHARMACY_ADMIN">PHARMACY OWNER</option>
            <option value="DOCTOR">DOCTOR</option>
            <option value="SUPER_ADMIN">SYSTEM ADMIN</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100">
          <div className="flex flex-col">
            <span className="font-mono text-[12px] font-bold text-[#1B1B1B] uppercase">
              ACCOUNT ACTIVE?
            </span>
            <span className="text-[10px] text-[#8A8A78] uppercase">
              If off, the user cannot login
            </span>
          </div>
          <input
            type="checkbox"
            className="w-8 h-8 border-gray-300 accent-[#3A5A40] cursor-pointer"
            checked={formData.is_active}
            onChange={e =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-16 bg-[#3A5A40] text-white font-black uppercase tracking-[0.3em] text-sm hover:bg-[#F59E0B] transition-all duration-300 border border-transparent disabled:opacity-50 cursor-pointer"
      >
        {isLoading
          ? 'PROCESSING...'
          : initialData
            ? 'UPDATE ACCOUNT DETAILS'
            : 'CREATE NEW ACCOUNT'}
      </button>
    </form>
  );
};

export default UserForm;
