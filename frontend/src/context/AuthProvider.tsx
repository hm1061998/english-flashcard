import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { apiService } from '@/services/api';
import { setUser, logout, finishLoading } from '@/features/auth/authSlice';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        dispatch(finishLoading());
        return;
      }

      try {
        const user = await apiService.get('/auth/profile');
        dispatch(setUser(user));
      } catch (err) {
        console.error('Session expired or invalid token', err);
        dispatch(logout());
      } finally {
        dispatch(finishLoading());
      }
    };

    checkAuth();
  }, [dispatch, token]);

  return <>{children}</>;
};
