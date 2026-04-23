import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, LogIn, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Decorative blurred circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sanctuary-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      {/* Logo + Title */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 z-10"
      >
        <div className="flex items-center gap-3 justify-center mb-3">
          <div className="w-11 h-11 bg-sanctuary-900 rounded-xl flex items-center justify-center shadow-lg">
            <Leaf size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">The Cognitive Sanctuary</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Step back into your{' '}
          <span className="text-sanctuary-700 font-semibold">Mindful Workspace</span>.
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-10"
      >
        {/* Green top accent */}
        <div className="h-1 bg-gradient-to-r from-sanctuary-700 via-sanctuary-500 to-green-400" />

        <form onSubmit={handleLogin} className="p-7 space-y-5">
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
                type={showPassword ? 'text' : 'password'}
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
          <Button
            type="submit"
            variant="solid"
            size="lg"
            fullWidth
            className="mt-2"
          >
            Login
            <LogIn size={16} />
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or continue with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="md" type="button">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" size="md" type="button">
              <svg className="w-4 h-4 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-6 text-sm text-slate-500 z-10"
      >
        New to the Sanctuary?{' '}
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
