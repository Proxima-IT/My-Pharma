'use client';

import React from 'react';
import { FiPackage } from 'react-icons/fi';
import { useBundleData } from '../../hooks/useBundleData';
import BundleCard from '../home/components/BundleCard';

const CombosPage = () => {
  const { bundles, loading } = useBundleData();

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="w-full min-w-0">
        <div className="mb-8 rounded-[32px] bg-white border border-gray-100 py-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-(--color-primary-25) text-(--color-primary-500) flex items-center justify-center shrink-0">
              <FiPackage size={20} />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-gray-900 tracking-tight">
                All Health Combos
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {bundles.length} curated bundle{bundles.length === 1 ? '' : 's'}{' '}
                available for better value and easier checkout.
              </p>
            </div>
          </div>
        </div>

        {bundles.length === 0 ? (
          <div className="w-full py-20 text-center bg-white rounded-[40px] border border-gray-100">
            <p className="text-gray-400 font-medium text-lg">
              No combos are available right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bundles.map(bundle => (
              <div key={bundle.id} className="w-full">
                <BundleCard bundle={bundle} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CombosPage;
