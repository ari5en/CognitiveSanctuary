import React from "react";
import { Bell, Search } from "lucide-react";

const currentUser = {
  avatar: "A",
};

const Topbar = () => {
  return (
    <header className="fixed top-0 left-52 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-20">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search resources..."
          className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sanctuary-200 w-64 transition-all duration-200 focus:w-72"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors duration-150">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        {/* Avatar */}
        <button className="w-9 h-9 rounded-full bg-sanctuary-900 text-white text-sm font-semibold flex items-center justify-center hover:bg-sanctuary-800 transition-colors duration-150 ring-2 ring-sanctuary-200">
          {currentUser.avatar}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
