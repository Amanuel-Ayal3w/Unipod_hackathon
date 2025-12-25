"use client";

import * as React from "react";
import { Toast, ToastProps } from "./toast";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}

