import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit3, Trash2, PackageOpen, X, Loader2, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { ConfirmDialog } from '../../components/common/Dialogs';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const GiftItemsManage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [libraryItems, setLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedGiftId, setSelectedGiftId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState({
    gift_id: '',
    item_name: '',
    item_description: '',
    quantity: '1'
  });
  const [saving, setSaving] = useState(false);

  // Deletions
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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
      const giftsData = await api.getGifts(false);
      
      const hampersList = giftsData.filter(g => (g.type || 'hamper') === 'hamper');
      const itemsLib = giftsData.filter(g => g.type === 'item');
      
      setGifts(hampersList);
      setLibraryItems(itemsLib);

      // Auto-select first hamper
      if (hampersList.length > 0) {
        const defaultId = hampersList[0].gift_id;
        setSelectedGiftId(defaultId);
        await loadItems(defaultId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load hampers list');
      setLoading(false);
    }
  };

  const loadItems = async (giftId) => {
    if (!giftId) return;
    setLoading(true);
    try {
      const itemsData = await api.getGiftItems(giftId);
      setItems(itemsData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load contents');
    } finally {
      setLoading(false);
    }
  };

  const handleGiftFilterChange = (e) => {
    const giftId = e.target.value;
    setSelectedGiftId(giftId);
    loadItems(giftId);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({
        gift_id: item.gift_id,
        item_name: item.item_name,
        item_description: item.item_description || '',
        quantity: item.quantity.toString()
      });
    } else {
      setCurrentItem(null);
      setFormData({
        gift_id: selectedGiftId,
        item_name: '',
        item_description: '',
        quantity: '1'
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
    if (!formData.gift_id) return toast.error('Please select a parent hamper');
    if (!formData.item_name.trim()) return toast.error('Item name is required');
    if (!formData.quantity || parseInt(formData.quantity) < 0) return toast.error('Quantity must be positive');

    setSaving(true);
    try {
      const payload = {
        gift_id: formData.gift_id,
        item_name: formData.item_name.trim(),
        item_description: formData.item_description.trim(),
        quantity: parseInt(formData.quantity)
      };

      if (currentItem) {
        await api.updateGiftItem(currentItem.item_id, payload);
        toast.success('Hamper contents updated');
      } else {
        await api.createGiftItem(payload);
        toast.success('New item added to hamper');
      }
      handleCloseModal();
      loadItems(selectedGiftId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save hamper content details');
    } finally {
      setSaving(false);
    }
  };

  const triggerDeleteConfirm = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteGiftItem(itemToDelete.item_id);
      toast.success(`Removed item "${itemToDelete.item_name}"`);
      loadItems(selectedGiftId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove item');
    }
  };

  // Filter local listings
  const filtered = items.filter(i =>
    i.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.item_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      <AdminSidebar />

      <main className="flex-grow p-8 space-y-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif flex items-center space-x-2">
              <PackageOpen className="w-7 h-7 text-primary" />
              <span>Gift Items Management</span>
            </h1>
            <p className="text-xs text-slate-500">Manage the individual products that make up each gift box or hamper</p>
          </div>
          
          <button
            onClick={() => handleOpenModal(null)}
            disabled={gifts.length === 0}
            className="px-5 py-3 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/10 transition-all flex items-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item Link</span>
          </button>
        </div>

        {/* Toolbar Selection */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm">
          
          {/* Target Gift dropdown */}
          <div className="flex items-center space-x-2 w-full md:w-auto text-xs text-slate-550">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-750">Select Hamper:</span>
            <select
              value={selectedGiftId}
              onChange={handleGiftFilterChange}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              {gifts.map((g) => (
                <option key={g.gift_id} value={g.gift_id}>{g.gift_name}</option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs flex items-center border border-slate-105 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl md:ml-auto">
            <Search className="w-4.5 h-4.5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search items in this box..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs focus:outline-none dark:text-white w-full"
            />
          </div>
        </div>

        {/* Included Items list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="py-4 px-6">Content Item Name</th>
                  <th className="py-4 px-6">Description Detail</th>
                  <th className="py-4 px-6">Quantity Included</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-slate-655 dark:text-slate-350">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">Loading box details...</td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((item) => (
                    <tr key={item.item_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-white font-serif">{item.item_name}</td>
                      <td className="py-4 px-6 max-w-sm truncate">{item.item_description || 'No item details.'}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px]">
                          Qty: {item.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-slate-550 hover:text-primary rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => triggerDeleteConfirm(item)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-55 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-450">
                      {gifts.length === 0 ? 'No hampers exist. Create a hamper first.' : 'No contents linked to this hamper box yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: CREATE/EDIT ITEM LINK */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={handleCloseModal} />
            
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-6 z-10 glass">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                  {currentItem ? 'Edit Box Content' : 'Link Item to Box'}
                </h3>
                <button onClick={handleCloseModal} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parent Hamper</label>
                    <select
                      name="gift_id"
                      value={formData.gift_id}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    >
                      {gifts.map((g) => (
                        <option key={g.gift_id} value={g.gift_id}>{g.gift_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Gift Item to wrap</label>
                    <select
                      name="item_name"
                      value={formData.item_name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matchingItem = libraryItems.find(li => li.gift_name === val);
                        setFormData(prev => ({
                          ...prev,
                          item_name: val,
                          item_description: matchingItem?.gift_description || prev.item_description
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    >
                      <option value="" disabled>Select a gift item</option>
                      {libraryItems.map((li) => (
                        <option key={li.gift_id} value={li.gift_name}>{li.gift_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description (E.g. size, flavor, weight)</label>
                  <input
                    type="text"
                    name="item_description"
                    value={formData.item_description}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    placeholder="E.g. 150g jar, Lavender flavor"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{currentItem ? 'Save Changes' : 'Add Item'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          title="Delete Item Content"
          message={`Are you sure you want to remove "${itemToDelete?.item_name}" from this box? The item will be deleted from the hamper layout template.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmOpen(false)}
        />

      </main>
    </div>
  );
};
export default GiftItemsManage;
