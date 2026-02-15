'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiCreditCard,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiInfo,
} from 'react-icons/fi';
import { formatCurrency } from '../../lib/formatters';

export default function TransactionHistoryPage() {
  // Mock Data for UI Testing
  const [transactions] = useState([
    {
      id: 'TRX-7721092',
      date: '2023-10-12T10:30:00Z',
      type: 'PAYMENT',
      method: 'bKash',
      amount: 1240.0,
      status: 'SUCCESSFUL',
      orderId: '#MP-98231',
    },
    {
      id: 'TRX-7721085',
      date: '2023-10-10T14:20:00Z',
      type: 'REFUND',
      method: 'Bank Transfer',
      amount: 550.0,
      status: 'SUCCESSFUL',
      orderId: '#MP-98210',
    },
    {
      id: 'TRX-7721044',
      date: '2023-10-05T09:15:00Z',
      type: 'PAYMENT',
      method: 'Visa Card',
      amount: 2100.0,
      status: 'FAILED',
      orderId: '#MP-98199',
    },
  ]);

  const getStatusStyles = status => {
    switch (status) {
      case 'SUCCESSFUL':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Mobile Sub-Page Header */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link
          href="/user"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Transaction History
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-normal">
          Detailed record of your payments and refunds.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <FiCreditCard size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
              Total Spent
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(3340.0)}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
            <FiArrowDownLeft size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
              Total Refunded
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(550.0)}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {transactions.map(trx => (
          <div
            key={trx.id}
            className="group bg-white rounded-2xl p-4 md:p-5 border border-gray-200 shadow-sm flex items-center justify-between gap-4 transition-all hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Type Icon */}
              <div
                className={`w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-xl flex items-center justify-center text-lg ${
                  trx.type === 'PAYMENT'
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-green-100 text-green-600'
                }`}
              >
                {trx.type === 'PAYMENT' ? (
                  <FiArrowUpRight />
                ) : (
                  <FiArrowDownLeft />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                    {trx.type === 'PAYMENT'
                      ? 'Order Payment'
                      : 'Refund Received'}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${getStatusStyles(
                      trx.status,
                    )}`}
                  >
                    {trx.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium truncate">
                  {trx.id} • {trx.method}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p
                className={`text-sm md:text-base font-bold ${
                  trx.type === 'PAYMENT' ? 'text-gray-900' : 'text-green-700'
                }`}
              >
                {trx.type === 'PAYMENT' ? '-' : '+'}
                {formatCurrency(trx.amount)}
              </p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {new Date(trx.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Info Note */}
      <div className="flex items-center justify-center gap-2 text-gray-500 pt-8">
        <FiInfo className="text-sm" />
        <p className="text-xs font-semibold uppercase tracking-wider">
          Transaction history is updated every 24 hours
        </p>
      </div>
    </div>
  );
}
