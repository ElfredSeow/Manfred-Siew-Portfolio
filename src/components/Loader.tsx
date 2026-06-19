import { useEffect, useRef } from "react";

export function Loader() {
  const nameEl = useRef<HTMLSpanElement>(null);
  const cursorEl = useRef<HTMLSpanElement>(null);
  const nameRowEl = useRef<HTMLDivElement>(null);
  const loaderEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const NAME = "MANFRED SIEW";
    const CHAR_DELAY = 68;

    const typingTimer = setTimeout(() => {
      if (nameRowEl.current) nameRowEl.current.style.opacity = "1";
      let i = 0;
      const interval = setInterval(() => {
        if (!nameEl.current) return;
        if (i < NAME.length) {
          nameEl.current.textContent += NAME[i++];
        } else {
          clearInterval(interval);
          if (cursorEl.current) cursorEl.current.classList.add("loader-cursor-done");
        }
      }, CHAR_DELAY);
    }, 1500);

    const cleanupTimer = setTimeout(() => {
      const el = loaderEl.current;
      if (!el) return;
      el.addEventListener("animationend", (e: AnimationEvent) => {
        if (e.animationName === "loaderExit") el.style.display = "none";
      });
    }, 3700);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(cleanupTimer);
    };
  }, []);

  return (
    <div ref={loaderEl} className="loader-screen" role="status" aria-label="Loading portfolio">
      {/* Corner brackets */}
      <div className="loader-corner loader-corner-tl" />
      <div className="loader-corner loader-corner-tr" />
      <div className="loader-corner loader-corner-bl" />
      <div className="loader-corner loader-corner-br" />

      <div className="loader-center">
        {/* Geometric frame */}
        <div className="loader-frame">
          <svg className="loader-frame-svg" viewBox="0 0 168 88" fill="none">
            {/* Main rect — perimeter 512 */}
            <rect className="loader-frame-rect" x="1" y="1" width="166" height="86" />
            {/* Crosshairs */}
            <line className="loader-frame-cross" x1="84" y1="1"  x2="84"  y2="87" />
            <line className="loader-frame-cross" x1="1"  y1="44" x2="167" y2="44" />
            {/* Corner ticks */}
            <line className="loader-frame-tick" x1="1"   y1="1"  x2="12"  y2="1"  />
            <line className="loader-frame-tick" x1="1"   y1="1"  x2="1"   y2="12" />
            <line className="loader-frame-tick" x1="156" y1="1"  x2="167" y2="1"  />
            <line className="loader-frame-tick" x1="167" y1="1"  x2="167" y2="12" />
            <line className="loader-frame-tick" x1="1"   y1="75" x2="1"   y2="87" />
            <line className="loader-frame-tick" x1="1"   y1="87" x2="12"  y2="87" />
            <line className="loader-frame-tick" x1="167" y1="75" x2="167" y2="87" />
            <line className="loader-frame-tick" x1="156" y1="87" x2="167" y2="87" />
          </svg>
          <span className="loader-initials">MS</span>
        </div>

        {/* Typewriter name */}
        <div ref={nameRowEl} className="loader-name-row">
          <span ref={nameEl} className="loader-name" />
          <span ref={cursorEl} className="loader-cursor" />
        </div>

        {/* Role */}
        <div className="loader-role">Solution Architect &nbsp;·&nbsp; Engineer</div>

        {/* Progress */}
        <div className="loader-progress-track">
          <div className="loader-progress-fill" />
        </div>

        {/* Status */}
        <div className="loader-status">SYSTEM READY</div>
      </div>

      <div className="loader-version">Portfolio v1.0 &nbsp;·&nbsp; 2026</div>
    </div>
  );
}
