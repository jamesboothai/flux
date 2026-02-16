"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("flux-theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  function toggle() {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("flux-theme", next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Semantic color tokens
export function colors(theme: Theme) {
  return theme === "dark"
    ? {
        bg: "#0a0a0a",
        text: "#e0e0e0",
        muted: "#555",
        faint: "#333",
        faintest: "#222",
        border: "#1a1a1a",
        borderSubtle: "#141414",
        toast: "#1a1a1a",
      }
    : {
        bg: "#fafafa",
        text: "#1a1a1a",
        muted: "#999",
        faint: "#bbb",
        faintest: "#ddd",
        border: "#e5e5e5",
        borderSubtle: "#eee",
        toast: "#e5e5e5",
      };
}
