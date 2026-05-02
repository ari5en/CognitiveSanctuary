import React from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

const AuthHeader = () => {
  return (
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
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          The Cognitive Sanctuary
        </h1>
      </div>
      <p className="text-slate-500 text-sm">
        Step back into your{" "}
        <span className="text-sanctuary-700 font-semibold">
          Mindful Workspace
        </span>
        .
      </p>
    </motion.div>
  );
};

export default AuthHeader;
