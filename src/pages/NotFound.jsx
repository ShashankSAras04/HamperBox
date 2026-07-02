import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { SEO } from '../components/seo/SEO';

export const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <SEO title="Page Not Found" />

      <div className="max-w-md w-full p-8 text-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-xl space-y-6 glass">
        
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto"
        >
          <HelpCircle className="w-10 h-10 animate-pulse" />
        </motion.div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold font-serif bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white font-serif">
            Page Not Found
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            The gift box you are looking for might have been opened, moved, or deleted. Let's get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 w-full py-3.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to HamperBox Home</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
export default NotFound;
