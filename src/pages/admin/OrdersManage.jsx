import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ClipboardList, Filter, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { api, subscribeToOrders } from '../../services/api';
import toast from 'react-hot-toast';

export const OrdersManage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Status transitions loaders
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.is_admin) {
      navigate('/profile');
      return;
    }
    loadOrders();

    // Setup real-time listener for incoming orders
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
        loadOrders();
      }
    });

    return () => unsubscribe();
  }, [user, authLoading, navigate]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [ordersData, settingsData] = await Promise.all([
        api.getOrders(),
        api.getSiteSettings()
      ]);
      setOrders(ordersData);
      setSettings(settingsData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppPaymentRequest = (order) => {
    const phone = order.addresses?.phone_number;
    if (!phone) {
      toast.error('Recipient phone number is missing');
      return;
    }
    
    const formattedPhone = phone.replace(/[^\d+]/g, '');
    const orderRef = `#HB-${order.order_id.substring(0, 8).toUpperCase()}`;
    const hamperName = order.gifts?.gift_name || 'Gift Hamper';
    
    let message = '';
    
    if (order.gifts?.show_price === false) {
      // Undisclosed price template
      message = `Hello! 🎁

Thank you for choosing HamperBox. Regarding your luxury gift order details:

📋 *Order Details:*
- *Order Ref:* ${orderRef}
- *Hamper:* ${hamperName}
- *Qty:* ${order.quantity}

✨ *Payment & Billing:*
*Once ordered, the HamperBox team will contact you with order details.* 

We will verify custom pricing options and finalize your transaction shortly. Thank you for your patience! 🌟`;
    } else {
      // Standard pricing template
      const total = parseFloat(order.total_amount).toLocaleString('en-IN');
      const upiId = 'shashank@upi';
      
      message = `Hello! 🎁

Thank you for choosing HamperBox. Here are the payment details for your luxury gift order:

📋 *Order Details:*
- *Order Ref:* ${orderRef}
- *Hamper:* ${hamperName}
- *Qty:* ${order.quantity}
- *Total Amount:* ₹${total}

📱 *Payment Options:*
Please complete the payment using UPI:
👉 *UPI ID:* ${upiId}
👉 *Amount:* ₹${total}

Once the payment is done, please reply to this message with a screenshot of the receipt. We will confirm your order and send your invoice details right away! 🌟`;
    }

    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const downloadInvoice = (order) => {
    const showPrice = order.gifts?.show_price !== false;
    const isPaid = order.order_status !== 'Pending' && order.order_status !== 'Cancelled';
    const orderRef = `#HB-${order.order_id.substring(0, 8).toUpperCase()}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${orderRef}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; margin: 0; line-height: 1.5; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8B5CF6; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: 800; color: #8B5CF6; letter-spacing: -0.05em; font-family: 'Georgia', serif; }
    .title { font-size: 20px; font-weight: bold; color: #334155; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .details h3 { font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; letter-spacing: 0.05em; }
    .details p { margin: 4px 0; font-size: 13px; color: #334155; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 45px; }
    .table th { background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 12px 16px; font-size: 11px; text-transform: uppercase; text-align: left; font-weight: bold; color: #475569; }
    .table td { border-bottom: 1px solid #e2e8f0; padding: 12px 16px; font-size: 13px; color: #334155; }
    .total-box { float: right; width: 320px; margin-top: 10px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; }
    .total-row.grand { border-top: 2px solid #8B5CF6; padding-top: 10px; font-size: 16px; font-weight: bold; color: #8B5CF6; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
    .badge.paid { background: #dcfce7; color: #166534; }
    .badge.unpaid { background: #fef3c7; color: #92400e; }
    .badge.cancelled { background: #fee2e2; color: #991b1b; }
    .footer { clear: both; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 80px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">HamperBox</div>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 550;">Premium Gifting Platform</p>
    </div>
    <div style="text-align: right;">
      <div class="title">OFFICIAL INVOICE</div>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Ref: ${orderRef}</p>
    </div>
  </div>

  <div class="details">
    <div>
      <h3>Order Information</h3>
      <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p><strong>Payment Status:</strong> 
        ${showPrice ? `
        <span class="badge ${isPaid ? 'paid' : order.order_status === 'Cancelled' ? 'cancelled' : 'unpaid'}">
          ${isPaid ? 'PAID via UPI' : order.order_status === 'Cancelled' ? 'CANCELLED' : 'UNPAID'}
        </span>
        ` : `
        <span class="badge unpaid">Contact for Price</span>
        `}
      </p>
      ${showPrice ? `<p><strong>Associated UPI ID:</strong> shashank@upi</p>` : ''}
    </div>
    <div>
      <h3>Recipient Shipping Details</h3>
      <p><strong>Name:</strong> ${order.addresses?.recipient_name || 'N/A'}</p>
      <p><strong>Phone:</strong> ${order.addresses?.phone_number || 'N/A'}</p>
      <p><strong>Address:</strong> ${order.addresses?.address_line1 || ''}</p>
      ${order.addresses?.address_line2 ? `<p>${order.addresses.address_line2}</p>` : ''}
      <p><strong>Destination:</strong> ${order.addresses?.city || ''}, ${order.addresses?.state || ''} - ${order.addresses?.pincode || ''}</p>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Luxury Hamper Description</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: center;">Quantity</th>
        <th style="text-align: right;">Total Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${order.gifts?.gift_name || 'Gift Hamper'}</strong></td>
        <td style="text-align: right;">${showPrice ? `₹${parseFloat(order.gifts?.gift_price || 0).toLocaleString('en-IN')}` : 'On Request'}</td>
        <td style="text-align: center;">${order.quantity}</td>
        <td style="text-align: right;">${showPrice ? `₹${parseFloat(order.total_amount).toLocaleString('en-IN')}` : 'On Request'}</td>
      </tr>
    </tbody>
  </table>

  <div class="total-box">
    ${showPrice ? `
    <div class="total-row">
      <span>Subtotal:</span>
      <span>₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
    </div>
    <div class="total-row">
      <span>Shipping & Assembly:</span>
      <span style="color: #166534; font-weight: 600; font-size: 11px; letter-spacing: 0.05em;">COMPLIMENTARY</span>
    </div>
    <div class="total-row grand">
      <span>Total Paid:</span>
      <span>₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
    </div>
    ` : `
    <div class="total-row grand" style="font-size: 11px; text-transform: none; color: #8B5CF6; border-top: 2px solid #8B5CF6; padding-top: 10px;">
      <span>Once ordered, the HamperBox team will contact you with order details.</span>
    </div>
    `}
  </div>

  <div class="footer">
    <p>Thank you for shopping with HamperBox. We hope the recipient finds joy in this curated gift.</p>
    <p>&copy; ${new Date().getFullYear()} HamperBox Gifting Pvt. Ltd. All rights reserved.</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${orderRef}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Invoice report generated successfully!');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to "${newStatus}"`);
      // Update local state directly to reflect changes immediately
      setOrders(prev =>
        prev.map(o => o.order_id === orderId ? { ...o, order_status: newStatus } : o)
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Status Milestones
  const statusOptions = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450';
      case 'Shipped': return 'bg-sky-500/10 text-sky-600 dark:bg-sky-950/20 dark:text-sky-450';
      case 'Cancelled': return 'bg-rose-500/10 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450';
      default: return 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450';
    }
  };

  // Filtered dataset
  const filtered = orders.filter(o => {
    const formattedId = `#HB-${o.order_id.substring(0, 8).toUpperCase()}`;
    const matchesSearch = formattedId.includes(searchQuery.toUpperCase()) ||
                          o.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.users?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.gifts?.gift_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus ? o.order_status === filterStatus : true;
    return matchesSearch && matchesStatus;
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
              <ClipboardList className="w-7 h-7 text-primary" />
              <span>Orders Management</span>
            </h1>
            <p className="text-xs text-slate-500">Track purchase transactions, print details, and dispatch statuses</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs flex items-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2 rounded-xl">
            <Search className="w-4.5 h-4.5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by ID, customer name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs focus:outline-none dark:text-white w-full"
            />
          </div>

          {/* Status selector filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto text-xs text-slate-550">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <option value="">All Orders</option>
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table ledger */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Gift details</th>
                  <th className="py-4 px-6">Recipient Shipping</th>
                  <th className="py-4 px-6">Current Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-slate-655 dark:text-slate-350">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">Loading orders...</td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((order) => (
                    <tr key={order.order_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                      <td className="py-4 px-6 font-bold tracking-wider text-slate-800 dark:text-white">
                        #HB-{order.order_id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-6 space-y-0.5">
                        <p className="font-bold text-slate-800 dark:text-white">{order.users?.full_name || 'Walk-in'}</p>
                        <p className="text-[10px] text-slate-400">{order.users?.email}</p>
                      </td>
                      <td className="py-4 px-6 space-y-1">
                        <p className="font-bold text-slate-800 dark:text-white font-serif">{order.gifts?.gift_name}</p>
                        <p className="text-[10px] text-slate-450">
                          Price: ₹{parseFloat(order.gifts?.gift_price || 0).toLocaleString('en-IN')} &times; {order.quantity}
                        </p>
                        <p className="font-bold text-slate-800 dark:text-white">
                          Total: ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-[10px] max-w-[200px] truncate leading-relaxed">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{order.addresses?.recipient_name}</p>
                        <p className="truncate">{order.addresses?.address_line1}, {order.addresses?.city}</p>
                        <p>{order.addresses?.phone_number}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-y-2">
                        <div className="flex justify-end gap-1.5 mb-1.5">
                          <button
                            onClick={() => sendWhatsAppPaymentRequest(order)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                            title="Send WhatsApp Payment Details"
                          >
                            <span>WhatsApp Pay</span>
                          </button>
                          <button
                            onClick={() => downloadInvoice(order)}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                            title="Download Styled Invoice"
                          >
                            <span>Invoice</span>
                          </button>
                        </div>
                        {updatingOrderId === order.order_id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary ml-auto" />
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 pt-1">
                            {order.order_status === 'Pending' && (
                              <button
                                onClick={() => handleStatusChange(order.order_id, 'Confirmed')}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-bold shadow-sm transition-colors cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                            <select
                              value={order.order_status}
                              onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                              className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] focus:outline-none focus:border-primary"
                            >
                              {statusOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-450">No orders found.</td>
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
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-55 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-55 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};
export default OrdersManage;
