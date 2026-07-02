import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Tag, Image as ImageIcon, Plus, Trash2, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Facebook = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const SettingsManage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'banners' | 'coupons'
  const [loading, setLoading] = useState(false);

  // 1. Site Settings state
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    instagram_url: '',
    facebook_url: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // 2. Banners state
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({
    image_url: '',
    layout_position: 'hero',
    link_url: ''
  });
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // 3. Coupons state
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    is_active: true
  });
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.is_admin) {
      toast.error('Access denied');
      navigate('/profile');
      return;
    }
    loadData();
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, bannersData, couponsData] = await Promise.all([
        api.getSiteSettings(),
        api.getBanners(),
        api.getCoupons()
      ]);
      setSettings(settingsData);
      setBanners(bannersData);
      setCoupons(couponsData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  // --- 1. Site Settings Handlers ---
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const saveSiteSettings = async (e) => {
    e.preventDefault();
    if (!settings.whatsapp_number.trim()) return toast.error('WhatsApp number is required');
    setSavingSettings(true);
    try {
      await api.updateSiteSettings(settings);
      toast.success('Site contact settings updated successfully!');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // --- 2. Banners Handlers ---
  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Banner file size exceeds 2MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewBanner(prev => ({ ...prev, image_url: event.target.result }));
      toast.success('Banner image loaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!newBanner.image_url) return toast.error('Please upload/specify banner image');
    setUploadingBanner(true);
    try {
      await api.createBanner(newBanner);
      toast.success('Banner added successfully!');
      setNewBanner({ image_url: '', layout_position: 'hero', link_url: '' });
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm('Delete this banner from layout?')) return;
    try {
      await api.deleteBanner(bannerId);
      toast.success('Banner removed');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete banner');
    }
  };

  // --- 3. Coupons Handlers ---
  const handleCouponChange = (e) => {
    const { name, value } = e.target;
    setCouponForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCouponStatusToggle = async (coupon) => {
    try {
      await api.updateCoupon(coupon.coupon_id, { is_active: !coupon.is_active });
      toast.success(`Coupon status updated successfully!`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return toast.error('Coupon code is required');
    if (!couponForm.discount_value || parseFloat(couponForm.discount_value) <= 0) return toast.error('Enter valid discount value');

    setSavingCoupon(true);
    try {
      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        is_active: couponForm.is_active
      };
      await api.createCoupon(payload);
      toast.success('Coupon code created!');
      setShowCouponModal(false);
      setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', is_active: true });
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Coupon code already exists or database error occurred');
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.deleteCoupon(couponId);
      toast.success('Coupon code deleted');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete coupon');
    }
  };

  if (authLoading || !user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-955">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif">Site & Shop Settings</h1>
            <p className="text-xs text-slate-500">Configure WhatsApp numbers, custom headers/banners, and coupon discount promo codes</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500">
            Advanced Control Panel
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="flex border-b border-slate-200 dark:border-slate-850 space-x-6">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Contact & Social
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'banners'
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Banners Layout
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'coupons'
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Promo Coupons
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-12 text-center text-slate-400 text-xs flex justify-center items-center space-x-2">
            <div className="w-4 h-4 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
            <span>Loading settings data...</span>
          </div>
        )}

        {/* TAB 1: Site Contact & Social Details */}
        {!loading && activeTab === 'settings' && (
          <form onSubmit={saveSiteSettings} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-3xl shadow-sm max-w-xl space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-wider">Contact & Social Links</h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>WhatsApp Contact Number</span>
                </label>
                <input
                  type="text"
                  name="whatsapp_number"
                  value={settings.whatsapp_number}
                  onChange={handleSettingsChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                  placeholder="+919620000000"
                />
                <p className="text-[9px] text-slate-400 italic">This number will receive customer WhatsApp messages and Payment Requests.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Instagram className="w-3.5 h-3.5 text-primary" />
                  <span>Instagram Profile URL</span>
                </label>
                <input
                  type="text"
                  name="instagram_url"
                  value={settings.instagram_url}
                  onChange={handleSettingsChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                  placeholder="https://instagram.com/your-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Facebook className="w-3.5 h-3.5 text-primary" />
                  <span>Facebook Profile URL</span>
                </label>
                <input
                  type="text"
                  name="facebook_url"
                  value={settings.facebook_url}
                  onChange={handleSettingsChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                  placeholder="https://facebook.com/your-brand"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-primary transition-all disabled:opacity-40 flex items-center space-x-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{savingSettings ? 'Saving Settings...' : 'Save Site Settings'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: Banners layout manager */}
        {!loading && activeTab === 'banners' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Banner Form */}
            <form onSubmit={handleCreateBanner} className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Plus className="w-4.5 h-4.5 text-primary" />
                <span>Create Layout Banner</span>
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Layout Position & Size</label>
                  <select
                    name="layout_position"
                    value={newBanner.layout_position}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, layout_position: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                  >
                    <option value="hero">Hero Slider (Fixed: 1920 x 800 px)</option>
                    <option value="promo">Promo Grid (Fixed: 1200 x 300 px)</option>
                    <option value="footer">Footer Banner (Fixed: 1920 x 400 px)</option>
                  </select>
                  <p className="text-[9px] text-slate-450 italic">Sizes are strictly locked by the layout engine template to ensure uniform display.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Link URL (Optional)</label>
                  <input
                    type="text"
                    value={newBanner.link_url}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, link_url: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    placeholder="/gifts?category=corporate"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Banner File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileChange}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                </div>

                {newBanner.image_url && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thumbnail Preview</label>
                    <div className="aspect-[21/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800">
                      <img src={newBanner.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploadingBanner || !newBanner.image_url}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-primary transition-all disabled:opacity-40 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{uploadingBanner ? 'Uploading Banner...' : 'Activate Layout Banner'}</span>
              </button>
            </form>

            {/* Banners List */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Active Banners ({banners.length})</h3>

              {banners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {banners.map((b) => (
                    <div key={b.banner_id} className="group border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 relative flex flex-col justify-between">
                      <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                        <img src={b.image_url} alt="Layout banner" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 flex justify-between items-center bg-white dark:bg-slate-900">
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            b.layout_position === 'hero' ? 'bg-primary/10 text-primary' : b.layout_position === 'promo' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {b.layout_position === 'hero' ? 'Hero Slider' : b.layout_position === 'promo' ? 'Promo Grid' : 'Footer Banner'}
                          </span>
                          {b.link_url && <p className="text-[10px] text-slate-450 mt-1 truncate max-w-[180px]">Link: {b.link_url}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteBanner(b.banner_id)}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No active banners loaded. The layout is falling back to defaults.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Promo coupons list & admin */}
        {!loading && activeTab === 'coupons' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Active Promotional Coupons</h3>
              <button
                onClick={() => setShowCouponModal(true)}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-primary rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Coupon</span>
              </button>
            </div>

            {coupons.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-450 text-[10px] uppercase font-bold">
                      <th className="py-3.5 px-4">Coupon Code</th>
                      <th className="py-3.5 px-4">Discount Type</th>
                      <th className="py-3.5 px-4">Discount Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-slate-655 dark:text-slate-350">
                    {coupons.map((c) => (
                      <tr key={c.coupon_id} className="hover:bg-slate-55/50 dark:hover:bg-slate-850/30">
                        <td className="py-4 px-4 font-bold font-serif text-slate-850 dark:text-white tracking-wider flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-primary" />
                          <span>{c.code}</span>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold capitalize">{c.discount_type}</td>
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-white">
                          {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${parseFloat(c.discount_value).toLocaleString('en-IN')}`}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            c.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-450 dark:bg-slate-800'
                          }`}>
                            {c.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              onClick={() => handleCouponStatusToggle(c)}
                              className="p-1.5 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                              title={c.is_active ? 'Disable Coupon' : 'Enable Coupon'}
                            >
                              {c.is_active ? (
                                <ToggleRight className="w-5 h-5 text-primary" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(c.coupon_id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                No active promotional coupons created. Add one above.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Coupon Modal Dialog */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-8 rounded-3xl space-y-6 animate-zoomIn">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-serif font-bold text-slate-950 dark:text-white">Create Promo Coupon</h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  name="code"
                  value={couponForm.code}
                  onChange={handleCouponChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white uppercase focus:outline-none focus:border-primary"
                  placeholder="FESTIVE50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Type</label>
                  <select
                    name="discount_type"
                    value={couponForm.discount_type}
                    onChange={handleCouponChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Value</label>
                  <input
                    type="number"
                    name="discount_value"
                    value={couponForm.discount_value}
                    onChange={handleCouponChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    placeholder="15"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 py-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={couponForm.is_active}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-primary border-slate-200 dark:border-slate-800 rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="is_active" className="text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                  Activate this promo code immediately
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="w-1/2 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="w-1/2 py-3.5 text-white bg-slate-900 hover:bg-primary transition-all rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  {savingCoupon ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default SettingsManage;
