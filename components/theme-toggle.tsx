"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950/70 text-white backdrop-blur transition hover:bg-neutral-900"
        aria-label="Toggle theme"
        disabled
      >
        <Sun size={18} className="text-neutral-400" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="inline-flex size-10 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950/70 text-white backdrop-blur transition hover:bg-neutral-900"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-cyan-300" aria-hidden="true" />
      ) : (
        <Moon size={18} className="text-amber-300" aria-hidden="true" />
      )}
    </button>
  );
}