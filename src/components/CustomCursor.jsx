import React, { useEffect, useRef, useState } from "react";

/**
 * Psychologically engineered dual-layer luxury cursor:
 * 1. Zero-latency inner core dot (instant proprioceptive control, auto-contrast via mix-blend-difference)
 * 2. Fluid spring-damped outer aura ring (frame-rate-independent RAF physics, zero CSS transform conflict)
 * 3. Subtle velocity-driven organic squash & stretch along motion trajectory
 * 4. Fitts's Law magnetic lock-on pull toward interactive targets + semantic mode morphing (pointer / text / project)
 * 5. Kinesthetic click confirmation ripple for tactile closure
 */
const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("default"); // 'default' | 'pointer' | 'text' | 'project'
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  const dotPosRef = useRef(null);
  const ringPosRef = useRef(null);
  const ringWarpRef = useRef(null);
  const rippleRef = useRef(null);

  const modeRef = useRef("default");
  const visibleRef = useRef(false);
  const magnetElRef = useRef(null);

  useEffect(() => {
    const checkEnabled = () => {
      const finePointer = window.matchMedia("(pointer: fine)").matches;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const wideEnough = window.innerWidth >= 1024;
      setEnabled(finePointer && !reducedMotion && wideEnough);
    };

    checkEnabled();
    window.addEventListener("resize", checkEnabled, { passive: true });
    return () => window.removeEventListener("resize", checkEnabled);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const mouse = { x: -200, y: -200 };
    const ring = { x: -200, y: -200 };
    const smoothVel = { x: 0, y: 0 };
    let lastTime = performance.now();
    let rafId = 0;

    const triggerRipple = (x, y) => {
      const el = rippleRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.getAnimations().forEach((anim) => anim.cancel());
      el.animate(
        [
          {
            width: "14px",
            height: "14px",
            opacity: 0.65,
            borderColor: "rgba(231, 197, 130, 0.9)",
          },
          {
            width: "68px",
            height: "68px",
            opacity: 0,
            borderColor: "rgba(207, 163, 85, 0)",
          },
        ],
        {
          duration: 440,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        }
      );
    };

    const resolveTargetMode = (target) => {
      if (!target || typeof target.closest !== "function") {
        magnetElRef.current = null;
        return "default";
      }

      const projectItem = target.closest(".project-item");
      if (projectItem) {
        magnetElRef.current = null;
        return "project";
      }

      const textInput = target.closest(
        "input[type='text'], input[type='email'], input[type='search'], input:not([type]), textarea, [contenteditable='true']"
      );
      if (textInput) {
        magnetElRef.current = null;
        return "text";
      }

      const interactiveEl = target.closest(
        "a, button, [role='button'], label[for], select"
      );
      if (interactiveEl) {
        // Apply subtle Fitts's Law magnetic pull on compact controls (buttons, pills, links)
        const rect = interactiveEl.getBoundingClientRect();
        magnetElRef.current =
          rect.width <= 260 && rect.height <= 96 ? interactiveEl : null;
        return "pointer";
      }

      magnetElRef.current = null;
      return "default";
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!visibleRef.current) {
        ring.x = mouse.x;
        ring.y = mouse.y;
        visibleRef.current = true;
        setVisible(true);
      }

      // Layer 1: Zero-latency precision dot tracks 1:1 immediately
      if (dotPosRef.current) {
        dotPosRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      }

      const nextMode = resolveTargetMode(e.target);
      if (nextMode !== modeRef.current) {
        modeRef.current = nextMode;
        setMode(nextMode);
      }
    };

    const handleMouseDown = (e) => {
      setPressed(true);
      triggerRipple(e.clientX, e.clientY);
    };

    const handleMouseUp = () => setPressed(false);

    const handleHide = () => {
      visibleRef.current = false;
      magnetElRef.current = null;
      setVisible(false);
      setPressed(false);
    };

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (visibleRef.current && ringPosRef.current && ringWarpRef.current) {
        // Compute magnetic target attraction when hovering compact controls
        let targetX = mouse.x;
        let targetY = mouse.y;

        if (modeRef.current === "pointer" && magnetElRef.current) {
          const rect = magnetElRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            targetX = mouse.x + (cx - mouse.x) * 0.26;
            targetY = mouse.y + (cy - mouse.y) * 0.26;
          }
        }

        // Frame-rate-independent exponential spring damping (snappier on hover/text, silkier while gliding)
        const stiffness =
          modeRef.current === "text"
            ? 24
            : modeRef.current === "pointer"
            ? 17
            : modeRef.current === "project"
            ? 12.5
            : 14.5;
        const factor = 1 - Math.exp(-stiffness * dt);

        const prevX = ring.x;
        const prevY = ring.y;
        ring.x += (targetX - ring.x) * factor;
        ring.y += (targetY - ring.y) * factor;

        ringPosRef.current.style.transform = `translate3d(${ring.x.toFixed(
          2
        )}px, ${ring.y.toFixed(2)}px, 0)`;

        // Velocity-driven organic squash & stretch (only while freely navigating in default mode)
        const instVx = dt > 0 ? (ring.x - prevX) / dt : 0;
        const instVy = dt > 0 ? (ring.y - prevY) / dt : 0;
        const velEase = 1 - Math.exp(-16 * dt);
        smoothVel.x += (instVx - smoothVel.x) * velEase;
        smoothVel.y += (instVy - smoothVel.y) * velEase;

        if (modeRef.current === "default") {
          const speed = Math.hypot(smoothVel.x, smoothVel.y);
          const stretch = Math.min(speed * 0.00016, 0.26);
          const angle =
            speed > 18 ? Math.atan2(smoothVel.y, smoothVel.x) : 0;
          const sx = 1 + stretch;
          const sy = 1 - stretch * 0.55;
          ringWarpRef.current.style.transform =
            stretch > 0.005
              ? `rotate(${angle.toFixed(3)}rad) scale(${sx.toFixed(
                  3
                )}, ${sy.toFixed(3)})`
              : "scale(1, 1)";
        } else {
          ringWarpRef.current.style.transform = "scale(1, 1)";
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    window.addEventListener("blur", handleHide);
    document.addEventListener("mouseleave", handleHide);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleHide);
      document.removeEventListener("mouseleave", handleHide);
    };
  }, [enabled]);

  if (!enabled) return null;

  const isProject = mode === "project";
  const isPointer = mode === "pointer";
  const isText = mode === "text";

  return (
    <>
      {/* Layer 3: Kinesthetic Click Confirmation Ripple */}
      <div
        ref={rippleRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[997] pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold opacity-0 will-change-transform"
      />

      {/* Layer 2: Fluid Spring-Damped Aura Ring (Position Layer — zero CSS transform transition) */}
      <div
        ref={ringPosRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[998] pointer-events-none will-change-transform"
      >
        {/* Velocity Squash/Stretch Layer */}
        <div ref={ringWarpRef} className="will-change-transform">
          {/* Semantic Visual Morphing Layer */}
          <div
            className={`-translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-[width,height,background-color,border-color,border-radius,opacity,box-shadow,scale] duration-200 ease-out ${
              !visible
                ? "opacity-0 scale-50"
                : pressed && !isText
                ? "opacity-100 scale-85"
                : "opacity-100 scale-100"
            } ${
              isProject
                ? "w-[84px] h-[84px] rounded-full bg-gold text-obsidian border border-gold-light shadow-[0_12px_36px_rgba(207,163,85,0.45)]"
                : isText
                ? "w-[2px] h-6 rounded-full bg-gold border-0 shadow-[0_0_12px_rgba(207,163,85,0.65)]"
                : isPointer
                ? "w-12 h-12 rounded-full bg-gold/14 border border-gold shadow-[0_0_24px_rgba(207,163,85,0.22)] backdrop-blur-[1px]"
                : "w-8 h-8 rounded-full bg-transparent border border-gold/70 shadow-[0_0_0_1px_rgba(10,10,9,0.22)]"
            }`}
          >
            {isProject && (
              <span className="text-[10px] font-medium tracking-[0.2rem] uppercase select-none whitespace-nowrap">
                View ↗
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Layer 1: Zero-Latency Precision Core Dot (Auto-contrast across dark & light sections) */}
      <div
        ref={dotPosRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[998] pointer-events-none mix-blend-difference will-change-transform"
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-[width,height,opacity] duration-150 ease-out ${
            !visible || isProject || isText
              ? "w-0 h-0 opacity-0"
              : pressed
              ? "w-2 h-2 opacity-100"
              : isPointer
              ? "w-1 h-1 opacity-90"
              : "w-1.5 h-1.5 opacity-95"
          }`}
        />
      </div>
    </>
  );
};

export default CustomCursor;
