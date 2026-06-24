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

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        const session = data?.session;
        const user = session?.user;
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, name, phone, fleet_owner_id')
            .eq('id', user.id)
            .maybeSingle();

         if (profile) {
  setUserRole(profile.role);
  setUser(user);
} else {
  setUser(user);
  setUserRole(null);
}
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
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, name, phone, fleet_owner_id')
            .eq('id', session.user.id)
            .maybeSingle();
if (profile) {
  setUserRole(profile.role);
  setUser(session.user);
} else {
  setUser(session.user);
  setUserRole(null);
}
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserRole(null);
          router.push('/');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
    if (data?.user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profile?.role === 'driver') {
    router.push('/driver/home');
  } else {
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
      
      if (error) {
        throw error;
      }
      
      // Create profile after successful signup
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

        if (profileError) {
          throw profileError;
        }
      }
      
      if (role === 'driver') {
  router.push('/driver/home');
} else {
  router.push('/dashboard');
}
      return data;
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
      if (error) {
        throw error;
      }
      // Clear local state immediately
      setUser(null);
      setUserRole(null);
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
    isAuthenticated,
    isAuthorized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};