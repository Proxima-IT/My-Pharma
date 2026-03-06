'use client';
import { useState, useCallback } from 'react';
import { userAdminApi } from '../api/userAdminApi';

export const useUserAdmin = () => {
  const [users, setUsers] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all users with search and pagination
  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await userAdminApi.getUsers(token, params);
      setUsers(data);
    } catch (err) {
      setError(err.message);
      // Fallback for Demo/Mock if backend is not ready
      console.warn('API Error, using mock data for demo.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a user
  const deleteUser = async id => {
    try {
      const token = localStorage.getItem('access_token');
      await userAdminApi.deleteUser(token, id);
      setUsers(prev => ({
        ...prev,
        results: prev.results.filter(u => u.id !== id),
        count: prev.count - 1,
      }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Create a new user
  const createUser = async data => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await userAdminApi.createUser(token, data);
      return true;
    } catch (err) {
      setError(err?.detail || 'Failed to create user');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update existing user
  const updateUser = async (id, data) => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      await userAdminApi.updateUser(token, id, data);
      return true;
    } catch (err) {
      setError(err?.detail || 'Failed to update user');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    users,
    loading,
    isUpdating,
    error,
    fetchUsers,
    deleteUser,
    createUser,
    updateUser,
  };
};
