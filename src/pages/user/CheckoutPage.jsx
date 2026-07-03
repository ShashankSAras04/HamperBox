import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, ShoppingBag, ArrowLeft, CheckCircle2, Trash2, Plus, Minus } from 'lucide-react';
import { SEO } from '../../components/seo/SEO';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    recipient_name: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!form.recipient_name.trim()) tempErrors.recipient_name = 'Name is required';
    if (!form.phone_number.trim()) tempErrors.phone_number = 'Phone number is required';
    else if (!/^[0-9]{10}$/.test(form.phone_number)) tempErrors.phone_number = 'Enter a valid 10-digit phone number';
    
    if (!form.address_line1.trim()) tempErrors.address_line1 = 'Address line 1 is required';
    if (!form.city.trim()) tempErrors.city = 'City is required';
    if (!form.state.trim()) tempErrors.state = 'State is required';
    if (!form.pincode.trim()) tempErrors.pincode = 'Pincode is required';
    else if (!/^[0-9]{6}$/.test(form.pincode)) tempErrors.pincode = 'Enter a valid 6-digit pin';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }
    setIsValidatingCoupon(true);
    try {
      const coupon = await api.validateCoupon(couponCode.trim());
      if (coupon) {
        setAppliedCoupon(coupon);
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
          discount = (cartTotal * parseFloat(coupon.discount_value)) / 100;
        } else if (coupon.discount_type === 'fixed') {
          discount = parseFloat(coupon.discount_value);
        }
        setDiscountAmount(discount);
        toast.success(`Promo code "${coupon.code}" applied!`);
      } else {
        toast.error('Invalid or inactive promo code');
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to validate promo code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Real-time numeric constraints
    if (name === 'pincode') {
      value = value.replace(/[^\d]/g, '').substring(0, 6);
    }
    if (name === 'phone_number') {
      value = value.replace(/[^\d]/g, '').substring(0, 10);
    }

    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!validate()) return;

    const targetUserId = user ? user.user_id : null; // Use null for guest checkout

    // Record coupon applied in shipping details notes (address_line2)
    const finalForm = { ...form };
    if (appliedCoupon) {
      const couponNote = `[Promo Applied: ${appliedCoupon.code} (-₹${discountAmount.toLocaleString('en-IN')})]`;
      finalForm.address_line2 = finalForm.address_line2 
        ? `${finalForm.address_line2} ${couponNote}`
        : couponNote;
    }

    setIsSubmitting(true);
    try {
      // Place orders for each item in the cart, distributing coupon discount proportionally
      const orderPromises = cart.map(item => {
        const itemSubtotal = item.gift_price * item.quantity;
        const proportionalDiscount = cartTotal > 0 ? (itemSubtotal / cartTotal) * discountAmount : 0;
        const itemFinalTotal = Math.max(itemSubtotal - proportionalDiscount, 0);

        return api.createOrder({
          user_id: targetUserId,
          gift_id: item.gift_id,
          quantity: item.quantity,
          total_amount: itemFinalTotal,
          address: finalForm
        });
      });

      const placedOrders = await Promise.all(orderPromises);
      const mainOrder = placedOrders[0];

      setCreatedOrderNumber(mainOrder.order_id.substring(0, 8).toUpperCase());

      setOrderSuccess(true);
      clearCart();
      toast.success('Order placed successfully!', {
        icon: '🎉',
        style: {
          borderRadius: '16px',
          background: '#333',
          color: '#fff'
        }
      });
    } catch (err) {
      console.error('Order submission error:', err);
      const msg = err?.message || err?.details || 'Unknown error';
      toast.error(`Order failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/30 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-md w-full p-8 text-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-xl space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">Order Confirmed!</h2>
            <p className="text-slate-500 text-sm">Thank you for shopping with HampBox. Your premium gifts are being assembled with care.</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 rounded-2xl">
            <p className="text-xs text-slate-400">Order Reference</p>
            <p className="text-lg font-bold text-slate-800 dark:text-white tracking-widest mt-1">#HB-{createdOrderNumber}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/orders"
              className="py-3.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all cursor-pointer"
            >
              Track Order Status
            </Link>
            <Link
              to="/"
              className="py-3.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-16 transition-colors duration-300">
      <SEO title="Secure Checkout" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex items-center space-x-3 mb-12">
          <Link to="/gifts" className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-450 hover:text-slate-700 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">Secure Checkout</h1>
            <p className="text-xs text-slate-400">Verify your items and delivery destination</p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Your bag is empty</h3>
            <p className="text-xs text-slate-500">Add some luxury hampers before checking out.</p>
            <Link to="/gifts" className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-lg shadow-primary/10 transition-colors">
              Browse Hampers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Delivery Details Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-850 dark:text-white font-serif flex items-center space-x-2">
                <Truck className="w-5 h-5 text-primary" />
                <span>Recipient Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Recipient Name</label>
                  <input
                    type="text"
                    name="recipient_name"
                    value={form.recipient_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white transition-all ${
                      errors.recipient_name ? 'border-rose-450' : 'border-slate-200/50 dark:border-slate-800'
                    }`}
                    placeholder="E.g. John Doe"
                  />
                  {errors.recipient_name && <p className="text-[10px] text-rose-500">{errors.recipient_name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Contact Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleInputChange}
                    maxLength={10}
                    inputMode="numeric"
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white transition-all ${
                      errors.phone_number ? 'border-rose-450' : 'border-slate-200/50 dark:border-slate-800'
                    }`}
                    placeholder="10-digit number (e.g. 9876543210)"
                  />
                  {errors.phone_number && <p className="text-[10px] text-rose-500">{errors.phone_number}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Street Address Line 1</label>
                <input
                  type="text"
                  name="address_line1"
                  value={form.address_line1}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white transition-all ${
                    errors.address_line1 ? 'border-rose-450' : 'border-slate-200/50 dark:border-slate-800'
                  }`}
                  placeholder="Flat, House no., Apartment, Building"
                />
                {errors.address_line1 && <p className="text-[10px] text-rose-500">{errors.address_line1}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Street Address Line 2 (Optional)</label>
                <input
                  type="text"
                  name="address_line2"
                  value={form.address_line2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white transition-all"
                  placeholder="Area, Colony, Street, Sector, Landmark"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white transition-all ${
                      errors.city ? 'border-rose-450' : 'border-slate-200/50 dark:border-slate-800'
                    }`}
                  />
                  {errors.city && <p className="text-[10px] text-rose-500">{errors.city}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">State / Region</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white transition-all ${
                      errors.state ? 'border-rose-450' : 'border-slate-200/50 dark:border-slate-800'
                    }`}
                  />
                  {errors.state && <p className="text-[10px] text-rose-500">{errors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Pincode / ZIP</label>
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white transition-all ${
                      errors.pincode ? 'border-rose-450' : 'border-slate-200/50 dark:border-slate-800'
                    }`}
                    placeholder="E.g. 500033"
                  />
                  {errors.pincode && <p className="text-[10px] text-rose-500">{errors.pincode}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white text-slate-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              {!user && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-2xl text-xs text-amber-700 dark:text-amber-300 font-medium">
                  You are checking out as a **Guest**. You will be able to track your order status using your contact number.
                </div>
              )}
            </form>

            {/* Order Summary Panel */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-850 dark:text-white font-serif flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <span>Order Summary</span>
                </h3>

                {/* Items List with remove & qty controls */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.gift_id} className="py-3 flex space-x-3 items-center">
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={item.gift_image ? item.gift_image.split(',')[0] : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=200'}
                          alt={item.gift_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Name + price */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white font-serif truncate">{item.gift_name}</h4>
                        <span className="text-[10px] text-slate-450 font-medium">
                          {item.show_price === false ? (
                            <span className="text-primary uppercase font-semibold">Contact Us</span>
                          ) : (
                            `₹${(item.gift_price * item.quantity).toLocaleString('en-IN')}`
                          )}
                        </span>
                      </div>

                      {/* Quantity controls + remove */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.gift_id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 dark:text-white w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.gift_id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.gift_id)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promo Code</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="ENTER CODE (e.g. WELCOME10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={appliedCoupon !== null}
                      className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white uppercase placeholder:normal-case focus:outline-none focus:border-primary disabled:opacity-60"
                    />
                    {appliedCoupon ? (
                      <button
                        onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); setCouponCode(''); }}
                        className="px-3 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-slate-900 text-white hover:bg-primary rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40 transition-colors"
                      >
                        {isValidatingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-[10px] text-emerald-600 font-semibold">
                      🎉 Promo Code "{appliedCoupon.code}" applied! You saved ₹{discountAmount.toLocaleString('en-IN')}.
                    </p>
                  )}
                </div>

                <hr className="border-slate-250 dark:border-slate-800" />

                {/* Pricing Summary */}
                <div className="space-y-2.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-500 font-semibold">
                      <span>Promo Discount</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="font-semibold text-emerald-550 dark:text-emerald-450 uppercase tracking-widest text-[9px]">Free Shipping</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST)</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350">Included</span>
                  </div>
                  <hr className="border-slate-100 dark:border-slate-800/80 my-2" />
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1">
                    <span>Total Amount</span>
                    <span>₹{Math.max(cartTotal - discountAmount, 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isSubmitting ? 'Processing Order...' : 'Confirm Order & Pay'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
