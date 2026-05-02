import React from "react";
import { CheckCircle2, Plus } from "lucide-react";
import Button from "../ui/Button";

const StatusBanner = ({ statusBanner, error }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 mb-8 flex items-center justify-between shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-sanctuary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle2 className="text-sanctuary-700" size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-lg">
            {statusBanner.message}
          </p>
          <p className="text-slate-500 text-sm max-w-md leading-relaxed">
            {statusBanner.description}
          </p>
          {error ? <p className="text-xs text-rose-600 mt-2">{error}</p> : null}
        </div>
      </div>
      <Button icon={<Plus size={18} />} className="px-6 py-3">
        Start Focus Session
      </Button>
    </div>
  );
};

export default StatusBanner;
