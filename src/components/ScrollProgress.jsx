import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Magnetic from "./Magnetic";
import { scrollToSection } from "../utils/scroll";
import { playClickSound } from "../utils/sound";

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ScrollProgress = () => {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled =
        docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setScrollPercent(scrolled);
      setShowTopBtn(scrollTop > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const strokeDashoffset =
    CIRCUMFERENCE - (scrollPercent / 100) * CIRCUMFERENCE;

  return (
    <>
      {/* Top 2px Champagne-Gold Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[90] h-[2px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-gold/70 via-gold to-gold-light transition-[width] duration-75 ease-out"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* Floating Circular-Progress Back to Top Button */}
      <div
        className={`fixed bottom-6 right-5 sm:right-10 z-40 transition-all duration-300 ${
          showTopBtn
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <Magnetic strength={0.3}>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              scrollToSection("home");
            }}
            aria-label="Back to top"
            className="relative group flex items-center justify-center w-12 h-12 rounded-full bg-obsidian/90 text-gold backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.45)] cursor-pointer transition-all duration-300 hover:bg-gold hover:text-obsidian"
          >
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="1.5"
              />
              <circle
                cx="24"
                cy="24"
                r={RADIUS}
                fill="none"
                stroke="#cfa355"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-100 ease-out group-hover:stroke-obsidian"
              />
            </svg>
            <Icon
              icon="lucide:arrow-up"
              className="size-4 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          </button>
        </Magnetic>
      </div>
    </>
  );
};

export default ScrollProgress;
