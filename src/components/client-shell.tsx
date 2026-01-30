"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

interface ClientShellProps {
  children: ReactNode;
}

export function ClientShell({ children }: ClientShellProps) {
  const hasReloadedRef = useRef(false);

  useEffect(() => {
    const isChunkLoadError = (message: string) =>
      /ChunkLoadError|Loading chunk|loading chunk|app\/layout/i.test(message);

    const handleError = (event: ErrorEvent) => {
      const message = event?.message || "";
      if (!hasReloadedRef.current && isChunkLoadError(message)) {
        hasReloadedRef.current = true;
        window.location.reload();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason as { message?: string } | string | undefined;
      const message =
        typeof reason === "string" ? reason : reason?.message || "";
      if (!hasReloadedRef.current && isChunkLoadError(message)) {
        hasReloadedRef.current = true;
        window.location.reload();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <Providers>
      {children}
      <Toaster richColors position="top-right" />
      <KeyboardShortcuts />
    </Providers>
  );
}
