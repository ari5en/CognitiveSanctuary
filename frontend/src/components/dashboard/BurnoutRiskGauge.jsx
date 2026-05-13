import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Card from "../ui/Card";

const gaugeBackground = [{ name: "bg", value: 100, fill: "#e2e8f0" }];

const BurnoutRiskGauge = ({ burnoutRisk }) => {
  const gaugeData = [
    { name: "risk", value: burnoutRisk.score, fill: "#166534" },
  ];

  return (
    <Card className="w-80 flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-2 mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Burnout Risk Score
        </p>
        <span className="flex items-center gap-1 bg-sanctuary-50 text-sanctuary-700 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-sanctuary-200">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sanctuary-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sanctuary-600" />
          </span>
          Live
        </span>
      </div>
      <div className="relative w-48 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeBackground}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={65}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            />
            <Pie
              data={gaugeData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={180 - (burnoutRisk.score / 100) * 180}
              innerRadius={65}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill="#166534" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <span className="text-4xl font-bold text-slate-800">
            {burnoutRisk.score}%
          </span>
          <span className="text-[10px] font-bold text-sanctuary-700 uppercase tracking-widest">
            {burnoutRisk.status}
          </span>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 leading-relaxed mt-6 px-2">
        {burnoutRisk.description}
      </p>
    </Card>
  );
};

export default BurnoutRiskGauge;
