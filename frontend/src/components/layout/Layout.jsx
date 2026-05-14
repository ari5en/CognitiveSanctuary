import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const isSessionsPage = location.pathname.startsWith('/sessions');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#E8E4DC' }}>
      {!isSessionsPage && <Sidebar />}

      {/* Right Panel — offset by sidebar width if sidebar is present */}
      <div className={`flex-1 ${!isSessionsPage ? 'ml-[80px]' : ''} overflow-hidden flex flex-col`}>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pl-4 pr-8 py-8">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
