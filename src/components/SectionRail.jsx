import React, { useEffect, useState } from "react";
import { scrollToSection } from "../utils/scroll";
import { playClickSound } from "../utils/sound";

const SECTIONS = [
  { id: "home", num: "01", label: "Home" },
  { id: "services", num: "02", label: "Services" },
  { id: "about", num: "03", label: "About" },
  { id: "work", num: "04", label: "Works" },
  { id: "contact", num: "05", label: "Contact" },
];

const SectionRail = () => {
  const [active, setActive] = useState("home");
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolledPastHero(window.scrollY > window.innerHeight * 0.55);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    );
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-42% 0px -45% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Persistent Minimal Top-Left Brand Pill (appears after Hero) */}
      <button
        type="button"
        onClick={() => {
          playClickSound();
          scrollToSection("home");
        }}
        aria-label="Scroll to top"
        className={`fixed top-4 sm:top-5 left-5 sm:left-10 z-40 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-obsidian/88 border border-gold/40 text-white backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.4)] cursor-pointer transition-all duration-400 hover:border-gold hover:scale-[1.03] ${
          scrolledPastHero
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        <span className="text-xs font-normal tracking-[0.25rem] uppercase">
          MR<span className="text-gold">.</span>
        </span>
        <span className="hidden sm:inline text-[10px] font-light tracking-[0.22rem] uppercase text-white/45 border-l border-white/15 pl-2.5">
          {SECTIONS.find((s) => s.id === active)?.label}
        </span>
      </button>

      {/* Right-Edge Minimal Section Rail (Large Desktop) */}
      <aside
        aria-label="Section Progress"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end gap-3 pointer-events-auto"
      >
        {SECTIONS.map((sec) => {
          const isActive = active === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                playClickSound();
                scrollToSection(sec.id);
              }}
              aria-label={`Jump to ${sec.label}`}
              className="group flex items-center gap-2.5 py-1 cursor-pointer"
            >
              <span
                className={`text-[10px] font-light tracking-[0.22rem] uppercase px-2 py-0.5 rounded-full bg-obsidian/85 border border-white/10 backdrop-blur-md transition-all duration-250 ${
                  isActive
                    ? "opacity-0 group-hover:opacity-100 text-gold border-gold/40"
                    : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-white/80"
                }`}
              >
                {sec.num} {sec.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-2.5 h-7 bg-gold shadow-[0_0_12px_rgba(207,163,85,0.65)]"
                    : "w-1.5 h-1.5 bg-SageGray/70 group-hover:bg-gold group-hover:h-3"
                }`}
              />
            </button>
          );
        })}
      </aside>
    </>
  );
};

export default SectionRail;
