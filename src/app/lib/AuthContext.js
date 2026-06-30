'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? match[1] : null;
  };

  const setCookie = (name, value) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${value}; path=/; max-age=604800; SameSite=Lax`;
  };

  const clearCookie = (name) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  };

  const verifyOwnerAccess = async (userId) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    return !!profile;
  };

  const verifyDriverAccess = async (userId) => {
    const { data: driver } = await supabase
      .from('drivers')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();
    return !!driver;
  };

  const resolveUserRole = async (userId) => {
    const storedRole = getCookie('selected_role');
    if (storedRole === 'driver') {
      const isDriver = await verifyDriverAccess(userId);
      if (isDriver) return 'driver';
      clearCookie('selected_role');
    }
    const isOwner = await verifyOwnerAccess(userId);
    if (isOwner) {
      if (storedRole !== 'owner') setCookie('selected_role', 'owner');
      return 'owner';
    }
    return null;
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        const session = data?.session;
        const currentUser = session?.user;

        if (currentUser) {
          const role = await resolveUserRole(currentUser.id);
          setUserRole(role);
          setUser(currentUser);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        setError(err.message);
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const role = await resolveUserRole(session.user.id);
          setUserRole(role);
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserRole(null);
          clearCookie('selected_role');
          router.push('/');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email, password, selectedRole) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        if (selectedRole === 'driver') {
          const isDriver = await verifyDriverAccess(data.user.id);
          if (!isDriver) {
            throw new Error('Driver access not found.');
          }
          setCookie('selected_role', 'driver');
          setUserRole('driver');
          setUser(data.user);
          router.push('/driver/home');
        } else {
          const isOwner = await verifyOwnerAccess(data.user.id);
          if (!isOwner) {
            throw new Error('Owner access not found.');
          }
          setCookie('selected_role', 'owner');
          setUserRole('owner');
          setUser(data.user);
          router.push('/dashboard');
        }
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name, role = 'owner') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              role: role,
              name: name,
              phone: '',
              fleet_owner_id: null,
            },
          ]);

        if (profileError) throw profileError;

        // After signup, clear any auto-session and redirect to login
        clearCookie('selected_role');
        try {
          await supabase.auth.signOut();
        } catch (_) {}
        router.push('/login?success=Account+created+successfully.+Please+login.');
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard`,
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserRole(null);
      clearCookie('selected_role');
      router.push('/');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isAuthorized = (requiredRole) => {
    if (!userRole) return false;
    
    if (requiredRole === 'owner') {
      return userRole === 'owner';
    }
    
    if (requiredRole === 'driver') {
      return userRole === 'driver';
    }
    
    if (requiredRole === 'any') {
      return userRole === 'owner' || userRole === 'driver';
    }
    
    return false;
  };

  const value = {
    user,
    userRole,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    isAuthenticated,
    isAuthorized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
