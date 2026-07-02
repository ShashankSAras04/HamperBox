import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, KeyRound, Loader2, Save, Trash2, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { SEO } from '../../components/seo/SEO';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, login, signup, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || null;

  // Form States
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Authenticated State forms
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.full_name || '');
      setEditPhone(user.phone_number || '');
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);
    try {
      const data = await api.getAddresses(user.user_id);
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and Password are required');
      return;
    }
    if (isRegister && !fullName) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await signup(email, password, fullName, phoneNumber);
        toast.success('Registration successful! Welcome to HamperBox.');
      } else {
        await login(email, password);
        toast.success('Signed in successfully!');
      }
      
      if (redirectTo) {
        navigate(`/${redirectTo}`);
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    setUpdatingProfile(true);
    try {
      await updateProfile(editName, editPhone);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      await api.deleteAddress(addrId);
      toast.success('Address removed.');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to delete address.');
    }
  };

  // Autofill helpers for mock testing
  const autofillMock = (role) => {
    if (role === 'admin') {
      setEmail('admin@hamperbox.com');
      setPassword('admin123');
    } else {
      setEmail('customer1@gmail.com');
      setPassword('customer123');
    }
    setIsRegister(false);
    toast.success(`Autofilled ${role} credentials! Click Sign In.`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-16 transition-colors duration-300">
      <SEO title={user ? "My Profile Dashboard" : "Sign In to HamperBox"} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* UNAUTHENTICATED FLOW: LOGIN / REGISTER */}
        {!user && !authLoading && (
          <div className="max-w-md mx-auto space-y-8">
            
            {/* Logo Heading */}
            <div className="text-center space-y-2">
              <span className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white font-bold items-center justify-center text-xl shadow-md">
                H
              </span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white mt-4">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRegister ? 'Join HamperBox for curated gifting boxes' : 'Sign in to access your profile and track orders'}
              </p>
            </div>

            {/* Main Auth Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-3xl shadow-xl space-y-6 glass">
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {isRegister && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white"
                          placeholder="Your Name"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone (Optional)</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white"
                          placeholder="+91..."
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/10 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-6"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
                </button>
              </form>

              {/* Toggles */}
              <div className="text-center pt-2">
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Developer Helper Panel */}
              <div className="bg-slate-100/50 dark:bg-slate-950/40 border border-slate-250/20 dark:border-slate-850 p-4 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-350">
                  <Terminal className="w-4 h-4 text-secondary" />
                  <span>Sandbox Testing Credentials</span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Use these shortcuts to sign in with mock data. These accounts bypass live DB checks if Supabase is unconfigured.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => autofillMock('customer')}
                    className="py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:border-primary transition-all cursor-pointer"
                  >
                    Load Customer (Rahul)
                  </button>
                  <button
                    onClick={() => autofillMock('admin')}
                    className="py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:border-secondary transition-all cursor-pointer"
                  >
                    Load Administrator (Jane)
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* AUTHENTICATED FLOW: USER SETTINGS & ADDRESSES */}
        {user && (
          <div className="space-y-10">
            
            {/* Header info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center text-primary text-xl font-bold font-serif">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-850 dark:text-white font-serif">{user.full_name}</h2>
                  <p className="text-xs text-slate-450">{user.email}</p>
                </div>
              </div>
              
              <div className="flex space-x-3 items-center">
                {user.is_admin && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 text-primary border border-primary/20 text-xs font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Administrator</span>
                  </span>
                )}
                {!user.is_admin && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-500 text-xs font-bold">
                    Customer Account
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Profile details edit form */}
              <form onSubmit={handleUpdateProfile} className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm space-y-5">
                <h3 className="text-base font-bold text-slate-800 dark:text-white font-serif flex items-center space-x-2">
                  <User className="w-4.5 h-4.5 text-primary" />
                  <span>Profile Information</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email (Not editable)</label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                    disabled
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-primary dark:bg-slate-800 dark:hover:bg-primary transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {updatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Profile</span>
                </button>
              </form>

              {/* Saved addresses book */}
              <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-800 dark:text-white font-serif flex items-center space-x-2">
                  <MapPin className="w-4.5 h-4.5 text-primary" />
                  <span>Saved Recipient Addresses</span>
                </h3>

                {loadingAddresses ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.address_id}
                        className="p-4 bg-slate-55/40 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 rounded-2xl flex justify-between items-start"
                      >
                        <div className="text-xs text-slate-650 dark:text-slate-400 space-y-1">
                          <p className="font-bold text-slate-850 dark:text-white">{addr.recipient_name}</p>
                          <p>{addr.address_line1}</p>
                          {addr.address_line2 && <p>{addr.address_line2}</p>}
                          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-[10px] text-slate-450 pt-0.5">Phone: {addr.phone_number}</p>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteAddress(addr.address_id)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-450 text-xs">
                    No saved addresses yet. Recipient locations are saved automatically when checking out.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
