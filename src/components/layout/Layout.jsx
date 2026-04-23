import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      {/* Right Panel */}
      <div className="flex-1 ml-52 flex flex-col overflow-hidden">
        <Topbar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-24 px-12 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
