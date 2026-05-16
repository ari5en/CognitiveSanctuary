import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  const location = useLocation();
  const isSessionsPage = location.pathname.startsWith("/sessions");

  return (
    <div className="flex min-h-dvh overflow-x-hidden bg-[#E8E4DC]">
      {!isSessionsPage && <Sidebar />}

      {/* Right Panel — offset by sidebar width if sidebar is present */}
      <div
        className={`flex-1 min-w-0 ${!isSessionsPage ? "md:ml-[80px]" : ""} overflow-hidden flex flex-col`}
      >
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 md:pl-4 md:pr-8 py-4 md:py-8 pb-24 md:pb-8">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
