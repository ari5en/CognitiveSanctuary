import React from "react";
import { AlertTriangle } from "lucide-react";

const AlertBanner = ({ load, message }) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-start gap-3">
      <AlertTriangle
        size={18}
        className="text-amber-600 flex-shrink-0 mt-0.5"
      />
      <div>
        <p className="font-semibold text-amber-800 text-sm">
          Recommended Load: {load}%
        </p>
        <p className="text-xs text-amber-700 opacity-80 mt-0.5">
          {message}
        </p>
      </div>
    </div>
  );
};

export default AlertBanner;
