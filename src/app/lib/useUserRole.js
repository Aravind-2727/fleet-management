'use client';

import { useAuth } from './AuthContext';

export const useUserRole = () => {
  const { userRole, loading, error } = useAuth();
  
  return { userRole, loading, error };
};