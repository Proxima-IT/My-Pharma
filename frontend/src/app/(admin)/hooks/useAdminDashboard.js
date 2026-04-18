'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

/**
 * Hook for fetching admin dashboard data
 */
export const useAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pharmacyPartners: 0,
    systemRevenue: 0,
    activeDoctors: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get access token
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch users data
      const usersRes = await fetch(`${API_BASE_URL}/auth/admin/users/`, {
        headers,
      });
      const usersData = await parseJsonResponse(usersRes, { results: [] });

      // Calculate stats from users data
      const users = usersData.results || [];
      const totalUsers = users.length;
      const pharmacyPartners = users.filter(
        user => user.role === 'PHARMACY_ADMIN',
      ).length;
      const activeDoctors = users.filter(user => user.role === 'DOCTOR').length;

      // Fetch orders for revenue calculation
      const ordersRes = await fetch(`${API_BASE_URL}/orders/?page_size=1000`, {
        headers,
      });
      const ordersData = await parseJsonResponse(ordersRes, { results: [] });
      const orders = ordersData.results || [];

      // Calculate total revenue from completed orders
      const systemRevenue = orders
        .filter(order => order.status === 'DELIVERED')
        .reduce((total, order) => total + (order.total_amount || 0), 0);

      // Generate recent activity from recent orders and users
      const recentOrders = orders.slice(0, 2).map(order => ({
        id: `order-${order.id}`,
        event: 'High Value Order',
        target: `ORD-${order.id} (৳ ${order.total_amount || 0})`,
        time: formatTimeAgo(new Date(order.created_at)),
        type: 'TRX',
      }));

      const recentUsers = users
        .slice(0, 2)
        .filter(user => user.role === 'PHARMACY_ADMIN')
        .map(user => ({
          id: `user-${user.id}`,
          event: 'New Pharmacy Registered',
          target: user.username || user.email || 'New Pharmacy',
          time: formatTimeAgo(new Date(user.date_joined || user.created_at)),
          type: 'REG',
        }));

      // Combine and sort recent activities
      const activities = [...recentOrders, ...recentUsers]
        .sort((a, b) => {
          // Simple sort - in real app, you'd sort by actual timestamp
          if (a.time.includes('min') && b.time.includes('hour')) return -1;
          if (b.time.includes('min') && a.time.includes('hour')) return 1;
          return 0;
        })
        .slice(0, 4);

      // Add some system activities if we don't have enough
      if (activities.length < 4) {
        activities.push({
          id: 'sys-update',
          event: 'System Update Deployed',
          target: 'v1.0.4-stable',
          time: '45 mins ago',
          type: 'SYS',
        });
      }

      setStats({
        totalUsers,
        pharmacyPartners,
        systemRevenue,
        activeDoctors,
      });

      setRecentActivity(activities.slice(0, 4));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);

      // Set fallback data
      setStats({
        totalUsers: 0,
        pharmacyPartners: 0,
        systemRevenue: 0,
        activeDoctors: 0,
      });
      setRecentActivity([
        {
          id: 1,
          event: 'System Update Deployed',
          target: 'v1.0.4-stable',
          time: '45 mins ago',
          type: 'SYS',
        },
        {
          id: 2,
          event: 'Dashboard Loading',
          target: 'Fetching live data...',
          time: 'now',
          type: 'SYS',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    recentActivity,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
};

// Helper function to format time ago
const formatTimeAgo = date => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};
