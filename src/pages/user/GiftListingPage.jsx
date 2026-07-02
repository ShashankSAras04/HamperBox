import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Gift, ArrowRight } from 'lucide-react';
import { SEO } from '../../components/seo/SEO';
import { api } from '../../services/api';
import { HamperCardSkeleton } from '../../components/common/Skeletons';

export const GiftListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gifts, setGifts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-asc' | 'price-desc'
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [selectedType, setSelectedType] = useState(''); // '' | 'hamper' | 'item'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [giftsData, catsData] = await Promise.all([
          api.getGifts(true), // active only
          api.getCategories()
        ]);
        setGifts(giftsData);
        setCategories(catsData);

        // Find max price for slider initialization
        if (giftsData.length > 0) {
          const prices = giftsData.map(g => parseFloat(g.gift_price));
          setMaxPrice(Math.max(...prices));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Update filter if URL changes
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat !== null) {
      setSelectedCategory(urlCat);
    }
  }, [searchParams]);

  // Handle Category Filter change
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
    setCurrentPage(1);
  };

  // Filtered & Sorted Gifts
  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.gift_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          gift.gift_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? gift.category_id === selectedCategory : true;
    const matchesPrice = parseFloat(gift.gift_price) <= maxPrice;
    const matchesType = selectedType ? (gift.type || 'hamper') === selectedType : true;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return parseFloat(a.gift_price) - parseFloat(b.gift_price);
    if (sortBy === 'price-desc') return parseFloat(b.gift_price) - parseFloat(a.gift_price);
    // default 'newest': sort by date
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Pagination math
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGifts = filteredGifts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGifts.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-16 transition-colors duration-300">
      <SEO title="Luxury Gift Hampers Collection" description="Explore HamperBox's premium collection of gift boxes, gourmet chocolate baskets, and corporate desk packages." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Exquisite Gift Hampers
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Handpicked combinations wrapped in signature premium boxes to celebrate special milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* 1. Sidebar Filters (Desktop) */}
          <div className="hidden lg:block space-y-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl h-fit">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <SlidersHorizontal className="w-4.5 h-4.5 text-primary" />
              <span>Filters</span>
            </h3>

            {/* Product Type selection */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-700 dark:text-slate-350 text-sm">Product Type</h4>
              <div className="space-y-2">
                <button
                  onClick={() => { setSelectedType(''); setCurrentPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    selectedType === ''
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                      : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  All Products
                </button>
                <button
                  onClick={() => { setSelectedType('hamper'); setCurrentPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    selectedType === 'hamper'
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                      : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Luxury Gift Hampers
                </button>
                <button
                  onClick={() => { setSelectedType('item'); setCurrentPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    selectedType === 'item'
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                      : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Individual Gift Items
                </button>
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-700 dark:text-slate-350 text-sm">Categories</h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  All Hampers
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.category_id}
                    onClick={() => handleCategoryChange(cat.category_id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      selectedCategory === cat.category_id
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.category_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-slate-700 dark:text-slate-350 text-sm">Max Price</h4>
                <span className="text-xs font-bold text-primary">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(parseInt(e.target.value)); setCurrentPage(1); }}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-450">
                <span>₹500</span>
                <span>₹10,000</span>
              </div>
            </div>
          </div>

          {/* 2. Listing Area */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Search & Sort Panel */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl">
              
              {/* Search input */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hampers..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white transition-all"
                />
              </div>

              {/* Sort drop menu */}
              <div className="flex space-x-3 w-full sm:w-auto justify-end items-center">
                <span className="text-xs text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-xs focus:outline-none focus:border-primary dark:text-white"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                  className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650"
                >
                  <SlidersHorizontal className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Mobile Filters Drawer */}
            {showFiltersMobile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="lg:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6"
              >
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm dark:text-white">Product Type</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setSelectedType(''); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        selectedType === ''
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      All Products
                    </button>
                    <button
                      onClick={() => { setSelectedType('hamper'); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        selectedType === 'hamper'
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Hampers
                    </button>
                    <button
                      onClick={() => { setSelectedType('item'); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        selectedType === 'item'
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Gift Items
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm dark:text-white">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        !selectedCategory
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.category_id}
                        onClick={() => handleCategoryChange(cat.category_id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          selectedCategory === cat.category_id
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cat.category_name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm dark:text-white">Max Price</h4>
                    <span className="text-xs font-bold text-primary">₹{maxPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="250"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(parseInt(e.target.value)); setCurrentPage(1); }}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </motion.div>
            )}

            {/* Grid of Hampers */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <HamperCardSkeleton />
                <HamperCardSkeleton />
                <HamperCardSkeleton />
              </div>
            ) : currentGifts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {currentGifts.map((gift) => (
                  <div
                    key={gift.gift_id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                        <img
                          src={gift.gift_image ? gift.gift_image.split(',')[0] : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400'}
                          alt={gift.gift_name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-950/95 shadow-sm text-[10px] font-bold text-primary tracking-wider uppercase">
                          {gift.categories?.category_name || 'Gifting'}
                        </span>
                      </div>

                      <div className="p-6 space-y-2">
                        <h3 className="text-lg font-bold text-slate-850 dark:text-white font-serif group-hover:text-primary transition-colors">
                          {gift.gift_name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {gift.gift_description}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 flex justify-between items-center mt-4">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {gift.show_price === false ? (
                          <span className="text-[11px] text-primary font-semibold tracking-wide uppercase">Price on Request</span>
                        ) : (
                          `₹${parseFloat(gift.gift_price).toLocaleString('en-IN')}`
                        )}
                      </span>
                      <Link
                        to={`/gifts/${gift.gift_id}`}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-primary dark:bg-slate-800 dark:hover:bg-primary transition-all flex items-center space-x-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-105 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">No hampers found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                  We couldn't find any hampers matching your filters. Try adjusting your search query, selecting another category, or raising the price slider.
                </p>
              </div>
            )}

            {/* Pagination Toolbar */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 pt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      currentPage === idx + 1
                        ? 'bg-primary text-white shadow-lg shadow-primary/10'
                        : 'border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
