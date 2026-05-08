import React from "react";
import { Activity, CheckCircle2, Clock } from "lucide-react";
import Card from "../ui/Card";

const kpiIconMap = {
  clock: <Clock size={18} className="text-sanctuary-700" />,
  check: <CheckCircle2 size={18} className="text-sanctuary-700" />,
  activity: <Activity size={18} className="text-sanctuary-700" />,
};

const KPICards = ({ kpis }) => {
  return (
    <div className="grid grid-cols-3 gap-5 mb-5">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="flex items-center gap-4 py-6">
          <div className="w-12 h-12 bg-sanctuary-50 rounded-2xl flex items-center justify-center">
            {kpiIconMap[kpi.icon]}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              {kpi.label}
            </p>
            <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default KPICards;
