import React, { useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";
import Button from "../ui/Button";
import OAuthButtons from "./OAuthButtons";

const LoginForm = ({ onLogin, onGoogleLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      {/* Email */}
      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sanctuary-300 focus:border-sanctuary-300 transition-all duration-200"
          required
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Password
          </label>
          <button
            type="button"
            className="text-[11px] font-bold text-amber-600 hover:text-amber-700 tracking-widest uppercase transition-colors"
          >
            Forgot?
          </button>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sanctuary-300 focus:border-sanctuary-300 transition-all duration-200 pr-10"
            required
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

      {/* Login Button */}
      <button 
        type="submit" 
        className="w-full mt-2 py-3 bg-sanctuary-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-sanctuary-800 transition-colors shadow-sm"
      >
        Login
        <span>→</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[11px] text-slate-400">or continue with</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      <OAuthButtons onGoogleLogin={onGoogleLogin} />
    </form>
  );
};

export default LoginForm;
