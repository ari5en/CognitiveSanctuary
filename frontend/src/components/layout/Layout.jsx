import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#E8E4DC' }}>
      <Sidebar />

      {/* Right Panel — offset by sidebar width */}
      <div className="flex-1 ml-[80px] overflow-hidden flex flex-col">
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
