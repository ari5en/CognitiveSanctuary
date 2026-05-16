import React, { useState, useEffect } from "react";
import { User, Bell, Shield, Key } from "lucide-react";
import Card from "../components/ui/Card";
import { supabase } from "../services/supabase";

const SettingsPage = () => {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setProfile({
      name: user.name || "",
      email: user.email || "",
    });
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.updateUser({
        data: { full_name: profile.name },
      });
      if (error) {
        alert(error.message);
      } else {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.name = profile.name;
        localStorage.setItem("user", JSON.stringify(storedUser));
        setSuccessMsg("Profile updated successfully.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your account preferences and personal info.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Settings Navigation (Static purely for aesthetics/structure) */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#d1e0d3] text-[#2c4c3b] rounded-xl font-semibold transition-colors">
            <User size={18} /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Shield size={18} /> Privacy
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Key size={18} /> Password
          </button>
        </div>

        {/* Profile Settings Form */}
        <div className="md:col-span-3">
          <Card className="p-5 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Profile Information
            </h2>

            <form onSubmit={handleProfileSave} className="space-y-6 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#d1e0d3] focus:border-[#d1e0d3] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Email address cannot be changed currently.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving || !profile.name.trim()}
                className="py-3 px-6 bg-sanctuary-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-sanctuary-800 transition-colors shadow-sm disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              {successMsg && (
                <p className="text-sm text-emerald-600 font-medium">
                  {successMsg}
                </p>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
