import React from "react";
import { Bell, Search } from "lucide-react";

const currentUser = {
  avatar: "A",
};

const Topbar = () => {
  return (
    <header className="fixed top-0 left-52 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-20">
      {/* Search */}
      <div className="relative"></div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}

        {/* Avatar */}
        <button className="w-9 h-9 rounded-full bg-sanctuary-900 text-white text-sm font-semibold flex items-center justify-center hover:bg-sanctuary-800 transition-colors duration-150 ring-2 ring-sanctuary-200">
          {currentUser.avatar}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
