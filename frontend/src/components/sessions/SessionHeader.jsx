import React from "react";

const SessionHeader = ({ title, subtitle, message, error }) => {
  return (
    <div className="mb-7">
      <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
        {title}
      </h1>
      <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
      {message ? (
        <p className="text-xs text-emerald-700 mt-2">{message}</p>
      ) : null}
      {error ? <p className="text-xs text-rose-600 mt-2">{error}</p> : null}
    </div>
  );
};

export default SessionHeader;
