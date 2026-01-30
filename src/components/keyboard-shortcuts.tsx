"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function KeyboardShortcuts() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + K for search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        // Dispatch custom event for search modal
        window.dispatchEvent(new CustomEvent("open-search"));
      }

      // N for new issue (only when logged in)
      if (event.key === "n" && session?.user) {
        event.preventDefault();
        router.push("/issues/new");
      }

      // H for home
      if (event.key === "h" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        router.push("/");
      }

      // Escape to close modals
      if (event.key === "Escape") {
        window.dispatchEvent(new CustomEvent("close-modal"));
      }

      // ? for shortcuts help
      if (event.key === "?" && event.shiftKey) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("open-shortcuts-help"));
      }
    },
    [router, session]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
