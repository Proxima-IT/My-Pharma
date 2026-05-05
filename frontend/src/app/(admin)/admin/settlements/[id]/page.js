'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  FiChevronLeft,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
  FiHash,
  FiFileText,
  FiArrowRight,
  FiAlertCircle,
} from 'react-icons/fi';
import { useSettlementAdmin } from '../../../hooks/useSettlementAdmin';
import AuthGuard from '@/app/(shared)/components/AuthGuard';
import { settlementAdminApi } from '../../../api/settlementAdminApi';

/**
 * Super Admin Settlement Detail View
 * Refined "Sharp" industrial design with corrected AuthGuard roles and import.
 */
export default function SettlementDetailPage({ params }) {
  const { id } = use(params);
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <SettlementDetailContent id={id} />
    </AuthGuard>
  );
}

function SettlementDetailContent({ id }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('access_token'));
    }
  }, []);

  const { recordDeposit, recordPayout, recordRefund, actionLoading } =
    useSettlementAdmin(token);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form States for refs
  const [cashRef, setCashRef] = useState('');
  const [payoutRef, setPayoutRef] = useState('');

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await settlementAdminApi.getSettlementById(token, id);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, id]);

  const handleDeposit = async () => {
    if (!cashRef) return alert('REFERENCE REQUIRED');
    try {
      await recordDeposit(id, {
        cash_deposit_reference: cashRef,
        cash_deposited_at: new Date().toISOString(),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayout = async () => {
    if (!payoutRef) return alert('TRANSACTION ID REQUIRED');
    try {
      await recordPayout(id, {
        payout_reference: payoutRef,
        settled_at: new Date().toISOString(),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="font-mono text-sm font-bold animate-pulse text-[#3A5A40] uppercase tracking-widest">
          Syncing Transaction Data #{id}...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 border border-red-100 bg-red-50 text-red-600 font-bold uppercase text-xs">
        Error: {error}
      </div>
    );

  if (!data) return null;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header section with Breadcrumb */}
      <div className="space-y-4 border-b border-gray-100 pb-6">
        <Link
          href="/admin/settlements"
          className="flex items-center gap-2 text-[#8A8A78] hover:text-[#1B1B1B] transition-colors group"
        >
          <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest">
            Return to Ledger
          </span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tighter uppercase">
              TRANSACTION ID: #{data.id}
            </h1>
            <p className="text-[13px] text-[#6B6B5E] mt-1 font-medium flex items-center gap-2">
              <FiHash /> Linked Order Reference:{' '}
              <span className="font-bold text-black uppercase">
                #{data.order}
              </span>
            </p>
          </div>
          <div
            className={`px-6 py-2 border font-mono text-xs font-bold uppercase tracking-widest ${
              data.status === 'SETTLED'
                ? 'border-green-600 text-green-600 bg-green-50'
                : 'border-black text-black bg-gray-50'
            }`}
          >
            Status: {data.status.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Financial Breakdown Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-[#8A8A78]">
              <FiDollarSign /> Financial Integrity Report
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-gray-100">
              <div className="p-6 border-r border-b border-gray-100">
                <p className="text-[10px] font-bold text-[#DAD7CD] uppercase tracking-widest mb-2">
                  Gross Order Value
                </p>
                <p className="text-xl font-mono font-bold text-[#1B1B1B]">
                  {data.gross_amount}
                </p>
              </div>
              <div className="p-6 border-r border-b border-gray-100">
                <p className="text-[10px] font-bold text-[#DAD7CD] uppercase tracking-widest mb-2">
                  Commission ({data.commission_rate}%)
                </p>
                <p className="text-xl font-mono font-bold text-red-500">
                  -{data.commission_amount}
                </p>
              </div>
              <div className="p-6 border-r border-b border-gray-100 bg-[#3A5A40]/5">
                <p className="text-[10px] font-bold text-[#3A5A40] uppercase tracking-widest mb-2">
                  Net Pharmacy Payable
                </p>
                <p className="text-2xl font-mono font-black text-[#3A5A40]">
                  {data.net_payable}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-8 border-t border-gray-50 pt-8">
              <div>
                <h4 className="text-[11px] font-bold uppercase text-[#8A8A78] mb-4">
                  Payment Context
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-400 uppercase">
                      Method:
                    </span>
                    <span className="font-bold text-[#1B1B1B]">
                      {data.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-400 uppercase">
                      Payment Status:
                    </span>
                    <span className="font-bold text-[#1B1B1B]">
                      {data.payment_status}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase text-[#8A8A78] mb-4">
                  Time Logs
                </h4>
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400 uppercase">
                      Order Generated:
                    </span>
                    <span className="text-[#1B1B1B] font-bold">
                      {new Date(data.order_created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 uppercase">
                      Last Registry Update:
                    </span>
                    <span className="text-[#1B1B1B] font-bold">
                      {new Date(data.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-[#8A8A78]">
              <FiFileText /> Settlement Audit History
            </h3>
            <div className="space-y-0 border border-gray-100">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <FiCheckCircle
                    className={
                      data.cash_deposited_at
                        ? 'text-green-500'
                        : 'text-gray-300'
                    }
                  />
                  <span className="text-[11px] font-bold uppercase tracking-tight">
                    Cash Deposit Verification
                  </span>
                </div>
                <span className="font-mono text-[10px] text-gray-500">
                  {data.cash_deposited_at || 'NOT VERIFIED'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white">
                <div className="flex items-center gap-3">
                  <FiCheckCircle
                    className={
                      data.settled_at ? 'text-green-500' : 'text-gray-300'
                    }
                  />
                  <span className="text-[11px] font-bold uppercase tracking-tight">
                    Pharmacy Payout Finalization
                  </span>
                </div>
                <span className="font-mono text-[10px] text-gray-500">
                  {data.settled_at || 'NOT SETTLED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          {/* Action: COD Verification */}
          {data.payment_method === 'COD' && data.status === 'PENDING' && (
            <div className="border-2 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2 mb-4">
                <FiClock className="text-[#F59E0B]" />
                <h4 className="text-xs font-black uppercase tracking-widest">
                  Verify Cash Deposit
                </h4>
              </div>
              <p className="text-[11px] text-[#6B6B5E] mb-6 font-medium leading-relaxed">
                {' '}
                Confirm reception of physical currency from the courier/pharmacy
                agent.{' '}
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="DEPOSIT REF NUMBER"
                  className="w-full h-11 px-4 border border-gray-200 text-[11px] font-mono uppercase tracking-tight outline-none focus:border-black rounded-none"
                  value={cashRef}
                  onChange={e => setCashRef(e.target.value)}
                />
                <button
                  onClick={handleDeposit}
                  disabled={actionLoading}
                  className="w-full bg-black text-white h-12 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#3A5A40] transition-all disabled:opacity-20 cursor-pointer"
                >
                  Confirm Registry Entry
                </button>
              </div>
            </div>
          )}

          {/* Action: Payout Disbursement */}
          {((data.payment_method === 'ONLINE' && data.status === 'PENDING') ||
            data.status === 'CASH_DEPOSITED') && (
            <div className="border-2 border-[#3A5A40] p-6 bg-white shadow-[8px_8px_0px_0px_rgba(58,90,64,0.05)]">
              <div className="flex items-center gap-2 mb-4">
                <FiDollarSign className="text-[#3A5A40]" />
                <h4 className="text-xs font-black uppercase tracking-widest text-[#3A5A40]">
                  Disburse Payout
                </h4>
              </div>
              <p className="text-[11px] text-[#6B6B5E] mb-6 font-medium leading-relaxed">
                {' '}
                Finalize the bank transfer or digital payout. Record the
                Transaction ID below.{' '}
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="PAYOUT TRANSACTION ID"
                  className="w-full h-11 px-4 border border-gray-200 text-[11px] font-mono uppercase tracking-tight outline-none focus:border-[#3A5A40] rounded-none"
                  value={payoutRef}
                  onChange={e => setPayoutRef(e.target.value)}
                />
                <button
                  onClick={handlePayout}
                  disabled={actionLoading}
                  className="w-full bg-[#3A5A40] text-white h-12 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-20 cursor-pointer"
                >
                  Release Funds
                </button>
              </div>
            </div>
          )}

          {/* Context Card */}
          <div className="bg-gray-50 border border-gray-100 p-6 font-mono text-[10px] text-[#8A8A78] space-y-2">
            <p className="font-bold text-black uppercase mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
              <FiAlertCircle /> Registry Notes
            </p>
            <p>DEP ID: {data.cash_deposit_reference || 'NULL'}</p>
            <p>PAY ID: {data.payout_reference || 'NULL'}</p>
            <p className="mt-4 pt-4 border-t border-gray-200 italic leading-loose">
              Settlements are terminal once state is [SETTLED]. Ensure all
              transaction references are verified before release.
            </p>
          </div>

          {/* Terminal Action */}
          {data.status !== 'SETTLED' && data.status !== 'REFUNDED' && (
            <button
              onClick={() => {
                if (confirm('INITIATE REFUND: PROCEED?'))
                  recordRefund(id, { status: 'REFUNDED' }).then(fetchData);
              }}
              className="w-full border border-red-100 text-red-600 text-[10px] font-bold py-4 uppercase tracking-[0.2em] hover:bg-red-50 transition-colors cursor-pointer"
            >
              Force Refund / Void
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
