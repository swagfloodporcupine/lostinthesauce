"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type SiteHeaderProps = {
  children: ReactNode;
  navLabel?: string;
};

export function SiteHeader({ children, navLabel = "Primary" }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => () => document.body.classList.remove("menu-open"), []);

  return (
    <header className="marketplace-header sticky top-0 z-50 border-b border-neutral-800/90 bg-neutral-950/85 backdrop-blur-md">
      <div className="mx-auto grid min-h-[62px] max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 lg:px-8">
        <Link
          className="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white justify-self-start transition hover:opacity-90"
          href="/"
          aria-label="VibeShift home"
        >
          <svg
            className="h-5 w-5 text-cyan-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 10v4" />
            <path d="M8 6v12" />
            <path d="M12 3v18" />
            <path d="M16 8v8" />
            <path d="M20 11v2" />
          </svg>
          <span>
            vibe<span className="text-cyan-400">shift</span>
          </span>
        </Link>
        <nav id="site-nav" className="marketplace-nav justify-self-center flex items-center gap-3" aria-label={navLabel}>
          {children}
        </nav>
        <button
          className="burger justify-self-end"
          type="button"
          aria-controls="site-nav"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={toggleMenu}
        >
          <span className="burger-bar" />
          <span className="burger-bar" />
        </button>
      </div>
      <div className="menu-backdrop" onClick={closeMenu} />
    </header>
  );
}
