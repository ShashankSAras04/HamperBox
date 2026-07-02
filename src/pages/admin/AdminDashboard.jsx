import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, Eye, Users, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { api, subscribeToOrders } from '../../services/api';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    pending: 0,
    gifts: 0,
    customers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [popularHampersData, setPopularHampersData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.is_admin) {
      toast.error('Access denied. Administrator privileges required.');
      navigate('/profile');
      return;
    }

    const loadDashboardData = async () => {
      try {
        const [orders, gifts, categories, usersList] = await Promise.all([
          api.getOrders(),
          api.getGifts(),
          api.getCategories(),
          api.getUsers()
        ]);

        // Calculate Revenue and Orders
        const activeOrders = orders.filter(o => o.order_status !== 'Cancelled');
        const revSum = activeOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        const pendCount = orders.filter(o => o.order_status === 'Pending').length;
        const actGifts = gifts.filter(g => g.status === 'active').length;
        const custCount = usersList.filter(u => !u.is_admin).length;

        setStats({
          revenue: revSum,
          orders: orders.length,
          pending: pendCount,
          gifts: actGifts,
          customers: custCount
        });

        setRecentOrders(orders.slice(0, 5));

        // 1. Calculate Monthly Revenue (Last 6 Months)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthsMap = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const mName = monthNames[d.getMonth()];
          monthsMap[mName] = 0;
        }

        orders.forEach(o => {
          if (o.order_status !== 'Cancelled') {
            const oDate = new Date(o.created_at);
            const mName = monthNames[oDate.getMonth()];
            if (monthsMap[mName] !== undefined) {
              monthsMap[mName] += parseFloat(o.total_amount || 0);
            }
          }
        });

        const dynamicRevenueData = Object.keys(monthsMap).map(mName => ({
          name: mName,
          sales: monthsMap[mName]
        }));
        setRevenueChartData(dynamicRevenueData);

        // 2. Calculate Popular Products / Hampers
        const hampersCountMap = {};
        orders.forEach(o => {
          if (o.order_status !== 'Cancelled') {
            const name = o.gifts?.gift_name || 'Gift Item';
            hampersCountMap[name] = (hampersCountMap[name] || 0) + (o.quantity || 1);
          }
        });

        const dynamicPopularHampers = Object.keys(hampersCountMap)
          .map(name => ({ name: name.substring(0, 15), count: hampersCountMap[name] }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setPopularHampersData(dynamicPopularHampers.length > 0 ? dynamicPopularHampers : [{ name: 'No sales yet', count: 0 }]);

        // 3. Calculate Order Status Counts
        const statusCounts = { 'Delivered': 0, 'Pending': 0, 'Shipped': 0, 'Cancelled': 0, 'Confirmed': 0, 'Packed': 0 };
        orders.forEach(o => {
          const status = o.order_status;
          if (statusCounts[status] !== undefined) {
            statusCounts[status] += 1;
          }
        });

        const dynamicOrderStatusData = [
          { name: 'Delivered', value: statusCounts['Delivered'] || 0, color: '#10B981' },
          { name: 'Pending', value: statusCounts['Pending'] || 0, color: '#F59E0B' },
          { name: 'Shipped', value: (statusCounts['Shipped'] || 0) + (statusCounts['Packed'] || 0) + (statusCounts['Confirmed'] || 0), color: '#0EA5E9' },
          { name: 'Cancelled', value: statusCounts['Cancelled'] || 0, color: '#EF4444' }
        ];
        setOrderStatusData(dynamicOrderStatusData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Subscribe to real-time order updates
    const unsubscribe = subscribeToOrders((payload) => {
      if (payload.type === 'INSERT') {
        toast(`New Order Received! (#${payload.new.order_id.substring(0, 8).toUpperCase()})`, {
          icon: '🎁',
          duration: 4000,
          style: {
            borderRadius: '16px',
            background: '#8B5CF6',
            color: '#fff',
            fontSize: '12px'
          }
        });
        loadDashboardData();
      }
    });

    return () => unsubscribe();
  }, [user, authLoading, navigate]);

  if (authLoading || !user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-950">
        <LoaderComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar Panel */}
      <AdminSidebar />

      {/* Main Admin Section */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif">Dashboard Summary</h1>
            <p className="text-xs text-slate-500">HamperBox analytics overview and activities log</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500">
            Realtime updates active
          </div>
        </div>

        {/* Aggregates Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Revenue</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                ₹{loading ? '...' : stats.revenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Orders</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                {loading ? '...' : stats.orders}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Pending Orders</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                {loading ? '...' : stats.pending}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Customers</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                {loading ? '...' : stats.customers}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Area Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Monthly Sales Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                  <Area type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Hampers Bar Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Popular Hampers</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularHampersData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} interval={0} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]}>
                    {popularHampersData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8B5CF6' : '#ec4899'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Recent Orders List Ledger */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline font-semibold">View All Orders &rarr;</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-450 text-[10px] uppercase font-bold">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Hamper</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-slate-650 dark:text-slate-350">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">Loading orders...</td>
                  </tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                      <td className="py-3.5 px-4 font-bold tracking-wider text-slate-800 dark:text-white">
                        #HB-{order.order_id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4">{order.users?.full_name || 'Walk-in customer'}</td>
                      <td className="py-3.5 px-4 font-medium">{order.gifts?.gift_name}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          order.order_status === 'Delivered'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : order.order_status === 'Cancelled'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-850 dark:text-white">
                        ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">No orders placed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

const LoaderComponent = () => (
  <div className="flex flex-col items-center justify-center space-y-3">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
    <span className="text-xs text-slate-500">Checking credentials...</span>
  </div>
);
export default AdminDashboard;
