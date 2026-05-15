import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../services/supabase";

import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const user = {
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.full_name ||
            session.user.email.split("@")[0],
          avatar: session.user.user_metadata?.avatar_url,
        };


        localStorage.setItem("user", JSON.stringify(user));
        navigate("/dashboard");
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (credentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const user = {
        id: data.user.id,
        email: data.user.email,
        name:
          data.user.user_metadata?.full_name || data.user.email.split("@")[0],
        avatar: data.user.user_metadata?.avatar_url,
      };


      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });

      if (error) {
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
      alert("Google login failed.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden"
      style={{ backgroundColor: "rgb(232, 228, 220)" }}
    >
      {/* 🌿 LEFT IMAGE PANEL */}
      <div
        className="hidden md:flex w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        {/* 🌫 blur layer */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        {/* darker cinematic overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* content */}
        <div className="relative z-10 flex flex-col justify-between p-10 text-white">
          {/* top logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 backdrop-blur-md flex items-center justify-center shadow-md">
              <img
                src="/favicon.jpg"
                alt="logo"
                className="w-6 h-6 object-contain"
              />
            </div>

            <h1 className="text-xl font-semibold">The Cognitive Sanctuary</h1>
          </div>

          {/* hero text */}
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Clarity creates focus.
              <br />
              Focus creates progress.
            </h2>
            <p className="mt-2 text-white/80 text-sm max-w-sm">
              A mindful workspace designed to help you focus, reflect, and grow.
            </p>
          </div>

          <p className="text-xs text-white/60">© 2026 The Cognitive Sanctuary</p>
        </div>
      </div>

      {/* 📌 RIGHT LOGIN PANEL */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 relative">
        {/* soft glow background */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100 blur-[120px] opacity-40" />

        <div className="w-full max-w-md z-10">
          {/* header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-10 h-10 bg-sanctuary-900 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src="/favicon.jpg"
                  alt="logo"
                  className="w-6 h-6 object-contain"
                />
              </div>

              <h1 className="text-2xl font-bold text-slate-800">
                Welcome Back
              </h1>
            </div>

            <p className="text-sm text-slate-500">
              Log in to continue your mindful workspace
            </p>
          </motion.div>

          {/* login card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
          >
            <div className="h-1.5 w-full bg-sanctuary-500" />
            <LoginForm
              onLogin={handleLogin}
              onGoogleLogin={handleGoogleLogin}
            />
          </motion.div>

          {/* footer */}
          <p className="mt-6 text-center text-sm text-slate-500">
            New to the Sanctuary?{" "}
            <button className="text-sanctuary-700 font-semibold hover:text-sanctuary-800">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
