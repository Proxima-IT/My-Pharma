'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import UserForm from '../../components/UserForm';
import { useUserAdmin } from '../../../../hooks/useUserAdmin';
import { userAdminApi } from '../../../../api/userAdminApi';

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const { updateUser, isUpdating, error: updateError } = useUserAdmin();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const data = await userAdminApi.getUserDetails(token, id);
        setUser(data);
      } catch (err) {
        setFetchError('Could not find this user.');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadUser();
  }, [id]);

  const handleSubmit = async formData => {
    const success = await updateUser(id, formData);
    if (success) {
      router.push('/admin/users');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#3A5A40] border-t-transparent animate-spin" />
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#8A8A78]">
            Loading Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col items-start gap-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 bg-[#3A5A40] text-white px-6 py-3 hover:bg-[#F59E0B] transition-all cursor-pointer group border border-transparent"
        >
          <FiArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
            Go Back
          </span>
        </button>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Change Account Details
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Updating information for:{' '}
            <span className="text-[#3A5A40] font-bold">{user?.username}</span>
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 p-8 md:p-12">
        <div className="mb-10 border-b border-gray-50 pb-6">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Account Information
          </h2>
        </div>

        <UserForm
          initialData={user}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
        />

        {updateError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-[11px] font-bold uppercase text-center">
            Error: {updateError}
          </div>
        )}
      </div>

      <div className="font-mono text-[10px] text-[#B7B7A4] uppercase tracking-[0.2em]">
        User ID: {id}
      </div>
    </div>
  );
}
