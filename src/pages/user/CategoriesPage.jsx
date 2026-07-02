import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Gift, ChevronRight } from 'lucide-react';
import { SEO } from '../../components/seo/SEO';
import { api } from '../../services/api';
import { CategoryCardSkeleton } from '../../components/common/Skeletons';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catsData, giftsData] = await Promise.all([
          api.getCategories(),
          api.getGifts(true) // active only
        ]);
        setCategories(catsData);
        setGifts(giftsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getGiftsCount = (catId) => {
    return gifts.filter(g => g.category_id === catId).length;
  };

  const filteredCategories = categories.filter(cat =>
    cat.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.category_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-16">
      <SEO title="Browse Gift Categories" description="Explore our luxury range of gourmet chocolates, premium spa collections, and corporate gift hampers." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Curated Gifting Collections
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Select a collection to browse premium handcrafted boxes tailored for your loved ones.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:text-white transition-all"
            />
          </div>
        </div>

        {/* Main Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
          </div>
        ) : filteredCategories.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {filteredCategories.map((cat, idx) => {
              const giftCount = getGiftsCount(cat.category_id);
              return (
                <motion.div
                  key={cat.category_id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    {/* Category Image */}
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 dark:border-slate-800">
                      <img
                        src={cat.category_image || 'https://images.unsplash.com/photo-1549007994-cb92ca8a3bd0?auto=format&fit=crop&q=80&w=400'}
                        alt={cat.category_name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-550"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Text Details */}
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white font-serif">
                        {cat.category_name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {cat.category_description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-450 dark:text-slate-550 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-1">
                      <Gift className="w-3.5 h-3.5" />
                      <span>{giftCount} {giftCount === 1 ? 'Gift' : 'Gifts'}</span>
                    </span>
                    <button
                      onClick={() => navigate(`/gifts?category=${cat.category_id}`)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-800 hover:bg-primary dark:hover:bg-primary text-white flex items-center space-x-1 cursor-pointer transition-all hover:translate-x-0.5"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-450">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No categories found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-450">
              We couldn't find any collection matching your search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
