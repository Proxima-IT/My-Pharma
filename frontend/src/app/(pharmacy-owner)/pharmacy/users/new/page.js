'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import UserForm from '../components/UserForm';
import { userAdminApi } from '../../../api/userAdminApi';

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async data => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await userAdminApi.createUser(token, data);
      router.push('/pharmacy/users');
    } catch (err) {
      alert('Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8 bg-(--color-admin-bg)">
      <div className="flex items-center gap-6 border-b-4 border-(--color-admin-border) pb-6">
        <button
          onClick={() => router.back()}
          className="p-2 bg-(--color-admin-navy) text-white hover:bg-(--color-admin-accent) border border-(--color-admin-border) cursor-pointer"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
          Create New Account
        </h1>
      </div>
      <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-8 md:p-12">
        <UserForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}
