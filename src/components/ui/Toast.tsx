import { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import "./Toast.css";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const Icon = iconMap[type];

  return (
    <div className={`toast toast-${type}`}>
      <Icon size={18} className="toast-icon" />
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        <X size={14} />
      </button>
    </div>
  );
}
