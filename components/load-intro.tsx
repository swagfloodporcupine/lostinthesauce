"use client";

import { useEffect, useState } from "react";

/**
 * Brand intro shown on every hard page load: the waveform bars assemble, the
 * wordmark slides together, the lockup spins a full 360° and the curtain lifts.
 * The animation itself is pure CSS (so it also plays before hydration and with
 * JS disabled); this component only unmounts the overlay once it is finished.
 */
export function LoadIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Slightly after the 2.6s CSS timeline so the curtain has fully lifted.
    const timer = window.setTimeout(() => setVisible(false), 2700);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="vs-intro" aria-hidden="true">
      <div className="vs-intro__lockup">
        <div className="vs-intro__mark">
          <span className="vs-intro__bar" />
          <span className="vs-intro__bar" />
          <span className="vs-intro__bar" />
          <span className="vs-intro__bar" />
          <span className="vs-intro__bar" />
        </div>
        <div className="vs-intro__word">
          <span className="vs-intro__word-piece">vibe</span>
          <span className="vs-intro__word-piece">shift</span>
        </div>
      </div>
    </div>
  );
}
