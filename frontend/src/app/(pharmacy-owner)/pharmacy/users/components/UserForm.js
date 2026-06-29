'use client';
import React, { useState, useEffect } from 'react';
import { isValidBDPhone } from '@/app/(shared)/lib/validation';

const UserForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'REGISTERED_USER',
    is_active: true,
  });
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role || 'REGISTERED_USER',
        is_active: initialData.is_active ?? true,
        password: '', // Don't populate password on edit
      });
    }
  }, [initialData]);

  const labelClass =
    'font-mono text-[11px] font-bold text-(--color-text-secondary) uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border border-(--color-admin-border) rounded-none text-sm font-mono focus:outline-none focus:border-(--color-admin-accent) transition-all uppercase';

  const handleSubmit = e => {
    e.preventDefault();
    if (formData.phone && !isValidBDPhone(formData.phone)) {
      setPhoneError('Please enter a valid Bangladeshi phone number.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={labelClass}>FULL NAME / USERNAME</label>
          <input
            type="text"
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
            className={`${inputClass} ${phoneError ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.phone}
            onChange={e => {
              setFormData({ ...formData, phone: e.target.value });
              if (phoneError) setPhoneError('');
            }}
          />
          {phoneError && (
            <p className="text-[11px] font-bold text-red-500 mt-1.5 font-mono uppercase tracking-wider">
              {phoneError}
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>
            {initialData
              ? 'NEW PASSWORD (LEAVE BLANK TO KEEP OLD)'
              : 'PASSWORD'}
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
            className={inputClass}
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="REGISTERED_USER">NORMAL CUSTOMER</option>
            <option value="PHARMACY_ADMIN">PHARMACY OWNER</option>
            <option value="DOCTOR">DOCTOR</option>
            <option value="SUPER_ADMIN">SYSTEM ADMIN</option>
          </select>
        </div>
        <div className="flex items-center justify-between p-4 bg-white border border-(--color-admin-border)">
          <span className={labelClass + ' mb-0'}>ACCOUNT ACTIVE?</span>
          <input
            type="checkbox"
            className="w-6 h-6 accent-(--color-admin-primary)"
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
        className="w-full h-16 bg-(--color-admin-primary) text-white font-black uppercase tracking-[0.3em] hover:bg-(--color-admin-accent) transition-all border border-(--color-admin-border)"
      >
        {isLoading
          ? 'SAVING...'
          : initialData
            ? 'UPDATE ACCOUNT'
            : 'CREATE ACCOUNT'}
      </button>
    </form>
  );
};

export default UserForm;
