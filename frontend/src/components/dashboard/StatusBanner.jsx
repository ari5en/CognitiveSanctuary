import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

const bannerStyles = {
  Normal: {
    container: "bg-emerald-50 border-emerald-200",
    iconWrap: "bg-emerald-100",
    icon: "text-emerald-700",
    iconNode: CheckCircle2,
  },
  Warning: {
    container: "bg-amber-50 border-amber-200",
    iconWrap: "bg-amber-100",
    icon: "text-amber-700",
    iconNode: AlertTriangle,
  },
  Recovery: {
    container: "bg-rose-50 border-rose-200",
    iconWrap: "bg-rose-100",
    icon: "text-rose-700",
    iconNode: ShieldAlert,
  },
};

const StatusBanner = ({ burnoutMode, message, description, error }) => {
  const modeKey = burnoutMode || "Normal";
  const styles = bannerStyles[modeKey] || bannerStyles.Normal;
  const Icon = styles.iconNode;

  return (
    <div
      className={`border rounded-3xl p-5 mb-8 flex items-center justify-between shadow-sm ${styles.container}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${styles.iconWrap}`}
        >
          <Icon className={styles.icon} size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-lg">{message}</p>
          <p className="text-slate-600 text-sm max-w-md leading-relaxed">
            {description}
          </p>
          {error ? <p className="text-xs text-rose-600 mt-2">{error}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default StatusBanner;
