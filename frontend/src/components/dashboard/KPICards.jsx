import React from "react";
import { Activity, CheckCircle2, Clock, Smile, Flame } from "lucide-react";
import Card from "../ui/Card";

const kpiIconMap = {
  clock:    <Clock    size={18} className="text-sanctuary-700" />,
  check:    <CheckCircle2 size={18} className="text-sanctuary-700" />,
  activity: <Activity size={18} className="text-sanctuary-700" />,
  smile:    <Smile    size={18} className="text-sanctuary-700" />,
  flame:    <Flame    size={18} className="text-sanctuary-700" />,
};

const KPICards = ({ kpis }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="flex items-center gap-3 py-5 px-4">
          <div className="w-10 h-10 bg-sanctuary-50 rounded-xl flex items-center justify-center flex-shrink-0">
            {kpiIconMap[kpi.icon]}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate">
              {kpi.label}
            </p>
            <p className="text-xl font-bold text-slate-800">{kpi.value}</p>
            {kpi.sub && (
              <p className="text-[10px] text-slate-400 mt-0.5">{kpi.sub}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default KPICards;
