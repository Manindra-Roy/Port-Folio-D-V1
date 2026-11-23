import React, { useEffect, useState } from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import ServiceSummary from "./sections/ServiceSummary";
import Services from "./sections/Services";
import ReactLenis, { useLenis } from "lenis/react";
import About from "./sections/About";
import Works from "./sections/Works";
import ContactSummary from "./sections/ContactSummary";
import Contact from "./sections/Contact";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import CommandPalette from "./components/CommandPalette";
import SectionRail from "./components/SectionRail";
import Toast from "./components/Toast";
import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { setLenisInstance } from "./utils/scroll";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_TITLE = "Manindra Roy | Freelance Full-Stack Developer for Hire";
const AWAY_TITLE = "✦ Let's Build Together — Manindra Roy";

const LenisBridge = () => {
  const lenis = useLenis(() => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    if (lenis) {
      setLenisInstance(lenis);
    }
    return () => setLenisInstance(null);
  }, [lenis]);

  return null;
};

const App = () => {
  const { progress, active } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  // Smoothly animate counter forward so it never freezes on cached loads
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const target = isReady
          ? 100
          : progress > 0
          ? Math.max(prev, progress)
          : Math.min(88, prev + 8);
        if (prev >= target) return prev;
        const step = Math.max(2, Math.ceil((target - prev) * 0.3));
        return Math.min(100, prev + step);
      });
    }, 28);
    return () => clearInterval(interval);
  }, [progress, isReady]);

  // Mark ready as soon as Three.js finishes or cached assets resolve
  useEffect(() => {
    if (progress === 100 || (!active && progress > 0)) {
      setDisplayProgress(100);
      const t = setTimeout(() => setIsReady(true), 180);
      return () => clearTimeout(t);
    }
  }, [progress, active]);

  // Snappy fallback when model is already cached in memory
  useEffect(() => {
    const quickReady = setTimeout(() => {
      if (!active) {
        setDisplayProgress(100);
        setIsReady(true);
      }
    }, 650);

    const maxFallback = setTimeout(() => {
      setDisplayProgress(100);
      setIsReady(true);
    }, 1800);

    return () => {
      clearTimeout(quickReady);
      clearTimeout(maxFallback);
    };
  }, [active]);

  useEffect(() => {
    if (!isReady) return;
    const unmountTimer = setTimeout(() => {
      setShowLoader(false);
      ScrollTrigger.refresh();
    }, 950);
    return () => clearTimeout(unmountTimer);
  }, [isReady]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      document.title = document.hidden ? AWAY_TITLE : DEFAULT_TITLE;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <ReactLenis
      root
      options={{ lerp: 0.09, smoothWheel: true }}
      className="relative w-full max-w-[1920px] mx-auto min-h-screen overflow-x-clip"
    >
      <LenisBridge />

      {/* Subtle tactile film grain overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[95] pointer-events-none film-grain"
      />

      {/* Cinematic Curtain-Wipe Preloader */}
      {showLoader && (
        <div
          className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-obsidian text-white transition-transform duration-900 ease-[cubic-bezier(0.76,0,0.24,1)] ${
            isReady
              ? "-translate-y-full pointer-events-none"
              : "translate-y-0"
          }`}
        >
          <div className="flex flex-col items-center px-6">
            <span className="mb-4 inline-flex items-center gap-2.5 text-[11px] font-light tracking-[0.45rem] uppercase text-gold/90">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Manindra Roy
            </span>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-6xl sm:text-7xl font-light tracking-tight tabular-nums text-white">
                {String(Math.floor(displayProgress)).padStart(2, "0")}
              </span>
              <span className="text-lg font-light text-gold">%</span>
            </div>

            <div className="relative w-56 sm:w-72 h-[2px] overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold/60 via-gold to-gold-light transition-all duration-150 ease-out"
                style={{ width: `${displayProgress}%` }}
              />
            </div>

            <p className="mt-5 text-[10px] font-light tracking-[0.35rem] uppercase text-white/35">
              Crafting Digital Architecture
            </p>
          </div>
        </div>
      )}

      <CustomCursor />
      <ScrollProgress />
      <SectionRail />
      <CommandPalette />
      <Toast />

      <main className="relative bg-primary">
        <Navbar />
        <Hero isReady={isReady} />
        <ServiceSummary />
        <Services />
        <About />
        <Works />
        <ContactSummary />
        <Contact />
      </main>
    </ReactLenis>
  );
};

export default App;
