import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Truck, Calendar, MapPin, Phone, RefreshCw, Hash } from 'lucide-react';
import { SEO } from '../../components/seo/SEO';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const OrdersPage = () => {
  const [searchMode, setSearchMode] = useState('phone'); // 'phone' | 'reference'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [settings, setSettings] = useState(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await api.getSiteSettings();
        setSettings(s);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const statusMilestones = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

  const getStatusIndex = (status) => {
    return statusMilestones.indexOf(status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450';
      case 'Shipped': return 'bg-sky-500/10 text-sky-600 dark:bg-sky-950/20 dark:text-sky-450';
      case 'Cancelled': return 'bg-rose-500/10 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450';
      default: return 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450';
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    if (searchMode === 'phone') {
      if (!phoneNumber.trim()) {
        toast.error('Please enter a phone number');
        return;
      }
    } else {
      if (!referenceNumber.trim()) {
        toast.error('Please enter an order reference number');
        return;
      }
    }

    setLoading(true);
    setSearched(true);
    try {
      let data;
      if (searchMode === 'phone') {
        data = await api.getOrdersByPhone(phoneNumber.trim());
      } else {
        data = await api.getOrdersByRef(referenceNumber.trim());
      }
      
      // Filter orders based on user requirements:
      // 1. Hide Cancelled orders
      // 2. Hide Delivered orders after 3 days
      // 3. Show active processing orders (Pending, Confirmed, Packed, Shipped)
      const filtered = data.filter(order => {
        const status = order.order_status;
        
        if (status === 'Cancelled') {
          return false;
        }
        
        if (status === 'Delivered') {
          const updatedAt = new Date(order.updated_at || order.created_at);
          const diffTime = Math.abs(new Date() - updatedAt);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 3; // Show for 3 days only
        }
        
        return true; // Show Pending, Confirmed, Packed, Shipped
      });

      setOrders(filtered);
    } catch (err) {
      console.error(err);
      toast.error('Failed to look up orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-16 transition-colors duration-300">
      <SEO title="Track My Order" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Title */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl text-primary shadow-sm">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">Track Order Status</h1>
          <p className="text-xs text-slate-455 max-w-md mx-auto">
            Track your luxury hamper using your phone number or order reference number.
          </p>
        </div>

        {/* Search Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => { setSearchMode('phone'); setSearched(false); setOrders([]); }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                searchMode === 'phone'
                  ? 'bg-primary text-white shadow-md shadow-primary/10'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone Number</span>
            </button>
            <button
              onClick={() => { setSearchMode('reference'); setSearched(false); setOrders([]); }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                searchMode === 'reference'
                  ? 'bg-primary text-white shadow-md shadow-primary/10'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Order Reference</span>
            </button>
          </div>
        </div>

        {/* Search Bar Container */}
        <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm mb-10 flex flex-col sm:flex-row gap-4 items-center">
          {searchMode === 'phone' ? (
            <div className="relative flex-grow w-full flex items-center border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900 px-4 py-3 rounded-2xl">
              <Phone className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="tel"
                placeholder="Enter phone number (e.g. +91...)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white w-full"
              />
            </div>
          ) : (
            <div className="relative flex-grow w-full flex items-center border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900 px-4 py-3 rounded-2xl">
              <Hash className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter order reference (e.g. #HB-XXXXXXXX)"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white w-full"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl text-xs font-semibold shadow-lg shadow-primary/10 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Track Order</span>
          </button>
        </form>

        {/* Results Ledger */}
        {loading ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 h-40 rounded-3xl border border-slate-150 dark:border-slate-850 animate-pulse" />
            <div className="bg-white dark:bg-slate-900 h-40 rounded-3xl border border-slate-150 dark:border-slate-855 animate-pulse" />
          </div>
        ) : searched ? (
          orders.length > 0 ? (
            <div className="space-y-8">
              {orders.map((order) => {
                const currentStatusIdx = getStatusIndex(order.order_status);
                const isDelivered = order.order_status === 'Delivered';
                
                return (
                  <div
                    key={order.order_id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-6"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Order Number
                        </p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white tracking-wider">
                          #HB-{order.order_id.substring(0, 8).toUpperCase()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-xs text-slate-500">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Placed On</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-350 flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Product details */}
                      <div className="md:col-span-6 flex space-x-4">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-850">
                          <img
                            src={order.gifts?.gift_image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=200'}
                            alt={order.gifts?.gift_name || 'Gift Hamper'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white font-serif">
                            {order.gifts?.gift_name || 'Gift Hamper'}
                          </h4>
                          <p className="text-xs text-slate-450">
                            Price: ₹{parseFloat(order.gifts?.gift_price || 0).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-slate-450">
                            Quantity: {order.quantity}
                          </p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white pt-1">
                            Total amount: ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Recipient Details */}
                      <div className="md:col-span-6 space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-850/60">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span>Recipient Address</span>
                        </p>
                        <div className="text-xs text-slate-655 dark:text-slate-400 space-y-1">
                          <p className="font-bold text-slate-800 dark:text-white">{order.addresses?.recipient_name}</p>
                          <p>{order.addresses?.address_line1}</p>
                          {order.addresses?.address_line2 && <p>{order.addresses.address_line2}</p>}
                          <p>{order.addresses?.city}, {order.addresses?.state} - {order.addresses?.pincode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="relative flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-2">
                        {/* Connecting line */}
                        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-150 dark:bg-slate-800 hidden sm:block z-0" />
                        
                        {statusMilestones.map((milestone, mIdx) => {
                          const isCompleted = mIdx <= currentStatusIdx;
                          const isActive = mIdx === currentStatusIdx;
                          
                          return (
                            <div key={milestone} className="relative z-10 flex flex-row sm:flex-col items-center gap-3 sm:gap-2 w-full sm:w-auto text-left sm:text-center">
                              {/* Dot circle */}
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                                isCompleted
                                  ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                              } ${isActive ? 'ring-4 ring-primary/20 animate-pulse' : ''}`}>
                                {mIdx + 1}
                              </div>
                              
                              {/* Label */}
                              <div>
                                <p className={`text-xs font-bold ${
                                  isCompleted ? 'text-slate-800 dark:text-white' : 'text-slate-400'
                                }`}>
                                  {milestone}
                                </p>
                                <p className="text-[9px] text-slate-400 hidden sm:block">
                                  {isActive ? 'Current State' : isCompleted ? 'Completed' : 'Pending'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {order.order_status === 'Pending' && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/25 border border-amber-250 dark:border-amber-900 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                          <p className="text-xs font-bold text-amber-800 dark:text-amber-400">Order is pending payment verification</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Contact the HampBox team to finalize your payment details and confirm shipping.</p>
                        </div>
                        <a
                          href={`https://wa.me/${(settings?.whatsapp_number || '+919620000000').replace(/[^\d+]/g, '')}?text=${encodeURIComponent(`Hello! 🎁 I placed order #HB-${order.order_id.substring(0, 8).toUpperCase()} for ${order.gifts?.gift_name || 'Gift Hamper'}. Please guide me on payment details.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-550 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1 flex-shrink-0 cursor-pointer text-center"
                        >
                          <span>Chat via WhatsApp</span>
                        </a>
                      </div>
                    )}

                    {isDelivered && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-2xl text-center text-xs text-emerald-600 dark:text-emerald-450 font-medium">
                        Your hamper was successfully delivered! Thank you for gifting with HampBox. (Notice: This order status is visible for 3 days post-delivery)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-8 max-w-md mx-auto space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">No active orders</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {searchMode === 'phone' 
                  ? "We couldn't find any pending, processing, or recently delivered orders associated with this phone number."
                  : "We couldn't find any orders matching this reference number. Please check and try again."}
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            Enter your details above to begin tracking.
          </div>
        )}
      </div>
    </div>
  );
};
export default OrdersPage;
