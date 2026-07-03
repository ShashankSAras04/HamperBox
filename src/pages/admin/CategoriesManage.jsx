import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit3, Trash2, FolderKanban, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { ConfirmDialog } from '../../components/common/Dialogs';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const CategoriesManage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });
  const [saving, setSaving] = useState(false);

  // Deletions
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.is_admin) {
      navigate('/profile');
      return;
    }
    loadCategories();
  }, [user, authLoading, navigate]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setCurrentCategory(cat);
      setFormData({
        name: cat.category_name,
        description: cat.category_description || '',
        image: cat.category_image || ''
      });
    } else {
      setCurrentCategory(null);
      setFormData({ name: '', description: '', image: '' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({ name: '', description: '', image: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category Name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        category_name: formData.name.trim(),
        category_description: formData.description.trim(),
        category_image: formData.image.trim() || 'https://images.unsplash.com/photo-1549007994-cb92ca8a3bd0?auto=format&fit=crop&q=80&w=400'
      };

      if (currentCategory) {
        await api.updateCategory(currentCategory.category_id, payload);
        toast.success('Category updated successfully');
      } else {
        await api.createCategory(payload);
        toast.success('Category created successfully');
      }
      handleCloseModal();
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const triggerDeleteConfirm = (cat) => {
    setCategoryToDelete(cat);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await api.deleteCategory(categoryToDelete.category_id);
      toast.success(`Category "${categoryToDelete.category_name}" deleted.`);
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete category');
    }
  };

  // Filter Categories
  const filtered = categories.filter(c =>
    c.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination math
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar navigation */}
      <AdminSidebar />

      {/* Main categories panel */}
      <main className="flex-grow p-8 space-y-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif flex items-center space-x-2">
              <FolderKanban className="w-7 h-7 text-primary" />
              <span>Categories Management</span>
            </h1>
            <p className="text-xs text-slate-500">Add, edit, or delete gift hamper groups and collections</p>
          </div>
          
          <button
            onClick={() => handleOpenModal(null)}
            className="px-5 py-3 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all flex items-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex space-x-4 items-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm max-w-md">
          <Search className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-transparent text-xs focus:outline-none dark:text-white"
          />
        </div>

        {/* Categories Table List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Collection Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-slate-655 dark:text-slate-350">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">Loading categories data...</td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((cat) => (
                    <tr key={cat.category_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                      <td className="py-4 px-6">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-150 dark:border-slate-800">
                          <img
                            src={cat.category_image || 'https://images.unsplash.com/photo-1549007994-cb92ca8a3bd0?auto=format&fit=crop&q=80&w=200'}
                            alt={cat.category_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-850 dark:text-white font-serif">{cat.category_name}</td>
                      <td className="py-4 px-6 max-w-sm truncate">{cat.category_description || 'No description provided.'}</td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="p-2 text-slate-500 hover:text-primary rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => triggerDeleteConfirm(cat)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-450">No categories found matching your query.</td>
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
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal: CREATE/EDIT CATEGORY */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={handleCloseModal} />
            
            {/* Form Box */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-6 z-10 glass">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                  {currentCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button onClick={handleCloseModal} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    placeholder="E.g. Sweet Treats"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    placeholder="Short summary of this hamper category..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-primary"
                    placeholder="Https://images.unsplash.com/..."
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{currentCategory ? 'Save Changes' : 'Create Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm Dialogue */}
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          title="Delete Category"
          message={`Are you sure you want to delete the category "${categoryToDelete?.category_name}"? This action will permanently remove all associated hampers within this category.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmOpen(false)}
        />

      </main>
    </div>
  );
};
export default CategoriesManage;
