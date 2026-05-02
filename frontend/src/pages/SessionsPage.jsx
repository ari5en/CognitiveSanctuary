import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, LayoutGrid } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { createSession, getSessionsByUser } from "../services/api";

// Sessions Components
import SessionHeader from "../components/sessions/SessionHeader";
import NumberInput from "../components/sessions/NumberInput";
import MentalStateSelector from "../components/sessions/MentalStateSelector";
import BurnoutPrediction from "../components/sessions/BurnoutPrediction";
import TriviaCard from "../components/sessions/TriviaCard";
import SessionStats from "../components/sessions/SessionStats";
import RecentSessions from "../components/sessions/RecentSessions";

const defaultSessionData = {
  title: "Configure Session",
  subtitle: "Personalize your deep work environment for maximum cognitive efficiency.",
  defaults: { studyHours: 2, breaksSkipped: 0, mentalState: "Happy" },
  mentalStates: [
    { id: "Happy", emoji: "😊", label: "Happy" },
    { id: "Neutral", emoji: "😐", label: "Neutral" },
    { id: "Tired", emoji: "😟", label: "Tired" },
    { id: "Exhausted", emoji: "🤯", label: "Exhausted" },
  ],
  burnoutPrediction: {
    riskLevel: "Low",
    riskPercent: 12,
    recommendation: "Your current energy levels are optimal. Consider a 50-minute Pomodoro cycle to maintain this momentum.",
    cognitiveLoad: "Normal",
    estimatedRecovery: "15 min",
  },
  trivia: "Drinking 250ml of water every 60 minutes improves focus by 14%.",
  stats: { totalSessions: 142, avgHours: 4.8 },
};

const SessionsPage = () => {
  const [studyHours, setStudyHours] = useState(defaultSessionData.defaults.studyHours);
  const [breaksSkipped, setBreaksSkipped] = useState(defaultSessionData.defaults.breaksSkipped);
  const [mentalState, setMentalState] = useState(defaultSessionData.defaults.mentalState);
  const [recentSessions, setRecentSessions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadSessions = async () => {
      try {
        const sessions = await getSessionsByUser(1);
        if (isMounted) setRecentSessions(sessions);
      } catch (err) {
        if (isMounted) setError("Unable to load saved sessions.");
      }
    };
    loadSessions();
    return () => { isMounted = false; };
  }, []);

  const handleStartSession = async () => {
    setError("");
    setMessage("");
    try {
      const session = await createSession({ userId: 1, breakCount: breaksSkipped });
      setRecentSessions((prev) => [session, ...prev]);
      setMessage(`Session ${session.sessionId} created successfully.`);
    } catch (err) {
      setError("Unable to create a new session.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <SessionHeader 
        title={defaultSessionData.title} 
        subtitle={defaultSessionData.subtitle} 
        message={message} 
        error={error} 
      />

      <div className="flex gap-6 items-start">
        {/* LEFT: Form */}
        <div className="flex-1 min-w-0">
          <Card className="space-y-7">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Study Hours</label>
                <NumberInput icon={<Clock size={16} />} value={studyHours} onChange={setStudyHours} min={1} max={12} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Breaks Skipped</label>
                <NumberInput icon={<LayoutGrid size={16} />} value={breaksSkipped} onChange={setBreaksSkipped} min={0} max={10} />
              </div>
            </div>

            <MentalStateSelector 
              mentalStates={defaultSessionData.mentalStates} 
              currentMood={mentalState} 
              onChange={setMentalState} 
            />

            <Button variant="solid" size="lg" fullWidth className="py-4 text-base font-semibold rounded-xl" onClick={handleStartSession}>
              ▶ &nbsp; Start Session
            </Button>
          </Card>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4">
          <BurnoutPrediction prediction={defaultSessionData.burnoutPrediction} />
          <TriviaCard trivia={defaultSessionData.trivia} />
          <SessionStats stats={defaultSessionData.stats} />
          <RecentSessions sessions={recentSessions} />
        </div>
      </div>
    </motion.div>
  );
};

export default SessionsPage;
