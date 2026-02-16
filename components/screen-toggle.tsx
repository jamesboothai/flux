"use client";

import { useState, useEffect, useCallback } from "react";

export function ScreenToggle({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);

  const toggle = useCallback(() => setHidden((h) => !h), []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggle]);

  if (hidden) {
    return (
      <div
        className="min-h-screen bg-black flex items-center justify-center cursor-pointer select-none"
        onClick={toggle}
      >
        <span className="text-white text-lg tracking-widest">&lt;&gt;</span>
      </div>
    );
  }

  return <>{children}</>;
}
