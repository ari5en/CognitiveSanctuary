import React, { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import OAuthButtons from "./OAuthButtons";

const SignupForm = ({ onSignup, onGoogleLogin, authMessage }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSignup({ fullName, email, password });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-5">
      {authMessage && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {authMessage}
        </div>
      )}

      {localError && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {localError}
        </div>
      )}

      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Full Name
        </label>
        <input
          type="text"
          placeholder="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sanctuary-300 focus:border-sanctuary-300 transition-all duration-200"
          required
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Email Address
        </label>
        <input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sanctuary-300 focus:border-sanctuary-300 transition-all duration-200"
          required
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sanctuary-300 focus:border-sanctuary-300 transition-all duration-200 pr-10"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sanctuary-300 focus:border-sanctuary-300 transition-all duration-200"
          required
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 py-3 bg-sanctuary-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-sanctuary-800 transition-colors shadow-sm disabled:opacity-70"
      >
        <UserPlus size={16} />
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[11px] text-slate-400">or continue with</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      <OAuthButtons onGoogleLogin={onGoogleLogin} />
    </form>
  );
};

export default SignupForm;
