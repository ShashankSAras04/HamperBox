import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Gift, Sparkles, Smile, ShieldCheck, Heart } from 'lucide-react';
import { SEO } from '../../components/seo/SEO';
import { api } from '../../services/api';
import { HamperCardSkeleton } from '../../components/common/Skeletons';

export const LandingPage = () => {
  const [featuredGifts, setFeaturedGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Banner Layout States
  const [heroBanner, setHeroBanner] = useState(null);
  const [promoBanner, setPromoBanner] = useState(null);
  const [footerBanner, setFooterBanner] = useState(null);

  // Settings State
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Parallel data loading
        const [giftsData, bannersData, settingsData] = await Promise.all([
          api.getGifts(true),
          api.getBanners(),
          api.getSiteSettings()
        ]);
        
        const featured = giftsData.filter(g => g.is_featured === true);
        setFeaturedGifts(featured.length > 0 ? featured.slice(0, 3) : giftsData.slice(0, 3));
        
        setHeroBanner(bannersData.find(b => b.layout_position === 'hero') || null);
        setPromoBanner(bannersData.find(b => b.layout_position === 'promo') || null);
        setFooterBanner(bannersData.find(b => b.layout_position === 'footer') || null);
        
        setSettings(settingsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  const reviews = [
    { name: 'Aarav Mehta', role: 'Corporate Director', comment: 'Ordered corporate gift boxes for my team. The feedback was phenomenal. Extremely premium packaging!', rating: 5 },
    { name: 'Priya Sen', role: 'Loyal Customer', comment: 'The Sweet Delight Hamper is my go-to gift for birthdays. Hand-picked dark chocolates are to die for.', rating: 5 },
    { name: 'Vikram Malhotra', role: 'Interior Designer', comment: 'Outstanding customer support. They customized the lavender spa box for my anniversary, and my wife loved it.', rating: 5 }
  ];

  const instagramPosts = [
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1549007994-cb92ca8a3bd0?auto=format&fit=crop&q=80&w=300'
  ];

  return (
    <div className="overflow-hidden">
      <SEO title="Luxury Custom Gift Hampers" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-tr from-slate-50 via-purple-50/30 to-pink-50/20 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 pt-20 pb-16">
        
        {/* Animated Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 dark:bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-8 text-center lg:text-left"
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Art of Premium Gifting</span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-serif leading-tight text-slate-900 dark:text-white tracking-tight">
                Make Every <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Occasion Special</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-650 dark:text-slate-400 max-w-xl leading-relaxed">
                Elevate your expressions of love, appreciation, and partnership with our handcrafted, luxury hampers wrapped in elegance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/gifts"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/categories"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-all flex items-center justify-center"
                >
                  Browse Categories
                </Link>
              </div>
            </motion.div>

            {/* Right Hero Image Column */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 transform rotate-2 hover:rotate-0 transition-transform duration-500 animate-float">
                {heroBanner?.link_url ? (
                  <Link to={heroBanner.link_url} className="block w-full h-full">
                    <img
                      src={heroBanner.image_url}
                      alt="HampBox Luxury Gift"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                ) : (
                  <img
                    src={heroBanner?.image_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600"}
                    alt="HampBox Luxury Gift"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-8 pointer-events-none">
                  <div className="text-white">
                    <p className="text-xs uppercase tracking-widest text-secondary font-semibold">Featured</p>
                    <h3 className="text-2xl font-bold font-serif mt-1">Signature Selection</h3>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Hampers Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 dark:text-white">
              Best Selling Hampers
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Our customers' absolute favorites, assembled with premium items.
            </p>
          </div>
          <Link to="/gifts" className="text-primary hover:text-secondary font-medium transition-colors flex items-center space-x-1.5 mt-4 md:mt-0">
            <span>View all hampers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HamperCardSkeleton />
            <HamperCardSkeleton />
            <HamperCardSkeleton />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {featuredGifts.map((gift) => (
              <motion.div
                key={gift.gift_id}
                variants={itemVariants}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={gift.gift_image ? gift.gift_image.split(',')[0] : 'https://images.unsplash.com/photo-1549007994-cb92ca8a3bd0?auto=format&fit=crop&q=80&w=400'}
                    alt={gift.gift_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-950/95 shadow-sm text-xs font-semibold text-primary">
                    {gift.categories?.category_name || 'Premium'}
                  </span>
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif group-hover:text-primary transition-colors">
                    {gift.gift_name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {gift.gift_description}
                  </p>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {gift.show_price === false ? (
                        <span className="text-xs text-primary font-medium tracking-wide uppercase">Price on Request</span>
                      ) : (
                        `₹${parseFloat(gift.gift_price).toLocaleString('en-IN')}`
                      )}
                    </span>
                    <Link
                      to={`/gifts/${gift.gift_id}`}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-primary dark:bg-slate-800 dark:hover:bg-primary transition-all flex items-center space-x-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Dynamic Promo Banner */}
      {promoBanner && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Link to={promoBanner.link_url || "/gifts"} className="block overflow-hidden rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-200/50 dark:border-slate-800/50">
            <img src={promoBanner.image_url} alt="Special Promotion" className="w-full object-cover h-[180px] md:h-[220px]" />
          </Link>
        </section>
      )}

      {/* Why Choose Section */}
      <section className="bg-slate-100/50 dark:bg-slate-900/40 border-y border-slate-200/40 dark:border-slate-900/60 py-24 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 dark:text-white">
              Why Choose HampBox
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              We stand for luxury, dependability, and beautiful expressions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/45 dark:border-slate-850 p-8 rounded-3xl shadow-sm text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">Curation by Experts</h3>
              <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
                Every hamper is styled and put together by experienced floral and culinary artists to deliver absolute luxury.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/45 dark:border-slate-850 p-8 rounded-3xl shadow-sm text-center space-y-4">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">Glow & Spa Collections</h3>
              <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
                Indulge in organic skincare wellness sets, aromatherapy candles, and wellness details designed for ultimate peace.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/45 dark:border-slate-850 p-8 rounded-3xl shadow-sm text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">Personalization</h3>
              <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
                Add hand-written luxury lettercards, custom recipient tags, or alter products to fit your brand guidelines perfectly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 dark:text-white">
            Loved by Givers and Receivers
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            See what our customers have to say about their HampBox experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-3xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex text-amber-400 space-x-1">
                  {Array.from({ length: rev.rating }).map((_, rIdx) => (
                    <Star key={rIdx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm italic text-slate-600 dark:text-slate-350 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{rev.name}</h4>
                <p className="text-xs text-slate-450 dark:text-slate-500">{rev.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Footer Banner */}
      {footerBanner && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Link to={footerBanner.link_url || "/gifts"} className="block overflow-hidden rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-200/50 dark:border-slate-800/50">
            <img src={footerBanner.image_url} alt="Shop Collection" className="w-full object-cover h-[220px] md:h-[280px]" />
          </Link>
        </section>
      )}

      {/* Instagram Grid */}
      <section className="border-t border-slate-100 dark:border-slate-900/80 py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center justify-center space-x-2">
              <Heart className="w-5 h-5 text-secondary fill-secondary" />
              <span>Share the Joy</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Follow us on Instagram <a href={settings?.instagram_url || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">@HampBoxGifting</a> and tag your unboxings.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {instagramPosts.map((post, idx) => (
              <div key={idx} className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                <img
                  src={post}
                  alt={`Instagram Showcase ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                  View Post
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
