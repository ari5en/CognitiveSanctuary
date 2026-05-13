import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

const bannerStyles = {
  Normal: {
    container: { background: "#f0fdf4", border: "1px solid #bbf7d0" },
    iconWrap: { background: "#dcfce7" },
    iconColor: "#15803d",
    iconNode: CheckCircle2,
  },
  Warning: {
    container: { background: "#fffbeb", border: "1px solid #fde68a" },
    iconWrap: { background: "#fef3c7" },
    iconColor: "#d97706",
    iconNode: AlertTriangle,
  },
  Recovery: {
    container: { background: "#fff1f2", border: "1px solid #fecdd3" },
    iconWrap: { background: "#ffe4e6" },
    iconColor: "#e11d48",
    iconNode: ShieldAlert,
  },
};

const StatusBanner = ({ burnoutMode, message, description, error, compact }) => {
  const modeKey = burnoutMode || "Normal";
  const styles = bannerStyles[modeKey] || bannerStyles.Normal;
  const Icon = styles.iconNode;

  return (
    <div
      className="rounded-3xl p-4 flex items-start gap-3 h-full"
      style={styles.container}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={styles.iconWrap}
      >
        <Icon style={{ color: styles.iconColor }} size={18} />
      </div>
      <div>
        <p className="font-bold text-sm" style={{ color: "#1a1a1a" }}>{message}</p>
        <p className="text-xs leading-relaxed mt-0.5" style={{ color: "#6b7280" }}>
          {description}
        </p>
        {error ? <p className="text-xs mt-1" style={{ color: "#e11d48" }}>{error}</p> : null}
      </div>
    </div>
  );
};

export default StatusBanner;
