import React from "react";
import { Lightbulb } from "lucide-react";

const TriviaCard = ({ trivia }) => {
  return (
    <div className="relative bg-sanctuary-900 rounded-2xl p-5 overflow-hidden">
      <div
        className="absolute bottom-0 right-0 w-24 h-24 opacity-10"
        style={{
          background: "linear-gradient(135deg, transparent 50%, #22c55e 50%)",
        }}
      />
      <div className="flex items-start gap-2 mb-2">
        <Lightbulb size={16} className="text-sanctuary-300 mt-0.5 flex-shrink-0" />
        <p className="text-sm font-bold text-white">Did you know?</p>
      </div>
      <p className="text-xs text-sanctuary-200 leading-relaxed">
        {trivia}
      </p>
    </div>
  );
};

export default TriviaCard;
