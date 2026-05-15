import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const COLORS = {
  programming: "#7c3aed", // violet-600 (matches violet-100/700 UI tone)
  reading: "#0284c7",     // sky-600 (clean blue, more readable than amber)
  school: "#f59e0b",      // amber-500 (warm academic feel)
  "deep-work": "#059669", // emerald-600 (focused productivity green)
  review: "#f43f5e"       // rose-500 (kept consistent)
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.06)" }}
    >
      <p className="font-semibold" style={{ color: "#374151" }}>{payload[0].name}</p>
      <p style={{ color: "#6b7280" }}>{payload[0].value} session{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
};

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-1 text-xs" style={{ color: "#6b7280" }}>
          <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
};

/**
 * @param {{ categoryData: Array<{name: string, value: number}>, compact?: boolean }} props
 */
const StudyCategoryChart = ({ categoryData, compact }) => {
  const hasData = categoryData && categoryData.length > 0 && categoryData.some(d => d.value > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <p className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>Study Distribution</p>
        <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Sessions by category</p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "#d1d5db" }}>
          No session data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={compact ? 160 : 200}>
          <PieChart margin={{ top: 10 }}>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={compact ? 55 : 70}
              innerRadius={compact ? 30 : 40}
              paddingAngle={3}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={COLORS[entry.name] || "#d1d5db"} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>

      )}
    </div>
  );
};

export default StudyCategoryChart;
