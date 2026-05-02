import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Card from "../ui/Card";

const FocusFlowChart = ({ focusFlowData }) => {
  return (
    <Card className="flex-1">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-slate-800">Cognitive Focus Flow</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time engagement levels across subjects
          </p>
        </div>
        <button className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors flex items-center gap-1">
          Weekly ▾
        </button>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={focusFlowData} barSize={22} barCategoryGap="30%">
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
            contentStyle={{
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Bar dataKey="engagement" radius={[6, 6, 0, 0]}>
            {focusFlowData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.engagement > 80 ? "#166534" : "#86efac"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default FocusFlowChart;
