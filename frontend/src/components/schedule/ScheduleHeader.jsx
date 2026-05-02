import React from "react";

const ScheduleHeader = ({ title, description, error }) => {
  return (
    <div className="mb-6">
      <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
        {title}
      </h1>
      <p className="text-slate-500 text-sm mt-1 max-w-xl">{description}</p>
      {error ? <p className="text-xs text-rose-600 mt-2">{error}</p> : null}
    </div>
  );
};

export default ScheduleHeader;
