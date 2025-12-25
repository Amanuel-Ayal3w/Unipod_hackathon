"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = "default", onClose }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300);
      }, 3000);

      return () => clearTimeout(timer);
    }, [id, onClose]);

    const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    };

    const variantStyles = {
      default: "bg-card border-border",
      success: "bg-card border-border",
      error: "bg-card border-border",
      warning: "bg-card border-border",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "min-w-[300px] rounded-lg border shadow-lg p-4 transition-all duration-300",
          variantStyles[variant],
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            {title && (
              <div className="font-semibold text-sm text-foreground mb-1">
                {title}
              </div>
            )}
            {description && (
              <div className="text-sm text-muted-foreground">{description}</div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }
);
Toast.displayName = "Toast";

export { Toast };

