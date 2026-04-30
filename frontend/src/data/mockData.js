// ============================================================
// Mock Data — Replace these with real API calls when ready
// ============================================================

// --- User ---
export const mockUser = {
  name: 'Alex',
  firstName: 'Alex',
  avatar: 'A',
  email: 'alex@sanctuary.app',
  mode: 'Deep Work Mode',
};

// --- Dashboard ---
export const dashboardData = {
  greeting: 'Hello, Alex',
  dateSubtitle: 'MONDAY, OCTOBER 24 — DEEP WORK MODE ACTIVE',
  statusBanner: {
    type: 'safe', // 'safe' | 'warning' | 'danger'
    message: 'You are in a safe zone',
    description: 'Your cognitive load is optimal for learning new complex concepts.',
  },
  kpis: [
    { label: 'STUDY HOURS', value: '4.5h', icon: 'clock' },
    { label: 'BREAKS TAKEN', value: '3', icon: 'coffee' },
    { label: 'DAILY MOOD', value: 'Happy', icon: 'smile' },
  ],
  burnoutRisk: {
    score: 30,
    status: 'STABLE',
    description: 'Your recovery sessions have been effective. You can maintain this pace for 4 more hours.',
  },
  focusFlowData: [
    { day: 'MON', engagement: 55 },
    { day: 'TUE', engagement: 72 },
    { day: 'WED', engagement: 40 },
    { day: 'THU', engagement: 95 },
    { day: 'FRI', engagement: 68 },
    { day: 'SAT', engagement: 60 },
    { day: 'SUN', engagement: 80 },
  ],
  milestones: [
    {
      id: 1,
      title: 'Neural Networks Exam',
      date: 'FRIDAY, OCT 28',
      badge: 'HIGH FOCUS',
      badgeColor: 'green',
      borderColor: 'border-green-500',
    },
    {
      id: 2,
      title: 'Ethics in AI Essay',
      date: 'MONDAY, OCT 31',
      badge: 'PLANNING',
      badgeColor: 'amber',
      borderColor: 'border-amber-400',
    },
  ],
  quickActions: [
    { id: 'new-task', label: 'New Task', icon: 'check-square-2' },
    { id: 'review', label: 'Review', icon: 'clipboard-list' },
    { id: 'unwind', label: 'Unwind', icon: 'leaf' },
    { id: 'reports', label: 'Reports', icon: 'bar-chart-2' },
  ],
};

// --- Schedule ---
export const scheduleData = {
  title: 'Adaptive Scheduling',
  description: "System analysis complete. Based on your cognitive load patterns, we've optimized your schedule for peak focus and recovery.",
  alert: {
    load: 75,
    message: 'System suggests a lighter workload today to prevent burnout. 2 heavy tasks deferred.',
  },
  priorityTasks: [
    {
      id: 1,
      title: 'Calculus Homework',
      subject: 'MATH',
      subjectColor: 'green',
      duration: '45 mins',
      icon: 'sigma',
    },
    {
      id: 2,
      title: 'Biology Review',
      subject: 'SCIENCE',
      subjectColor: 'green',
      duration: '30 mins',
      icon: 'microscope',
    },
  ],
  restModeTasks: [
    {
      id: 3,
      title: 'History Essay Draft',
      deferredTo: 'DEFERRED TO TOMORROW',
      priority: 'Priority: Low',
      icon: 'book-open',
    },
  ],
  focusResilience: {
    score: 82,
    label: 'Optimal',
    description: 'Your neural endurance is high in the mornings. Calculus was moved forward to capitalize on this.',
  },
  dailyReflection: {
    quote: '"The mind is not a vessel to be filled, but a fire to be kindled."',
    label: 'DAILY REFLECTION',
  },
};

// --- Sessions ---
export const sessionData = {
  title: 'Configure Session',
  subtitle: 'Personalize your deep work environment for maximum cognitive efficiency.',
  defaults: {
    studyHours: 2,
    breaksSkipped: 0,
    mentalState: 'Happy',
  },
  mentalStates: [
    { id: 'Happy', emoji: '😊', label: 'Happy' },
    { id: 'Neutral', emoji: '😐', label: 'Neutral' },
    { id: 'Tired', emoji: '😟', label: 'Tired' },
    { id: 'Exhausted', emoji: '🤯', label: 'Exhausted' },
  ],
  burnoutPrediction: {
    riskLevel: 'Low',
    riskPercent: 12,
    recommendation: 'Your current energy levels are optimal. Consider a 50-minute Pomodoro cycle to maintain this momentum.',
    cognitiveLoad: 'Normal',
    estimatedRecovery: '15 min',
  },
  trivia: 'Drinking 250ml of water every 60 minutes improves focus by 14%.',
  stats: {
    totalSessions: 142,
    avgHours: 4.8,
  },
};
