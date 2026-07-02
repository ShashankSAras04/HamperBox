import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit3, Trash2, Gift, X, Loader2, Filter, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { ConfirmDialog } from '../../components/common/Dialogs';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const GiftsManage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [gifts, setGifts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [standaloneItems, setStandaloneItems] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [currentGift, setCurrentGift] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category_id: '',
    status: 'active',
    show_price: true,
    type: 'hamper',
    is_featured: false,
    images: [],
    contents: []
  });
  const [saving, setSaving] = useState(false);

  // Deletions
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [giftToDelete, setGiftToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.is_admin) {
      navigate('/profile');
      return;
    }
    loadData();
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [giftsData, catsData, settingsData] = await Promise.all([
        api.getGifts(false), // all including inactive
        api.getCategories(),
        api.getSiteSettings()
      ]);
      setGifts(giftsData);
      setCategories(catsData);
      if (settingsData) setSiteSettings(settingsData);
      
      const itemsList = giftsData.filter(g => g.type === 'item');
      setStandaloneItems(itemsList);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (gift = null) => {
    let initialContents = [];
    let initialImages = [];
    
    if (gift) {
      initialImages = gift.gift_image ? gift.gift_image.split(',') : [];
      if (gift.type === 'hamper') {
        try {
          const res = await api.getGiftItems(gift.gift_id);
          initialContents = res.map(i => ({ item_name: i.item_name, quantity: i.quantity }));
        } catch (e) {
          console.error(e);
        }
      }
      
      setCurrentGift(gift);
      setFormData({
        name: gift.gift_name,
        description: gift.gift_description || '',
        price: gift.gift_price.toString(),
        image: '',
        category_id: gift.category_id,
        status: gift.status,
        show_price: gift.show_price !== false,
        type: gift.type || 'hamper',
        is_featured: gift.is_featured === true,
        images: initialImages,
        contents: initialContents
      });
    } else {
      setCurrentGift(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        category_id: categories[0]?.category_id || '',
        status: 'active',
        show_price: true,
        type: 'hamper',
        is_featured: false,
        images: [],
        contents: []
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Gift Name is required');
    if (!formData.price || parseFloat(formData.price) < 0) return toast.error('Enter a valid price');
    if (!formData.category_id) return toast.error('Please select a category');

    setSaving(true);
    try {
      const finalImageString = formData.images.join(',') || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400';
      const payload = {
        gift_name: formData.name.trim(),
        gift_description: formData.description.trim(),
        gift_price: parseFloat(formData.price),
        gift_image: finalImageString,
        category_id: formData.category_id,
        status: formData.status,
        show_price: formData.show_price,
        type: formData.type,
        is_featured: formData.is_featured
      };

      let savedGift = null;
      if (currentGift) {
        savedGift = await api.updateGift(currentGift.gift_id, payload);
        toast.success('Product details updated');
      } else {
        savedGift = await api.createGift(payload);
        toast.success('New product added successfully');
      }

      // Save contents linkage if it is a hamper
      if (formData.type === 'hamper' && savedGift) {
        await api.setHamperContents(savedGift.gift_id, formData.contents);
      }

      handleCloseModal();
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save hamper details');
    } finally {
      setSaving(false);
    }
  };

  const handleShareWhatsApp = (gift) => {
    const siteUrl = window.location.origin;
    const productUrl = `${siteUrl}/gifts/${gift.gift_id}`;
    const mainImage = gift.gift_image ? gift.gift_image.split(',')[0] : '';

    const priceText = gift.show_price === false
      ? 'Price: Contact us for pricing'
      : `Price: ₹${parseFloat(gift.gift_price).toLocaleString('en-IN')}`;

    const igLine = siteSettings?.instagram_url && siteSettings.instagram_url !== 'https://instagram.com'
      ? `📸 Instagram: ${siteSettings.instagram_url}`
      : '';

    const waNum = siteSettings?.whatsapp_number
      ? siteSettings.whatsapp_number.replace(/[^0-9]/g, '')
      : null;

    const lines = [
      `🎁 *${gift.gift_name}*`,
      ``,
      gift.gift_description ? `${gift.gift_description}` : '',
      ``,
      `${priceText}`,
      ``,
      `🛒 Order here: ${productUrl}`,
      igLine,
      waNum ? `💬 WhatsApp us: https://wa.me/${waNum}` : '',
    ].filter(l => l !== null && l !== undefined);

    const text = lines.join('\n').trim();
    const encoded = encodeURIComponent(text);

    // If we have a WhatsApp number, open a direct chat; otherwise open share UI
    const shareUrl = waNum
      ? `https://wa.me/${waNum}?text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const triggerDeleteConfirm = (gift) => {
    setGiftToDelete(gift);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!giftToDelete) return;
    try {
      await api.deleteGift(giftToDelete.gift_id);
      toast.success(`Hamper "${giftToDelete.gift_name}" deleted.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete hamper');
    }
  };

  // Filtered dataset
  const filtered = gifts.filter(g => {
    const matchesSearch = g.gift_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.gift_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory ? g.category_id === filterCategory : true;
    const matchesStatus = filterStatus ? g.status === filterStatus : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination math
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      <AdminSidebar />

      <main className="flex-grow p-8 space-y-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif flex items-center space-x-2">
              <Gift className="w-7 h-7 text-primary" />
              <span>Gifts Management</span>
            </h1>
            <p className="text-xs text-slate-500">Add, edit, or remove gift hampers, prices, and visual galleries</p>
          </div>
          
          <button
            onClick={() => handleOpenModal(null)}
            className="px-5 py-3 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all flex items-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hamper</span>
          </button>
        </div>

        {/* Toolbar Filters Panel */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm">
          {/* Search */}
          <div className="relative w-full md:max-w-xs flex items-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2 rounded-xl">
            <Search className="w-4.5 h-4.5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search hampers..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs focus:outline-none dark:text-white w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto text-xs text-slate-550">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto text-xs text-slate-550">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Hampers Ledger Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Hamper Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-slate-655 dark:text-slate-350">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">Loading hampers list...</td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((gift) => (
                    <tr key={gift.gift_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                      <td className="py-4 px-6">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-150 dark:border-slate-800">
                          <img
                            src={gift.gift_image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=200'}
                            alt={gift.gift_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-850 dark:text-white font-serif">{gift.gift_name}</td>
                      <td className="py-4 px-6">{gift.categories?.category_name || 'Unassigned'}</td>
                      <td className="py-4 px-6 font-bold text-slate-850 dark:text-white">
                        {gift.show_price === false ? (
                          <span className="text-[10px] text-slate-400 italic">Hidden (Price on Request)</span>
                        ) : (
                          `₹${parseFloat(gift.gift_price).toLocaleString('en-IN')}`
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          gift.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-550'
                        }`}>
                          {gift.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* WhatsApp Share */}
                          <button
                            onClick={() => handleShareWhatsApp(gift)}
                            className="p-2 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenModal(gift)}
                            className="p-2 text-slate-500 hover:text-primary rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => triggerDeleteConfirm(gift)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-450">No hampers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 dark:border-slate-850">
              <span className="text-[11px] text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal: CREATE/EDIT GIFT */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-955/40 backdrop-blur-sm" onClick={handleCloseModal} />
            
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-6 z-10 glass">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                  {currentGift ? 'Edit Gift Hamper' : 'Add Gift Hamper'}
                </h3>
                <button onClick={handleCloseModal} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hamper Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                      placeholder="E.g. Royal Gold Basket"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price (INR)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                      placeholder="3500.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    >
                      <option value="" disabled>Select category</option>
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    >
                      <option value="hamper">Gift Hamper (Bundle)</option>
                      <option value="item">Single Gift Item</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="is_featured"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-4 h-4 text-primary border-slate-200 dark:border-slate-800 rounded focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="is_featured" className="text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                      Show on Front Page
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    placeholder="Provide a luxurious description..."
                  />
                </div>

                <div className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id="show_price"
                    name="show_price"
                    checked={formData.show_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, show_price: e.target.checked }))}
                    className="w-4 h-4 text-primary border-slate-200 dark:border-slate-800 rounded focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="show_price" className="text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                    Disclose price on website
                  </label>
                </div>

                {/* Images Manager */}
                <div className="space-y-2 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-semibold">Images Gallery ({formData.images.length})</label>
                  
                  {/* Gallery Grid */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2.5">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          
                          {/* Badge for primary image */}
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                              Main
                            </span>
                          )}

                          {/* Control overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-1.5 p-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => {
                                    const nextImages = [...prev.images];
                                    const selected = nextImages.splice(idx, 1)[0];
                                    return { ...prev, images: [selected, ...nextImages] };
                                  });
                                }}
                                className="px-2 py-1 bg-primary hover:bg-primary-hover text-white text-[8px] font-bold rounded-lg cursor-pointer"
                              >
                                Set Main
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[8px] font-bold rounded-lg cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Image Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL..."
                      className="flex-grow px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                      value={formData.image}
                      onChange={handleInputChange}
                      name="image"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.image.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, prev.image.trim()],
                            image: ''
                          }));
                        }
                      }}
                      className="px-4 py-2.5 bg-slate-900 text-white hover:bg-primary rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Upload file option */}
                  <div className="space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setFormData(prev => ({ ...prev, images: [...prev.images, event.target.result] }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Hamper Contents checklist */}
                {formData.type === 'hamper' && (
                  <div className="space-y-2 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-955/20">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-semibold text-slate-700 dark:text-slate-350">Include Gift Items in this Hamper</label>
                    
                    {standaloneItems.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {standaloneItems.map((item) => {
                          const existingLink = formData.contents.find(c => c.item_name === item.gift_name);
                          const isChecked = !!existingLink;
                          const currentQty = existingLink ? existingLink.quantity : 0;
                          
                          return (
                            <div key={item.gift_id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`link-${item.gift_id}`}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData(prev => ({
                                        ...prev,
                                        contents: [...prev.contents, { item_name: item.gift_name, quantity: 1 }]
                                      }));
                                    } else {
                                      setFormData(prev => ({
                                        ...prev,
                                        contents: prev.contents.filter(c => c.item_name !== item.gift_name)
                                      }));
                                    }
                                  }}
                                  className="w-4 h-4 text-primary border-slate-200 dark:border-slate-800 rounded focus:ring-primary cursor-pointer"
                                />
                                <label htmlFor={`link-${item.gift_id}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                                  {item.gift_name}
                                </label>
                              </div>

                              {isChecked && (
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[10px] text-slate-400">Qty:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    value={currentQty}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 1;
                                      setFormData(prev => ({
                                        ...prev,
                                        contents: prev.contents.map(c => c.item_name === item.gift_name ? { ...c, quantity: val } : c)
                                      }));
                                    }}
                                    className="w-12 px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-center text-xs font-bold dark:text-white focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-450 italic">No standalone gift items found in the library. Create one first!</p>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-55"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{currentGift ? 'Save Changes' : 'Create Hamper'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          title="Delete Gift Hamper"
          message={`Are you sure you want to delete the hamper "${giftToDelete?.gift_name}"? All associated order records in the historical logs will remain, but the product will be removed from catalog listings.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmOpen(false)}
        />

      </main>
    </div>
  );
};
export default GiftsManage;
