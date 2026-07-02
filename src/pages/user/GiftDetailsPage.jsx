import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Gift, ShieldCheck, Truck, Sparkles, RefreshCw, ShoppingCart, ArrowLeft, PackageCheck } from 'lucide-react';
import { SEO } from '../../components/seo/SEO';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { DetailsSkeleton } from '../../components/common/Skeletons';
import toast from 'react-hot-toast';

export const GiftDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [gift, setGift] = useState(null);
  const [items, setItems] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const giftData = await api.getGiftById(id);
        if (giftData) {
          setGift(giftData);
          const imgList = giftData.gift_image ? giftData.gift_image.split(',') : [];
          setActiveImage(imgList[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800');
          
          // Fetch included items and related products concurrently
          const [itemsData, allGifts] = await Promise.all([
            api.getGiftItems(id),
            api.getGifts(true)
          ]);
          setItems(itemsData);
          
          const filteredRelated = allGifts.filter(g =>
            g.category_id === giftData.category_id && g.gift_id !== id
          );
          setRelated(filteredRelated.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!gift) return;
    addToCart(gift, quantity);
    toast.success(`${gift.gift_name} added to cart!`, {
      style: {
        borderRadius: '16px',
        background: '#333',
        color: '#fff',
        fontSize: '13px'
      }
    });
  };

  const handleOrderNow = () => {
    if (!gift) return;
    addToCart(gift, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <DetailsSkeleton />
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-serif">Gift Not Found</h2>
        <p className="text-slate-500">The product you are trying to view does not exist or has been disabled.</p>
        <Link to="/gifts" className="text-primary hover:underline font-semibold flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to shop</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950 py-16">
      
      {/* Dynamic SEO Tags */}
      <SEO
        title={gift.gift_name}
        description={gift.gift_description}
        ogImage={gift.gift_image}
        schemaType="Product"
        schemaData={{
          name: gift.gift_name,
          image: gift.gift_image,
          description: gift.gift_description,
          offers: {
            '@type': 'Offer',
            'priceCurrency': 'INR',
            'price': gift.gift_price,
            'availability': 'https://schema.org/InStock'
          }
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          to="/gifts"
          className="inline-flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-850 dark:hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </Link>

        {/* Product Details Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Gallery Image Panel */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/50 dark:border-slate-800 shadow-lg">
              <img
                src={activeImage}
                alt={gift.gift_name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>
            {/* Gallery Thumbnail Switcher */}
            {gift.gift_image && gift.gift_image.split(',').length > 1 && (
              <div className="flex space-x-3 overflow-x-auto py-1">
                {gift.gift_image.split(',').map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0 ${
                      activeImage === img ? 'border-primary ring-2 ring-primary/20 scale-95' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                {gift.categories?.category_name || 'Gift Hamper'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-serif">
                {gift.gift_name}
              </h1>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {gift.show_price === false ? (
                  <span className="text-lg text-primary font-medium tracking-wide uppercase">Price on Request</span>
                ) : (
                  `₹${parseFloat(gift.gift_price).toLocaleString('en-IN')}`
                )}
              </p>
            </div>

            <hr className="border-slate-200/55 dark:border-slate-850" />

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                {gift.gift_description}
              </p>
            </div>

            {/* Included Items Section */}
            {gift.type !== 'item' && items.length > 0 && (
              <div className="space-y-4 bg-slate-100/50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center space-x-2">
                  <PackageCheck className="w-4.5 h-4.5 text-primary" />
                  <span>What's Included In This Box:</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-650 dark:text-slate-400">
                  {items.map((item) => (
                    <li key={item.item_id} className="flex items-center space-x-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
                      <span>{item.item_name} <span className="font-bold text-slate-800 dark:text-white">(Qty: {item.quantity})</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector & Order Buttons */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-500">Quantity:</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
                    className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center space-x-2 cursor-pointer dark:text-white"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span>Add to Bag</span>
                </button>
                <button
                  onClick={handleOrderNow}
                  className="w-full py-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/10 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Order Now</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-200/55 dark:border-slate-850" />

            {/* Delivery Policies */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
              <div className="space-y-1">
                <div className="flex justify-center sm:justify-start text-primary"><Truck className="w-5 h-5" /></div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-2">Next Day Delivery</h4>
                <p className="text-[10px] text-slate-500">Available in select metro areas</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-center sm:justify-start text-secondary"><Sparkles className="w-5 h-5" /></div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-2">Gift Wrapped</h4>
                <p className="text-[10px] text-slate-500">Assembled in our signature gold box</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-center sm:justify-start text-emerald-500"><ShieldCheck className="w-5 h-5" /></div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-2">Guaranteed Safe</h4>
                <p className="text-[10px] text-slate-500">Safe packaging and handoffs</p>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-slate-200/60 dark:border-slate-900">
            <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((item) => (
                <div
                  key={item.gift_id}
                  className="group bg-white dark:bg-slate-900 border border-slate-200/55 dark:border-slate-850 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={item.gift_image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400'}
                      alt={item.gift_name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <h4 className="font-bold text-base text-slate-850 dark:text-white font-serif line-clamp-1">{item.gift_name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.show_price === false ? (
                          <span className="text-primary font-medium">Price on Request</span>
                        ) : (
                          `₹${parseFloat(item.gift_price).toLocaleString('en-IN')}`
                        )}
                      </p>
                    </div>
                    <Link
                      to={`/gifts/${item.gift_id}`}
                      className="mt-4 text-xs font-semibold text-primary hover:text-secondary transition-colors inline-flex items-center space-x-1"
                    >
                      <span>View details</span>
                      <ArrowLeft className="w-3 h-3 rotate-180" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
