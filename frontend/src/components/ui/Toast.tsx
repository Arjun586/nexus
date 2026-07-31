import { useEffect, type HTMLAttributes } from "react";

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "info";
  message: string;
  onClose?: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

export const Toast = ({
  variant = "info",
  message,
  onClose,
  autoDismiss = true,
  duration = 4000,
  className = "",
  ...props
}: ToastProps) => {
  useEffect(() => {
    if (!autoDismiss || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [autoDismiss, duration, onClose]);

  const variantStyles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-gray-200 bg-gray-50 text-gray-900",
  };

  const icons = {
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-red-500">
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-500">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-gray-500">
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.025.025 0 0 1 .025.025v3.25c0 .014-.011.025-.025.025H9a.75.75 0 0 0 0 1.5h2.25a.75.75 0 0 0 0-1.5h-.253a.025.025 0 0 1-.025-.025v-3.25a.025.025 0 0 1 .025-.025H11a.75.75 0 0 0 0-1.5H9Z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`flex items-center justify-between gap-2.5 rounded-md border px-3 py-2 text-xs font-medium transition-all duration-150 shadow-2xs ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2 min-w-0">
        {icons[variant]}
        <span className="truncate">{message}</span>
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="rounded p-0.5 opacity-70 hover:opacity-100 outline-none focus-visible:ring-1 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      ) : null}
    </div>
  );
};

export default Toast;
