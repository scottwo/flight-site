"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const storageKey = "mypilotpage-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem(storageKey) as Theme | null) : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(storageKey, next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs font-semibold text-[var(--text-strong)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--text)]"
      aria-label="Toggle color theme"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
