import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ClipboardList, Filter, Loader2, ArrowRight, CreditCard, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { api, subscribeToOrders } from '../../services/api';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import logoImg from '../../assets/logo.webp';

export const OrdersManage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [upiIds, setUpiIds] = useState([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Status transitions loaders
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // UPI selection modal
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiModalAction, setUpiModalAction] = useState(null); // 'whatsapp' | 'markpaid'
  const [upiModalOrder, setUpiModalOrder] = useState(null);
  const [selectedUpiForModal, setSelectedUpiForModal] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Hidden invoice div ref
  const invoiceRef = useRef(null);

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
      const [ordersData, settingsData, upiData] = await Promise.all([
        api.getOrders(),
        api.getSiteSettings(),
        api.getUpiIds()
      ]);
      setOrders(ordersData);
      setSettings(settingsData);
      setUpiIds(upiData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Convert logo to base64 for PDF embedding
  const getLogoBase64 = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve('');
      img.src = logoImg;
    });
  };

  // Open UPI selection modal before WhatsApp or Mark Paid
  const openUpiModal = (order, action) => {
    // If UPI is locked, don't allow changing
    if (order.upi_locked && order.selected_upi) {
      if (action === 'whatsapp') {
        sendWhatsAppPaymentRequest(order, order.selected_upi);
      }
      return;
    }
    const defaultUpi = upiIds.find(u => u.is_default);
    setSelectedUpiForModal(order.selected_upi || defaultUpi?.upi_address || (upiIds[0]?.upi_address || ''));
    setUpiModalOrder(order);
    setUpiModalAction(action);
    setShowUpiModal(true);
  };

  const handleUpiModalConfirm = async () => {
    if (!selectedUpiForModal) {
      toast.error('Please select a UPI ID');
      return;
    }

    const order = upiModalOrder;
    const action = upiModalAction;
    setShowUpiModal(false);

    if (action === 'whatsapp') {
      // Save UPI to order first
      try {
        await api.updateOrderUpi(order.order_id, selectedUpiForModal);
        // Update local state
        setOrders(prev =>
          prev.map(o => o.order_id === order.order_id ? { ...o, selected_upi: selectedUpiForModal } : o)
        );
      } catch (err) {
        console.error(err);
      }
      sendWhatsAppPaymentRequest(order, selectedUpiForModal);
    } else if (action === 'markpaid') {
      // Lock UPI and change status
      setUpdatingOrderId(order.order_id);
      try {
        await api.lockOrderUpi(order.order_id, selectedUpiForModal);
        await api.updateOrderStatus(order.order_id, 'Confirmed');
        toast.success('Order marked as paid & UPI locked');
        setOrders(prev =>
          prev.map(o => o.order_id === order.order_id ? { ...o, order_status: 'Confirmed', selected_upi: selectedUpiForModal, upi_locked: true } : o)
        );
      } catch (err) {
        console.error(err);
        toast.error('Failed to update status');
      } finally {
        setUpdatingOrderId(null);
      }
    }
  };

  const sendWhatsAppPaymentRequest = (order, upiId) => {
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

  const downloadInvoice = async (order) => {
    const showPrice = order.gifts?.show_price !== false;
    const isPaid = order.order_status !== 'Pending' && order.order_status !== 'Cancelled';
    const orderRef = `#HB-${order.order_id.substring(0, 8).toUpperCase()}`;
    const orderUpi = order.selected_upi || 'N/A';
    
    // Get logo as base64 for embedding
    const logoBase64 = await getLogoBase64();
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${orderRef}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Outfit', 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; margin: 0; line-height: 1.5; background: #fff; position: relative; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; z-index: 0; pointer-events: none; }
    .watermark img { width: 320px; height: 320px; object-fit: contain; }
    .content { position: relative; z-index: 1; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8B5CF6; padding-bottom: 20px; margin-bottom: 30px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-logo { width: 48px; height: 48px; object-fit: contain; border-radius: 10px; }
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
    .badge.unpaid { background: #fee2e2; color: #991b1b; }
    .badge.cancelled { background: #fee2e2; color: #991b1b; }
    .footer { clear: both; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 80px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <!-- Watermark -->
  ${logoBase64 ? `<div class="watermark"><img src="${logoBase64}" alt="Watermark" /></div>` : ''}
  
  <div class="content">
  <div class="header">
    <div class="header-left">
      ${logoBase64 ? `<img src="${logoBase64}" alt="HamperBox Logo" class="header-logo" />` : ''}
      <div>
        <div class="logo">HamperBox</div>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 550;">Premium Gifting Platform</p>
      </div>
    </div>
    <div style="text-align: right;">
      <div class="title">OFFICIAL INVOICE</div>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Ref: ${orderRef}</p>
    </div>
  </div>

  <div class="details">
    <div>
      <h3>Order Information</h3>
      <p><strong>Order Ref:</strong> ${orderRef}</p>
      <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p><strong>Payment Status:</strong> 
        ${showPrice ? `
        <span class="badge ${isPaid ? 'paid' : order.order_status === 'Cancelled' ? 'cancelled' : 'unpaid'}">
          ${isPaid ? 'PAID via UPI' : order.order_status === 'Cancelled' ? 'CANCELLED' : 'NOT PAID'}
        </span>
        ` : `
        <span class="badge unpaid">Contact for Price</span>
        `}
      </p>
      ${showPrice && orderUpi !== 'N/A' ? `<p><strong>Associated UPI ID:</strong> ${orderUpi}</p>` : ''}
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
      <span>${isPaid ? 'Total Paid:' : 'Total Due:'}</span>
      <span>₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
    </div>
    ${!isPaid ? `<div style="text-align: center; margin-top: 12px;"><span class="badge unpaid" style="font-size: 12px; padding: 6px 16px;">⚠ NOT PAID</span></div>` : ''}
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
  </div>
</body>
</html>
    `;

    // Create a temporary container for PDF rendering
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px'; // A4 width in px at 96dpi
    document.body.appendChild(container);

    try {
      const opt = {
        margin: 0,
        filename: `Invoice-${orderRef.replace('#', '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(container).save();
      toast.success('Invoice PDF generated successfully!');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF');
    } finally {
      document.body.removeChild(container);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find(o => o.order_id === orderId);
    
    // If changing to Confirmed and no UPI is locked, prompt for UPI selection
    if (newStatus === 'Confirmed' && order && !order.upi_locked && order.order_status === 'Pending') {
      openUpiModal(order, 'markpaid');
      return;
    }

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
                          o.gifts?.gift_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.addresses?.phone_number?.includes(searchQuery);
    
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
          <div className="relative w-full md:max-w-xs flex items-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl">
            <Search className="w-4.5 h-4.5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by ID, name, phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs focus:outline-none text-slate-900 dark:text-white w-full"
            />
          </div>

          {/* Status selector filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto text-xs text-slate-550">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
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
                  <th className="py-4 px-6">UPI</th>
                  <th className="py-4 px-6">Current Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">Loading orders...</td>
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
                        <p className="text-slate-500 dark:text-slate-400 truncate">{order.addresses?.address_line1}, {order.addresses?.city}</p>
                        <p className="text-slate-500 dark:text-slate-400">{order.addresses?.phone_number}</p>
                      </td>
                      <td className="py-4 px-6">
                        {order.upi_locked && order.selected_upi ? (
                          <div className="flex items-center space-x-1">
                            <Lock className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{order.selected_upi}</span>
                          </div>
                        ) : order.selected_upi ? (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{order.selected_upi}</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-y-2">
                        <div className="flex justify-end gap-1.5 mb-1.5">
                          <button
                            onClick={() => {
                              if (upiIds.length === 0) {
                                toast.error('Please add UPI IDs in Settings first');
                                return;
                              }
                              openUpiModal(order, 'whatsapp');
                            }}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                            title="Send WhatsApp Payment Details"
                          >
                            <span>WhatsApp Pay</span>
                          </button>
                          <button
                            onClick={() => downloadInvoice(order)}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                            title="Download PDF Invoice"
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
                                onClick={() => {
                                  if (upiIds.length === 0) {
                                    toast.error('Please add UPI IDs in Settings first');
                                    return;
                                  }
                                  openUpiModal(order, 'markpaid');
                                }}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-bold shadow-sm transition-colors cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                            <select
                              value={order.order_status}
                              onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                              className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-900 dark:text-white focus:outline-none focus:border-primary"
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
                    <td colSpan={7} className="py-10 text-center text-slate-450">No orders found.</td>
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
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* UPI Selection Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-3xl space-y-5 animate-zoomIn">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-serif font-bold text-slate-950 dark:text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span>Select UPI ID</span>
              </h3>
              <button
                onClick={() => setShowUpiModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-slate-400">
              {upiModalAction === 'whatsapp' 
                ? 'Choose the UPI ID to include in the WhatsApp payment message.'
                : 'Choose the UPI ID for this payment. This will be locked on the invoice after confirmation.'}
            </p>

            <div className="space-y-2">
              {upiIds.map((u) => (
                <label
                  key={u.upi_id}
                  className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedUpiForModal === u.upi_address
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <input
                    type="radio"
                    name="upi_select"
                    value={u.upi_address}
                    checked={selectedUpiForModal === u.upi_address}
                    onChange={(e) => setSelectedUpiForModal(e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{u.upi_address}</p>
                    {u.label && <p className="text-[10px] text-slate-400">{u.label}</p>}
                  </div>
                  {u.is_default && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[8px] font-bold bg-primary/10 text-primary">DEFAULT</span>
                  )}
                </label>
              ))}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpiModalConfirm}
                disabled={!selectedUpiForModal}
                className="w-1/2 py-3 text-white bg-slate-900 hover:bg-primary transition-all rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40"
              >
                {upiModalAction === 'whatsapp' ? 'Send Payment' : 'Confirm & Lock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrdersManage;
