import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  Leaf,
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/schedule',  label: 'Schedule',  icon: <CalendarDays size={18} /> },
  { to: '/settings',  label: 'Settings',  icon: <Settings size={18} /> },
];

const Sidebar = () => {
  return (
    <aside className="fixed top-0 left-0 h-full w-52 bg-white border-r border-slate-100 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-sanctuary-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 leading-tight truncate">Sanctuary</p>
            <p className="text-xs text-slate-400 leading-tight truncate">Deep Work Mode</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-sanctuary-50 text-sanctuary-900 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={
                    isActive ? 'text-sanctuary-700' : 'text-slate-400'
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 pb-5 space-y-1 border-t border-slate-100 pt-4">
     
        <motion.button
          whileHover={{ backgroundColor: '#fff1f2' }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 transition-colors duration-150"
        >
          <LogOut size={18} className="text-slate-400" />
          Logout
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
