'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          setError(error.message);
          setUserRole('driver');
        } else {
          setUserRole(data?.role || 'driver');
        }
      } catch (err) {
        setError(err.message);
        setUserRole('driver');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return { userRole, loading, error };
};