import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export function LoadingSpinner({ size = 24, message }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner-wrapper">
      <div
        className="loading-spinner"
        style={{ width: size, height: size }}
      />
      {message && <span className="loading-message">{message}</span>}
    </div>
  );
}
