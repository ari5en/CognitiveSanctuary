import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Card from "../ui/Card";

const COLORS = ["#7c3aed", "#0284c7", "#d97706", "#15803d", "#e11d48"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-card-hover text-xs">
      <p className="font-semibold text-slate-700">{payload[0].name}</p>
      <p className="text-slate-500">{payload[0].value} session{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
};

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-3">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
};

/**
 * @param {{ categoryData: Array<{name: string, value: number}> }} props
 */
const StudyCategoryChart = ({ categoryData }) => {
  const hasData = categoryData && categoryData.length > 0 && categoryData.some(d => d.value > 0);

  return (
    <Card>
      <div className="mb-4">
        <p className="font-semibold text-slate-800">Study Distribution</p>
        <p className="text-xs text-slate-400 mt-0.5">Sessions by category</p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-40 text-slate-300 text-sm">
          No session data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="45%"
              outerRadius={70}
              innerRadius={40}
              paddingAngle={3}
              dataKey="value"
            >
              {categoryData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default StudyCategoryChart;
