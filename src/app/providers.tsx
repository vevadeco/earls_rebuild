"use client";

import { Toaster } from "sonner";

export function Providers() {
  return (
    <Toaster
      richColors
      toastOptions={{
        classNames: {
          toast:
            "bg-background text-foreground border-border shadow-lg",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground"
        }
      }}
    />
  );
}

