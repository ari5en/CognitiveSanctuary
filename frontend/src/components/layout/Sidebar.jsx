import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  Bell,
  BookOpen,
  Leaf,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabase';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/schedule',  icon: <CalendarDays    size={20} />, label: 'Schedule'  },
  // { to: '/sessions',  icon: <BookOpen        size={20} />, label: 'Sessions'  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{"name":"Alex"}');
  const initials = (storedUser.name || 'A').slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 text-center"
            >
              <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={24} className="text-rose-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Log out of Sanctuary?</h2>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to end your session?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors"
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="fixed top-0 left-0 h-full w-[80px] flex flex-col items-end pr-2 py-8 z-30 overflow-y-auto hide-scrollbar"
        style={{ background: '#E8E4DC' }}>

        {/* Logo mark */}
        <div className="mb-6 flex flex-col items-center gap-1 w-14">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: '#E8E4DC' }}>
            <img src="/logo.jpg" alt="Cognitive Sanctuary Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 w-14 items-center">
          {/* Top Nav Pill */}
          <nav className="bg-white rounded-full py-2 flex flex-col gap-2 items-center shadow-sm w-14">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  [
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group relative',
                    isActive
                      ? 'bg-[#d1e0d3] text-[#2c4c3b] shadow-inner'
                      : 'text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151]',
                  ].join(' ')
                }
              >
                {item.icon}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Pill (Settings, Logout & Avatar) */}
          <div className="bg-white rounded-full py-2 flex flex-col gap-2 items-center shadow-sm w-14 mt-auto">
            {/* Settings
            <NavLink
              to="/settings"
              title="Settings"
              className={({ isActive }) =>
                [
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group relative',
                  isActive
                    ? 'bg-[#d1e0d3] text-[#2c4c3b] shadow-inner'
                    : 'text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151]',
                ].join(' ')
              }
            >
              <Settings size={20} />
            </NavLink> */}

            {/* Logout */}
            <motion.button
              onClick={() => setShowLogoutConfirm(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#9ca3af] hover:bg-[#fde8e8] hover:text-rose-500 transition-all duration-200"
              title="Logout"
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
