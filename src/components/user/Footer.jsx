import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Gift, ShieldCheck, Truck, Sparkles, MessageCircle } from 'lucide-react';
import { api } from '../../services/api';

// Inline SVGs for brand icons not in this lucide-react version
const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

export const Footer = () => {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    instagram_url: '',
    facebook_url: ''
  });

  useEffect(() => {
    api.getSiteSettings().then(s => {
      if (s) setSettings(s);
    }).catch(() => {});
  }, []);

  const whatsappHref = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`
    : null;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 text-slate-650 dark:text-slate-400 transition-colors duration-300">

      {/* Brand Values Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-900 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Premium Selection</h4>
              <p className="text-xs text-slate-450 dark:text-slate-500">Curated luxury items</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-secondary/10 dark:bg-secondary/20 text-secondary">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Custom Gift Wraps</h4>
              <p className="text-xs text-slate-450 dark:text-slate-500">Elegant presentation</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Express Delivery</h4>
              <p className="text-xs text-slate-450 dark:text-slate-500">Safe, direct, and swift</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white text-sm">100% Trust Guarantee</h4>
              <p className="text-xs text-slate-450 dark:text-slate-500">Hassle-free replacements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand Block */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center space-x-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary text-white font-bold text-sm">
                H
              </span>
              <span className="text-xl font-bold font-serif bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                HampBox
              </span>
            </Link>
            <p className="text-sm max-w-xs leading-relaxed text-slate-500 dark:text-slate-450">
              HampBox makes gifting effortless and premium. Thoughtfully curated gourmet boxes, self-care hampers, and corporate gift assemblies.
            </p>

            {/* Social Icons — pulled from site settings */}
            <div className="flex items-center gap-3 pt-1">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                </a>
              )}
              {settings.instagram_url && settings.instagram_url !== 'https://instagram.com' && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 hover:bg-fuchsia-500/20 transition-colors"
                  title="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {settings.facebook_url && settings.facebook_url !== 'https://facebook.com' && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                  title="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-850 dark:text-white text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gifts" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400">
                  Browse Gifts
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400">
                  Track My Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Reach */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-850 dark:text-white text-sm uppercase tracking-wider">
              Get In Touch
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
              Have a question or need a custom hamper? Reach out to us directly.
            </p>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>
            © {new Date().getFullYear()} HampBox.{' '}
            {/* Secret admin login — looks like plain copyright text */}
            <Link
              to="/profile"
              className="cursor-default select-none hover:text-slate-400 dark:hover:text-slate-500 transition-colors"
            >
              All rights reserved.
            </Link>
          </p>
          <div className="flex items-center space-x-1 text-slate-400">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-secondary fill-secondary mx-0.5" />
            <span>for gifting.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
