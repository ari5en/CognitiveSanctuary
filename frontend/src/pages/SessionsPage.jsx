import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, LayoutGrid, Shield, Lightbulb, Minus, Plus } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { sessionData } from '../data/mockData';

const NumberInput = ({ icon, value, onChange, min = 0, max = 24 }) => (
  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
    <span className="text-slate-400">{icon}</span>
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      className="text-slate-400 hover:text-slate-700 transition-colors"
    >
      <Minus size={14} />
    </button>
    <span className="text-xl font-semibold text-slate-800 w-6 text-center">{value}</span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      className="text-slate-400 hover:text-slate-700 transition-colors"
    >
      <Plus size={14} />
    </button>
  </div>
);

const SessionsPage = () => {
  const { title, subtitle, mentalStates, burnoutPrediction, trivia, stats } = sessionData;

  const [studyHours, setStudyHours] = useState(sessionData.defaults.studyHours);
  const [breaksSkipped, setBreaksSkipped] = useState(sessionData.defaults.breaksSkipped);
  const [mentalState, setMentalState] = useState(sessionData.defaults.mentalState);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">{title}</h1>
        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* LEFT: Form */}
        <div className="flex-1 min-w-0">
          <Card className="space-y-7">
            {/* Study Hours & Breaks Row */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Study Hours
                </label>
                <NumberInput
                  icon={<Clock size={16} />}
                  value={studyHours}
                  onChange={setStudyHours}
                  min={1}
                  max={12}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Breaks Skipped
                </label>
                <NumberInput
                  icon={<LayoutGrid size={16} />}
                  value={breaksSkipped}
                  onChange={setBreaksSkipped}
                  min={0}
                  max={10}
                />
              </div>
            </div>

            {/* Mental State Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Current Mental State
              </label>
              <div className="grid grid-cols-4 gap-3">
                {mentalStates.map((state) => {
                  const isActive = mentalState === state.id;
                  return (
                    <button
                      key={state.id}
                      onClick={() => setMentalState(state.id)}
                      className={[
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 transform hover:scale-105 active:scale-95',
                        isActive
                          ? 'border-sanctuary-600 bg-sanctuary-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <span className="text-2xl">{state.emoji}</span>
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? 'text-sanctuary-800' : 'text-slate-500'
                        }`}
                      >
                        {state.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Session Button */}
            <Button variant="solid" size="lg" fullWidth className="py-4 text-base font-semibold rounded-xl">
              ▶ &nbsp; Start Session
            </Button>
          </Card>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Burnout Prediction */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-sanctuary-700" />
              <h3 className="font-semibold text-slate-800">Burnout Prediction</h3>
            </div>

            {/* Risk Level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge color="amber">Risk Level</Badge>
                <span className="text-xs font-medium text-slate-500">
                  {burnoutPrediction.riskLevel} ({burnoutPrediction.riskPercent}%)
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sanctuary-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${burnoutPrediction.riskPercent}%` }}
                />
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-sanctuary-700 mb-1">Expert Recommendation:</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {burnoutPrediction.recommendation}
              </p>
            </div>

            {/* Data Points */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Cognitive Load</span>
                <span className="text-sm font-semibold text-slate-700">{burnoutPrediction.cognitiveLoad}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Estimated Recovery</span>
                <span className="text-sm font-semibold text-slate-700">{burnoutPrediction.estimatedRecovery}</span>
              </div>
            </div>
          </Card>

          {/* Did You Know */}
          <div className="relative bg-sanctuary-900 rounded-2xl p-5 overflow-hidden">
            {/* Decorative triangle */}
            <div
              className="absolute bottom-0 right-0 w-24 h-24 opacity-10"
              style={{
                background: 'linear-gradient(135deg, transparent 50%, #22c55e 50%)',
              }}
            />
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb size={16} className="text-sanctuary-300 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-bold text-white">Did you know?</p>
            </div>
            <p className="text-xs text-sanctuary-200 leading-relaxed">{trivia}</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center">
              <p className="text-2xl font-bold text-slate-800">{stats.totalSessions}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Sessions</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-slate-800">{stats.avgHours}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Avg Hours</p>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionsPage;
