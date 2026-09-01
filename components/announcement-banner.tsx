"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "drape-banner-v1";

export function AnnouncementBanner({ message }: { message: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore quota / private-mode failures; still hide for this session.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center gap-4 bg-[var(--drape-surface)] px-6 py-3 text-center text-sm text-[var(--drape-accent)]">
      <p>{message}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="size-8 shrink-0 rounded-lg text-[var(--drape-accent)]"
      >
        ×
      </button>
    </div>
  );
}
