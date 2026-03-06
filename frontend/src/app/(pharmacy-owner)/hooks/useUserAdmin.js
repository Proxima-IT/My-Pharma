'use client';
import { useState, useCallback } from 'react';
import { userAdminApi } from '../api/userAdminApi';

export const useUserAdmin = () => {
  const [users, setUsers] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const data = await userAdminApi.getUsers(token, params);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return { users, loading, error, fetchUsers, deleteUser };
};
