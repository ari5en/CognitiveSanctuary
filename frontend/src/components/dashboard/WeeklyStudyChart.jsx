import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area, AreaChart,
} from "recharts";
import Card from "../ui/Card";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-card-hover text-xs">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-sanctuary-700 font-bold">{payload[0].value.toFixed(1)}h</p>
    </div>
  );
};

/**
 * @param {{ weeklyData: Array<{day: string, hours: number}> }} props
 */
const WeeklyStudyChart = ({ weeklyData }) => {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-slate-800">Weekly Study Hours</p>
          <p className="text-xs text-slate-400 mt-0.5">Study consistency across the week</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#15803d" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} unit="h" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#15803d"
            strokeWidth={2.5}
            fill="url(#studyGrad)"
            dot={{ r: 4, fill: "#15803d", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, fill: "#15803d" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default WeeklyStudyChart;
