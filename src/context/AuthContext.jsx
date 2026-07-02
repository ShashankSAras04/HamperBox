import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';

const AuthContext = createContext();

const IS_MOCK_MODE = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    if (IS_MOCK_MODE) {
      // Simulate fetch from localStorage session
      const savedSession = localStorage.getItem('hb_session_user');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.is_admin) {
          setUser(parsed);
        } else {
          localStorage.removeItem('hb_session_user');
        }
      }
      setLoading(false);
      return;
    }

    // Production Supabase Auth state handler
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          const profile = await api.getUserProfile(session.user.id);
          const resolvedUser = profile || {
            user_id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || '',
            phone_number: session.user.phone || '',
            is_admin: false
          };

          if (!resolvedUser.is_admin) {
            // Force sign out non-admins immediately
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
          } else {
            setUser(resolvedUser);
          }
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await api.getUserProfile(session.user.id);
        const resolvedUser = profile || {
          user_id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || '',
          phone_number: session.user.phone || '',
          is_admin: false
        };

        if (!resolvedUser.is_admin) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
        } else {
          setUser(resolvedUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (IS_MOCK_MODE) {
        const users = JSON.parse(localStorage.getItem('hb_users') || '[]');
        let matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!matchedUser) {
          // If trying default admin login but doesn't exist, create it
          if (email === 'admin@hamperbox.com' && password === 'admin123') {
            matchedUser = {
              user_id: 'd0000000-0000-0000-0000-000000000001',
              email: 'admin@hamperbox.com',
              full_name: 'Jane Admin',
              phone_number: '+91 9999999999',
              is_admin: true,
              created_at: new Date().toISOString()
            };
            users.push(matchedUser);
            localStorage.setItem('hb_users', JSON.stringify(users));
          }
        }

        if (matchedUser) {
          if (!matchedUser.is_admin) {
            throw new Error('Access denied. Only administrators are allowed to log in.');
          }
          if (password === 'admin123' || password === 'password123' || password === 'Shashank@9620') {
            setUser(matchedUser);
            localStorage.setItem('hb_session_user', JSON.stringify(matchedUser));
            return matchedUser;
          }
        }
        throw new Error('Invalid email or password.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const profile = await api.getUserProfile(data.user.id);
        const resolvedUser = profile || {
          user_id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || '',
          phone_number: data.user.phone || '',
          is_admin: false
        };

        if (!resolvedUser.is_admin) {
          await supabase.auth.signOut();
          throw new Error('Access denied. Only administrators are allowed to log in.');
        }

        setUser(resolvedUser);
        return resolvedUser;
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, fullName, phone) => {
    // Standard public sign up is restricted to prevent creating non-admin accounts
    throw new Error('Public registration is currently disabled. Please contact the system administrator.');
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (IS_MOCK_MODE) {
        localStorage.removeItem('hb_session_user');
        setUser(null);
      } else {
        await supabase.auth.signOut();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (fullName, phone) => {
    if (!user) throw new Error('Not logged in');
    const updated = await api.updateUserProfile(user.user_id, {
      full_name: fullName,
      phone_number: phone
    });
    setUser(prev => ({ ...prev, ...updated }));
    if (IS_MOCK_MODE) {
      localStorage.setItem('hb_session_user', JSON.stringify({ ...user, ...updated }));
    }
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
