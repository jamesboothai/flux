"use client";

import Link from "next/link";
import { ThemeProvider, useTheme, colors } from "@/lib/theme";

function FluxInner({
  logoutAction,
  children,
}: {
  logoutAction: () => void;
  children: React.ReactNode;
}) {
  const { theme, toggle } = useTheme();
  const c = colors(theme);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: c.bg }}
    >
      <main className="max-w-2xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1
              className="text-xs tracking-widest transition-colors"
              style={{ color: c.faint }}
            >
              flux
            </h1>
            <p
              className="text-[10px] mt-0.5 transition-colors"
              style={{ color: c.faintest }}
            >
              by james booth
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: c.faint }}
            >
              logout
            </button>
          </form>
        </header>

        {children}
      </main>

      <Link
        href="/tasks"
        className="fixed bottom-6 left-6 text-[10px] tracking-wider hover:opacity-70 transition-opacity cursor-pointer"
        style={{ color: c.faint }}
      >
        tasks
      </Link>

      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 text-[10px] tracking-wider hover:opacity-70 transition-opacity cursor-pointer"
        style={{ color: c.faint }}
      >
        {theme === "dark" ? "light" : "dark"}
      </button>
    </div>
  );
}

export function FluxShell({
  logoutAction,
  children,
}: {
  logoutAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <FluxInner logoutAction={logoutAction}>{children}</FluxInner>
    </ThemeProvider>
  );
}
