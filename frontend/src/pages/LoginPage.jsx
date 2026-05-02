import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Auth Components
import AuthHeader from "../components/auth/AuthHeader";
import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (credentials) => {
    // Mock login logic
    console.log("Logging in with:", credentials);
    const mockUser = { id: 1, email: credentials.email, name: "Alex" };
    localStorage.setItem("user", JSON.stringify(mockUser));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Decorative blurred circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sanctuary-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <AuthHeader />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-10"
      >
        <div className="h-1 bg-gradient-to-r from-sanctuary-700 via-sanctuary-500 to-green-400" />
        <LoginForm onLogin={handleLogin} />
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-6 text-sm text-slate-500 z-10"
      >
        New to the Sanctuary?{" "}
        <button className="text-sanctuary-700 font-semibold hover:text-sanctuary-800 transition-colors">
          Create an account
        </button>
      </motion.p>

      {/* Footer Bar */}
      <div className="absolute bottom-5 left-8 right-8 flex justify-between items-center z-10">
        <span className="text-xs text-slate-300">EST. 2024</span>
        <div className="flex gap-3 text-slate-300 text-xs">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Help</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
