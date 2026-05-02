import React, { useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";
import Button from "../ui/Button";
import OAuthButtons from "./OAuthButtons";

const LoginForm = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="p-7 space-y-5">
      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sanctuary-300 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Password
          </label>
          <button
            type="button"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 tracking-wider uppercase transition-colors"
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
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sanctuary-300 focus:border-transparent transition-all duration-200 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Login Button */}
      <Button type="submit" variant="solid" size="lg" fullWidth className="mt-2">
        Login
        <LogIn size={16} />
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400">or continue with</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <OAuthButtons />
    </form>
  );
};

export default LoginForm;
