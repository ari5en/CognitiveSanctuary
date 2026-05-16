import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../services/supabase";

import SignupForm from "../components/auth/SignupForm";

const SignupPage = () => {
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = useState("");

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

  const handleSignup = async ({ fullName, email, password }) => {
    setAuthMessage("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user
      ? {
          id: data.user.id,
          email: data.user.email,
          name:
            data.user.user_metadata?.full_name || data.user.email.split("@")[0],
          avatar: data.user.user_metadata?.avatar_url,
        }
      : null;

    if (data.session && user) {
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
      return;
    }

    setAuthMessage(
      "Account created. Check your email to verify your account, then log in.",
    );
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
      alert("Google signup failed.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden"
      style={{ backgroundColor: "rgb(232, 228, 220)" }}
    >
      <div
        className="hidden md:flex w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white">
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

          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Build your focus routine.
              <br />
              Start with one account.
            </h2>
            <p className="mt-2 text-white/80 text-sm max-w-sm">
              Create your space, keep your data private, and let the planner
              adapt after each session.
            </p>
          </div>

          <p className="text-xs text-white/60">
            © 2026 The Cognitive Sanctuary
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100 blur-[120px] opacity-40" />

        <div className="w-full max-w-md z-10">
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
                Create your account
              </h1>
            </div>

            <p className="text-sm text-slate-500">
              Join the sanctuary and let your schedule adapt automatically.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
          >
            <div className="h-1.5 w-full bg-sanctuary-500" />
            <SignupForm
              onSignup={handleSignup}
              onGoogleLogin={handleGoogleLogin}
              authMessage={authMessage}
            />
          </motion.div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sanctuary-700 font-semibold hover:text-sanctuary-800"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
