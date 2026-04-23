import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Coffee,
  Smile,
  CheckSquare2,
  ClipboardList,
  Leaf,
  BarChart2,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { dashboardData } from '../data/mockData';

const kpiIconMap = {
  clock:   <Clock size={18} className="text-sanctuary-700" />,
  coffee:  <Coffee size={18} className="text-sanctuary-700" />,
  smile:   <Smile size={18} className="text-sanctuary-700" />,
};

const quickActionIconMap = {
  'check-square-2':  <CheckSquare2 size={22} className="text-slate-600" />,
  'clipboard-list':  <ClipboardList size={22} className="text-slate-600" />,
  'leaf':            <Leaf size={22} className="text-slate-600" />,
  'bar-chart-2':     <BarChart2 size={22} className="text-slate-600" />,
};

// Gauge data for Recharts RadialBarChart
const gaugeData = [
  { name: 'risk', value: dashboardData.burnoutRisk.score, fill: '#166534' },
];
const gaugeBackground = [
  { name: 'bg', value: 100, fill: '#e2e8f0' },
];

const DashboardPage = () => {
  const { greeting, dateSubtitle, statusBanner, kpis, burnoutRisk, focusFlowData, milestones, quickActions } = dashboardData;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">{greeting}</h1>
        <p className="text-xs font-semibold text-slate-400 tracking-widest mt-1 uppercase">{dateSubtitle}</p>
      </div>

      {/* Status Banner */}
      <div className="bg-sanctuary-50 border border-sanctuary-200 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sanctuary-900 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sanctuary-900">{statusBanner.message}</p>
            <p className="text-sm text-sanctuary-700 opacity-80">{statusBanner.description}</p>
          </div>
        </div>
        <Button variant="solid" size="md" className="flex-shrink-0">
          Start Focus Session
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* LEFT: Burnout Gauge */}
        <div className="col-span-1">
          <Card className="h-full flex flex-col">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Burnout Risk Score
            </p>

            {/* Gauge */}
            <div className="flex flex-col items-center flex-1 justify-center">
              <div className="relative w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="72%"
                    outerRadius="100%"
                    startAngle={220}
                    endAngle={-40}
                    data={gaugeBackground}
                    barSize={10}
                  >
                    <RadialBar dataKey="value" cornerRadius={5} fill="#e2e8f0" />
                  </RadialBarChart>
                </ResponsiveContainer>

                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="72%"
                      outerRadius="100%"
                      startAngle={220}
                      endAngle={220 - (260 * burnoutRisk.score) / 100}
                      data={gaugeData}
                      barSize={10}
                    >
                      <RadialBar dataKey="value" cornerRadius={5} fill="#166534" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{burnoutRisk.score}%</span>
                  <span className="text-xs font-bold text-sanctuary-700 tracking-widest uppercase">
                    {burnoutRisk.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4 leading-relaxed">
                {burnoutRisk.description}
              </p>
            </div>
          </Card>
        </div>

        {/* RIGHT: KPIs + Bar Chart */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* KPI Row */}
          <div className="grid grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label} hoverable>
                <div className="flex flex-col gap-2">
                  {kpiIconMap[kpi.icon]}
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Bar Chart */}
          <Card className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-slate-800">Cognitive Focus Flow</p>
                <p className="text-xs text-slate-400 mt-0.5">Real-time engagement levels across subjects</p>
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
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={{
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="engagement" radius={[6, 6, 0, 0]}>
                  {focusFlowData.map((entry) => (
                    <Cell
                      key={entry.day}
                      fill={entry.engagement >= 90 ? '#166534' : '#bbf7d0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-5">
        {/* Milestones */}
        <div className="col-span-2">
          <Card padding={false} className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Upcoming Milestones</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-center justify-between px-5 py-4 border-l-4 ${m.borderColor}`}
                >
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{m.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">{m.date}</p>
                  </div>
                  <Badge color={m.badgeColor}>{m.badge}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="col-span-1 relative">
          <Card padding={false} className="overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className="flex flex-col items-center gap-2 p-5 text-slate-600 transition-colors hover:bg-slate-50"
                >
                  {quickActionIconMap[action.icon]}
                  <span className="text-xs font-medium text-slate-600">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* FAB */}
          <button
            className="absolute -top-5 -right-2 w-10 h-10 bg-sanctuary-900 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
