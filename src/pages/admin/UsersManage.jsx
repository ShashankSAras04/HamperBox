import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ShoppingBag, MapPin, Mail, Phone, Calendar, ArrowRight, ShieldCheck, X, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const UsersManage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected customer inspection panel
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  // Create Admin states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.is_admin) {
      navigate('/profile');
      return;
    }
    loadUsers();
  }, [user, authLoading, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load customers database');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (usr) => {
    setSelectedUser(usr);
    setLoadingUserDetails(true);
    try {
      const [addrData, orderData] = await Promise.all([
        api.getAddresses(usr.user_id),
        api.getOrders(usr.user_id)
      ]);
      setUserAddresses(addrData);
      setUserOrders(orderData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch customer logs');
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword || !newAdminName) {
      toast.error('Name, email, and password are required');
      return;
    }
    if (newAdminPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setCreatingAdmin(true);
    try {
      await api.createAdminUser({
        email: newAdminEmail,
        password: newAdminPassword,
        full_name: newAdminName,
        phone_number: newAdminPhone
      });
      toast.success('Admin registered successfully! No OTP verification required.');
      setCreateModalOpen(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      setNewAdminPhone('');
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to register administrator');
    } finally {
      setCreatingAdmin(false);
    }
  };

  // Filter accounts
  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone_number?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      <AdminSidebar />

      <main className="flex-grow p-8 space-y-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif flex items-center space-x-2">
              <Users className="w-7 h-7 text-primary" />
              <span>Customers Directory</span>
            </h1>
            <p className="text-xs text-slate-500">Inspect registered users, address books, and purchase history</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Administrator</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="flex space-x-4 items-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm max-w-md">
          <Search className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs focus:outline-none dark:text-white"
          />
        </div>

        {/* Double layout: Listings on left, detailed inspector on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Customers ledger */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 text-[10px] uppercase font-bold">
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-slate-655 dark:text-slate-350">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400">Loading customers...</td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((usr) => (
                      <tr key={usr.user_id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/30 ${
                        selectedUser?.user_id === usr.user_id ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}>
                        <td className="py-4 px-6 space-y-0.5">
                          <p className="font-bold text-slate-800 dark:text-white font-serif">{usr.full_name || 'No Name'}</p>
                          <p className="text-[10px] text-slate-405">{usr.email}</p>
                        </td>
                        <td className="py-4 px-6">{usr.phone_number || 'N/A'}</td>
                        <td className="py-4 px-6">
                          {usr.is_admin ? (
                            <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-primary text-[9px] font-bold uppercase flex items-center space-x-1 w-fit">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-550 text-[9px] font-bold">
                              User
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleSelectUser(usr)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
                          >
                            Inspect Log
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-450">No profiles found matching search terms.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Inspector Drawer Card */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
            {selectedUser ? (
              <div className="space-y-6">
                
                {/* Header Profile Inspector */}
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">{selectedUser.full_name}</h3>
                    <p className="text-xs text-slate-455">Customer ID: {selectedUser.user_id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loadingUserDetails ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-[10px] text-slate-400">Loading user logs...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* User Contacts */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Contact Cards</h4>
                      <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{selectedUser.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{selectedUser.phone_number || 'No contact phone linked'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Joined {new Date(selectedUser.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-850" />

                    {/* Saved Addresses list */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Saved Addresses ({userAddresses.length})</span>
                      </h4>
                      {userAddresses.length > 0 ? (
                        <div className="space-y-3.5 max-h-40 overflow-y-auto pr-1">
                          {userAddresses.map((addr) => (
                            <div key={addr.address_id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-205/30 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                              <p className="font-bold text-slate-800 dark:text-white">{addr.recipient_name} ({addr.phone_number})</p>
                              <p className="text-[11px] leading-relaxed">{addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-455 italic">No saved addresses on profile.</p>
                      )}
                    </div>

                    <hr className="border-slate-100 dark:border-slate-850" />

                    {/* Historical Orders */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Purchase Log ({userOrders.length})</span>
                      </h4>
                      {userOrders.length > 0 ? (
                        <div className="space-y-3.5 max-h-40 overflow-y-auto pr-1">
                          {userOrders.map((order) => (
                            <div key={order.order_id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-205/30 flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-slate-800 dark:text-white font-serif truncate max-w-[150px]">{order.gifts?.gift_name}</p>
                                <p className="text-[10px] text-slate-405">#HB-{order.order_id.substring(0, 8).toUpperCase()} &bull; Qty: {order.quantity}</p>
                              </div>
                              <div className="text-right space-y-1">
                                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${
                                  order.order_status === 'Delivered'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : order.order_status === 'Cancelled'
                                    ? 'bg-rose-500/10 text-rose-600'
                                    : 'bg-amber-500/10 text-amber-600'
                                }`}>
                                  {order.order_status}
                                </span>
                                <p className="font-bold text-slate-850 dark:text-white text-[11px]">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-455 italic">No purchase history logged.</p>
                      )}
                    </div>

                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 space-y-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm">Select Customer</h4>
                <p className="text-xs max-w-[200px] mx-auto text-slate-455 leading-relaxed">
                  Click the "Inspect Log" button on any customer row to browse their address books and purchase summaries.
                </p>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Create Administrator Modal popup */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">Register New Administrator</h3>
                <p className="text-[10px] text-slate-400 mt-1">This instantly registers a verified administrator login. Bypasses email and OTP codes.</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="e.g. admin.smith@hamperbox.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  placeholder="e.g. +91 9999999999"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2.5 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold hover:shadow-lg hover:shadow-primary/10 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {creatingAdmin ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
export default UsersManage;
