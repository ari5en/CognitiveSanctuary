import React from "react";
import { Shield } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

const BurnoutPrediction = ({ prediction }) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield size={18} className="text-sanctuary-700" />
        <h3 className="font-semibold text-slate-800">Burnout Prediction</h3>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Badge color="amber">Risk Level</Badge>
          <span className="text-xs font-medium text-slate-500">
            {prediction.riskLevel} ({prediction.riskPercent}%)
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sanctuary-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${prediction.riskPercent}%` }}
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <p className="text-xs font-bold text-sanctuary-700 mb-1">
          Expert Recommendation:
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          {prediction.recommendation}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Cognitive Load</span>
          <span className="text-sm font-semibold text-slate-700">
            {prediction.cognitiveLoad}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Estimated Recovery</span>
          <span className="text-sm font-semibold text-slate-700">
            {prediction.estimatedRecovery}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default BurnoutPrediction;
