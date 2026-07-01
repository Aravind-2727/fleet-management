'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Pure helper: query profile, validate role, return data or throw
  const loadProfile = useCallback(async (userId) => {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('id, role, name, phone, email, fleet_owner_id, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!profileData) throw new Error('Profile not found');

    const validRoles = ['owner', 'driver'];
    if (!validRoles.includes(profileData.role)) {
      throw new Error('Invalid role');
    }

    return profileData;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        const session = data?.session;
        const currentUser = session?.user;

        if (currentUser && mounted) {
          setUser(currentUser);
          try {
            const profileData = await loadProfile(currentUser.id);
            if (mounted) {
              setProfile(profileData);
              setRole(profileData.role);
            }
          } catch {
            if (mounted) {
              setUser(null);
              setProfile(null);
              setRole(null);
            }
          }
        } else if (mounted) {
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          // loadProfile is called by login() — skip duplicate
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router, loadProfile]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        setUser(data.user);
        try {
          const profileData = await loadProfile(data.user.id);
          setProfile(profileData);
          setRole(profileData.role);

          if (profileData.role === 'driver') {
            router.push('/driver/home');
          } else {
            router.push('/dashboard');
          }
        } catch {
          setUser(null);
          setProfile(null);
          setRole(null);
          router.push('/');
          throw new Error('Access not found. Please sign up first.');
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

  const signup = async (email, password, name) => {
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
              role: 'owner',
              name: name,
              phone: '',
              fleet_owner_id: null,
            },
          ]);

        if (profileError) throw profileError;

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
        redirectTo: `${window.location.origin}/update-password`,
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
      setProfile(null);
      setRole(null);
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
    if (!role) return false;
    
    if (requiredRole === 'owner') {
      return role === 'owner';
    }
    
    if (requiredRole === 'driver') {
      return role === 'driver';
    }
    
    if (requiredRole === 'any') {
      return role === 'owner' || role === 'driver';
    }
    
    return false;
  };

  const value = {
    user,
    profile,
    role,
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