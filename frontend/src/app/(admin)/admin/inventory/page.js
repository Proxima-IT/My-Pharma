'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  FiPackage,
  FiAlertTriangle,
  FiTrendingUp,
  FiRefreshCw,
  FiSearch,
  FiEdit3,
  FiCheck,
  FiShoppingBag,
  FiClock,
  FiDollarSign,
} from 'react-icons/fi';
import { useInventoryAdmin } from '../../hooks/useInventoryAdmin';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { formatCurrency } from '@/app/(user)/lib/formatters';

export default function InventoryManagementPage() {
  const {
    inventory,
    loading: invLoading,
    stats: invStats,
    fetchInventory,
    updateStockLevel,
  } = useInventoryAdmin();
  const { orders, fetchOrders, loading: ordLoading } = useAdminOrders();

  const [search, setSearch] = useState('');
  const [editingSlug, setEditingSlug] = useState(null);
  const [tempQty, setTempQty] = useState('');

  useEffect(() => {
    fetchInventory({ search });
    fetchOrders({ page: 1 });
  }, [search, fetchInventory, fetchOrders]);

  // Logic: Calculate Revenue from Delivered Orders in the current batch
  const deliveredRevenue = useMemo(() => {
    if (!orders.results) return 0;
    return orders.results
      .filter(order => order.status?.toUpperCase() === 'DELIVERED')
      .reduce((acc, order) => acc + Math.abs(parseFloat(order.total || 0)), 0);
  }, [orders.results]);

  const handleInlineEdit = item => {
    setEditingSlug(item.slug);
    setTempQty(item.quantity_in_stock);
  };

  const handleSave = async slug => {
    const success = await updateStockLevel(slug, tempQty);
    if (success) setEditingSlug(null);
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1B1B1B] tracking-tight uppercase leading-none">
            System Logistics
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-3 font-medium">
            Real-time monitoring of global stock levels and order fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E8F0EA] border border-[#3A5A40]/20 text-[#3A5A40] font-mono text-[10px] font-bold uppercase tracking-widest">
          <div className="w-1.5 h-1.5 bg-[#3A5A40] animate-pulse" />
          Live_Logistics_Sync
        </div>
      </div>

      {/* 2. Operational Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="TOTAL SKUS"
          value={invStats.totalItems}
          icon={<FiPackage />}
          color="text-blue-600"
        />
        <StatCard
          label="OUT OF STOCK"
          value={invStats.outOfStock}
          icon={<FiAlertTriangle />}
          color="text-red-600"
        />
        <StatCard
          label="LOW STOCK"
          value={invStats.lowStock}
          icon={<FiTrendingUp />}
          color="text-amber-500"
        />

        <StatCard
          label="TOTAL ORDERS"
          value={orders.count || 0}
          icon={<FiShoppingBag />}
          color="text-indigo-600"
        />
        <StatCard
          label="PENDING"
          value={
            orders.results?.filter(o => o.status === 'PENDING').length || 0
          }
          icon={<FiClock />}
          color="text-purple-600"
        />
        <StatCard
          label="NET REVENUE"
          value={formatCurrency(deliveredRevenue)}
          icon={<FiDollarSign />}
          color="text-[#3A5A40]"
        />
      </div>

      {/* 3. Search Bar */}
      <div className="max-w-md bg-white border border-gray-100 p-1">
        <div className="relative">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A78]"
            size={16}
          />
          <input
            type="text"
            placeholder="SEARCH INVENTORY RECORDS..."
            className="w-full h-10 pl-10 pr-4 bg-transparent rounded-none text-sm font-mono focus:outline-none uppercase tracking-tight placeholder:text-gray-300 text-[#1B1B1B]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Master Inventory Table */}
      <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1B1B1B] text-[11px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  System ID
                </th>
                <th className="px-8 py-4 text-left border-r border-gray-100">
                  Medicine Details
                </th>
                <th className="px-8 py-4 text-center border-r border-gray-100">
                  Current Stock
                </th>
                <th className="px-8 py-4 text-center border-r border-gray-100">
                  Min. Level
                </th>
                <th className="px-8 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invLoading && inventory.results.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-20 text-center font-mono text-sm animate-pulse text-[#3A5A40]"
                  >
                    SYNCING_LIVE_INVENTORY...
                  </td>
                </tr>
              ) : (
                inventory.results.map(item => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-8 py-6 border-r border-gray-100 font-mono text-xs font-bold text-[#8A8A78]">
                      #{item.id}
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1B1B1B] text-sm uppercase tracking-tight">
                          {item.name}
                        </span>
                        <span className="font-mono text-[10px] text-[#8A8A78] uppercase">
                          {item.brand_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 text-center">
                      {editingSlug === item.slug ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            autoFocus
                            type="number"
                            className="w-20 h-10 border border-[#3A5A40] text-center font-mono font-bold bg-white outline-none"
                            value={tempQty}
                            onChange={e => setTempQty(e.target.value)}
                            onKeyDown={e =>
                              e.key === 'Enter' && handleSave(item.slug)
                            }
                          />
                          <button
                            onClick={() => handleSave(item.slug)}
                            className="p-2 bg-[#3A5A40] text-white hover:bg-[#F59E0B] transition-colors cursor-pointer"
                          >
                            <FiCheck size={16} />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-center gap-3 cursor-pointer hover:text-[#3A5A40] transition-colors"
                          onClick={() => handleInlineEdit(item)}
                        >
                          <span className="font-mono text-xl font-bold text-[#1B1B1B]">
                            {item.quantity_in_stock}
                          </span>
                          <FiEdit3 className="text-[#8A8A78] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 border-r border-gray-100 text-center font-mono text-sm font-bold text-[#8A8A78]">
                      {item.low_stock_threshold}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`px-3 py-1 border font-mono text-[10px] font-bold uppercase tracking-tighter ${
                          item.quantity_in_stock <= 0
                            ? 'text-red-600 bg-red-50 border-red-100'
                            : item.is_low_stock
                              ? 'text-amber-600 bg-amber-50 border-amber-100'
                              : 'text-green-600 bg-green-50 border-green-100'
                        }`}
                      >
                        {item.quantity_in_stock <= 0
                          ? 'CRITICAL'
                          : item.is_low_stock
                            ? 'LOW'
                            : 'HEALTHY'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white border border-gray-100 p-5 flex flex-col gap-4 hover:border-[#3A5A40] transition-all duration-200 group rounded-none">
    <div className="flex justify-between items-start">
      <div className={`text-lg ${color} p-2 bg-gray-50`}>{icon}</div>
    </div>
    <div>
      <p className="text-[9px] font-bold text-[#8A8A78] uppercase tracking-[0.15em]">
        {label}
      </p>
      <h3 className="text-xl font-bold text-[#1B1B1B] mt-1 font-mono tracking-tighter">
        {value}
      </h3>
    </div>
  </div>
);
