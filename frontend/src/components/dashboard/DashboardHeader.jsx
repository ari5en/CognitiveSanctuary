import React from "react";

const DashboardHeader = ({ greeting, dateSubtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
        {greeting}
      </h1>
      <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-wider">
        {dateSubtitle}
      </p>
    </div>
  );
};

export default DashboardHeader;
