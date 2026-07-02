import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Gift, PackageOpen, ClipboardList, Users, ArrowLeft, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.webp';

export const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Categories', path: '/admin/categories', icon: FolderKanban },
    { name: 'Gifts (Hampers)', path: '/admin/gifts', icon: Gift },
    { name: 'Orders Management', path: '/admin/orders', icon: ClipboardList },
    { name: 'Customers List', path: '/admin/users', icon: Users },
    { name: 'Site Settings', path: '/admin/settings', icon: Settings }
  ];

  const isPathActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800 flex-shrink-0">
      
      {/* Brand Heading */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <Link to="/" className="flex items-center space-x-2.5">
          <img src={logo} alt="HamperBox Logo" className="w-8 h-8 object-contain rounded-lg" />
          <span className="text-lg font-bold font-serif text-white tracking-wider">
            HamperBox
          </span>
        </Link>
        <span className="ml-2 px-2 py-0.5 rounded bg-primary/20 text-[9px] text-primary font-bold uppercase">
          Admin
        </span>
      </div>


      {/* Nav Menu Items */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isPathActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/10'
                  : 'hover:bg-slate-850 hover:text-white'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${active ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer controls */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold hover:bg-slate-850 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-slate-400" />
          <span>Back to Storefront</span>
        </Link>
        
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-xs font-semibold text-rose-450 hover:bg-rose-950/20 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 text-rose-500" />
          <span>Admin Sign Out</span>
        </button>
      </div>

    </aside>
  );
};
export default AdminSidebar;
