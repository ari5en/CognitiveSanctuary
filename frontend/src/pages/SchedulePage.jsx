import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  Moon,
  BookOpen,
  Sigma,
  Microscope,
  Plus,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { scheduleData } from '../data/mockData';

const taskIconMap = {
  sigma:      <Sigma size={20} className="text-sanctuary-800" />,
  microscope: <Microscope size={20} className="text-sanctuary-800" />,
  'book-open': <BookOpen size={20} className="text-slate-400" />,
};

const SchedulePage = () => {
  const { title, description, alert, priorityTasks, restModeTasks, focusResilience, dailyReflection } = scheduleData;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">{title}</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-xl">{description}</p>
      </div>

      <div className="flex gap-6">
        {/* LEFT CONTENT */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Alert Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">
                Recommended Load: {alert.load}%
              </p>
              <p className="text-xs text-amber-700 opacity-80 mt-0.5">{alert.message}</p>
            </div>
          </div>

          {/* Priority Focus */}
          <Card padding={false} className="overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Priority Focus</h2>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                {priorityTasks.length} Active Today
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {priorityTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  {/* Icon */}
                  <div className="w-11 h-11 bg-sanctuary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {taskIconMap[task.icon]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge color={task.subjectColor}>{task.subject}</Badge>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        {task.duration}
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <Button variant="solid" size="sm" className="flex-shrink-0">
                    Start Focus
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-dashed border-slate-200" />
          </div>

          {/* Rest Mode */}
          <div className="mb-3 flex items-center gap-2">
            <Moon size={17} className="text-slate-500" />
            <h2 className="font-semibold text-slate-600 text-sm">Shifted to 'Rest Mode'</h2>
          </div>
          <Card padding={false} className="overflow-hidden">
            {restModeTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 px-5 py-4 opacity-50 grayscale"
              >
                <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {taskIconMap[task.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 text-sm">{task.title}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">{task.deferredTo}</p>
                </div>
                <span className="text-xs text-slate-400">{task.priority}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-72 flex-shrink-0 space-y-5">
          {/* Focus Resilience */}
          <Card>
            <p className="text-xs font-bold text-sanctuary-700 uppercase tracking-widest mb-1">
              Focus Resilience
            </p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-bold text-slate-800">{focusResilience.score}%</span>
              <span className="text-sm text-slate-500 pb-1">{focusResilience.label}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-sanctuary-700 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${focusResilience.score}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {focusResilience.description}
            </p>
          </Card>

          {/* Daily Reflection */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ minHeight: 220 }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800" />
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 70% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 30% 70%, #fff 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative p-6 flex flex-col justify-end h-full" style={{ minHeight: 220 }}>
              {/* Quote mark */}
              <div className="text-5xl text-sanctuary-400 font-serif leading-none mb-2 opacity-70">"</div>
              <p className="text-white text-base font-semibold leading-snug">
                {dailyReflection.quote}
              </p>
              <p className="text-slate-400 text-xs uppercase tracking-widest mt-3">
                {dailyReflection.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        className="fixed bottom-8 right-8 w-12 h-12 bg-sanctuary-900 text-white rounded-full shadow-lg flex items-center justify-center z-20 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus size={20} />
      </button>
    </motion.div>
  );
};

export default SchedulePage;
