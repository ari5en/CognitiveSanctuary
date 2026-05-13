import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.06)" }}
    >
      <p className="font-semibold" style={{ color: "#374151" }}>{label}</p>
      <p className="font-bold" style={{ color: "#15803d" }}>{payload[0].value.toFixed(1)}h</p>
    </div>
  );
};

/**
 * @param {{ weeklyData: Array<{day: string, hours: number}>, transparent?: boolean }} props
 */
const WeeklyStudyChart = ({ weeklyData, transparent }) => {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#15803d" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} unit="h" />
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
  );
};

export default WeeklyStudyChart;
