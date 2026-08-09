"use client";

import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

type ToasterProps = ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-stone-200 group-[.toaster]:shadow-lg group-[.toaster]:shadow-stone-200/20 group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "group-[.toaster]:[&_[data-icon]]:animate-shake",
          success: "group-[.toaster]:[&_[data-icon]]:animate-scale-in"
        }
      }}
      icons={{
        success: <CheckCircle className="h-4 w-4 animate-scale-in text-emerald-600" />,
        error: <XCircle className="h-4 w-4 animate-shake text-destructive" />,
        warning: <AlertTriangle className="h-4 w-4 text-amber-600" />,
        info: <Info className="h-4 w-4 text-primary" />,
        loading: <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
      }}
      {...props}
    />
  );
};

export { Toaster };
