import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { AnimatedTextLines } from "../components/AnimatedTextLines";
import {
  techStack,
  aboutStats,
  aboutHighlights,
  workflowSteps,
} from "../constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { playClickSound } from "../utils/sound";

gsap.registerPlugin(ScrollTrigger);

const TECH_CATEGORIES = ["All", "Frontend", "Backend", "Cloud & 3D"];

const About = () => {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const statRefs = useRef([]);
  const workflowRefs = useRef([]);
  const processLineRef = useRef(null);

  const [activeTechTab, setActiveTechTab] = useState("All");

  // Keep ScrollTrigger positions accurate when Tech Arsenal filter changes section height
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [activeTechTab]);

  const filteredTech =
    activeTechTab === "All"
      ? techStack
      : techStack.filter((t) => t.category === activeTechTab);

  const text = `Passionate about clean architecture,
    I build scalable, high-performance solutions
    from prototype to production.`;

  const introBio = `Obsessed with building fast, intuitive apps—from pixel-perfect React UIs to bulletproof serverless backends. Every line of code is a promise: quality that users feel immediately.`;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Subtle editorial zoom-out transition on desktop only (avoids empty bottom gap on tall mobile layouts)
      mm.add("(min-width: 768px)", () => {
        gsap.to(sectionRef.current, {
          scale: 0.985,
          transformOrigin: "center top",
          borderBottomLeftRadius: "3rem",
          borderBottomRightRadius: "3rem",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "bottom 85%",
            end: "bottom 20%",
            scrub: true,
          },
          ease: "power1.inOut",
        });
      });

      // Portrait curtain reveal
      if (imgRef.current) {
        gsap.set(imgRef.current, {
          clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        });
        gsap.to(imgRef.current, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1.4,
          ease: "power4.out",
          scrollTrigger: {
            trigger: imgRef.current,
            start: "top 86%",
            once: true,
          },
        });
      }

      // Animated numeric stat counters
      statRefs.current.forEach((el, i) => {
        const stat = aboutStats[i];
        if (!el || stat?.num == null) return;
        const counter = { val: 0 };
        gsap.to(counter, {
          val: stat.num,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            once: true,
          },
          onUpdate: () => {
            el.textContent = `${Math.round(counter.val)}${stat.suffix}`;
          },
        });
      });

      // Scroll-drawn gold connecting line across workflow steps (desktop)
      if (processLineRef.current) {
        gsap.from(processLineRef.current, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".workflow-grid",
            start: "top 90%",
            once: true,
          },
        });
      }

      // Per-card reveal so workflow cards never stay invisible or leave blank space on mobile
      workflowRefs.current.filter(Boolean).forEach((card, idx) => {
        gsap.fromTo(
          card,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            delay: window.innerWidth >= 768 ? idx * 0.08 : 0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 98%",
              once: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [] }
  );

  const handleSpotlightMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="min-h-screen bg-obsidian rounded-b-[2.25rem] sm:rounded-b-[3rem] relative overflow-hidden"
    >
      {/* Ambient Subtle Radial Warmth */}
      <div
        aria-hidden="true"
        className="absolute -bottom-32 left-1/4 w-[520px] h-[520px] rounded-full bg-gold/10 blur-[140px] pointer-events-none"
      />

      <AnimatedHeaderSection
        subTitle="Code with purpose, Built to scale"
        title="About"
        sectionIndex="02"
        text={text}
        textColor="text-white"
        withScrollTrigger={true}
      />

      {/* Editorial Portrait + Bio & Off-Duty Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16 px-6 sm:px-10 pb-16">
        {/* Framed Editorial Portrait */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative group w-full max-w-md p-2.5 rounded-[2rem] border border-white/12 bg-white/[0.02]">
            <span className="absolute -top-px -left-px w-7 h-7 border-t-2 border-l-2 border-gold rounded-tl-2xl pointer-events-none" />
            <span className="absolute -bottom-px -right-px w-7 h-7 border-b-2 border-r-2 border-gold rounded-br-2xl pointer-events-none" />

            <div
              ref={imgRef}
              className="overflow-hidden rounded-[1.5rem] relative"
            >
              <img
                src="/images/man.jpg"
                alt="Manindra Roy"
                loading="lazy"
                onLoad={() => ScrollTrigger.refresh()}
                className="w-full aspect-[4/5] object-cover grayscale-[22%] contrast-[1.04] transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-obsidian/85 via-obsidian/25 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 text-[10px] font-light tracking-[0.14rem] sm:tracking-[0.28rem] uppercase text-white/85">
                <span>Manindra Roy</span>
                <span className="text-gold">West Bengal, IN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio + Luxury 2x2 Highlights Grid */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          <AnimatedTextLines
            text={introBio}
            className="text-xl sm:text-2xl lg:text-[28px] font-light leading-relaxed text-white/80"
          />

          <div>
            <p className="mb-4 text-[11px] font-light tracking-[0.35rem] uppercase text-gold/80">
              When I’m Not Shipping
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aboutHighlights.map((item) => (
                <div
                  key={item.title}
                  onMouseMove={handleSpotlightMove}
                  className="group relative overflow-hidden flex items-start gap-3.5 p-4 rounded-2xl border border-white/10 bg-white/[0.025] hover:border-gold/40 transition-colors duration-300"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(207, 163, 85, 0.1), transparent 70%)",
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-xl bg-gold/10 border border-gold/25 text-gold shrink-0 mt-0.5">
                    <Icon icon={item.icon} className="size-4" />
                  </div>
                  <div className="relative z-10 flex flex-col gap-1">
                    <h3 className="text-sm font-normal tracking-wider uppercase text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-light leading-relaxed text-white/55">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Impact Metrics, Filterable Tech Arsenal & Freelance Process */}
      <div className="px-5 sm:px-10 pb-14 sm:pb-24 relative z-10">
        <div className="w-full h-px mb-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Impact Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-14 sm:mb-16 md:grid-cols-4">
          {aboutStats.map((stat, idx) => (
            <div
              key={stat.label}
              onMouseMove={handleSpotlightMove}
              className="group relative overflow-hidden flex flex-col gap-1.5 p-4 sm:p-6 border rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent hover:border-gold/45 transition-colors duration-300"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(207, 163, 85, 0.12), transparent 70%)",
                }}
              />
              <span
                ref={(el) => (statRefs.current[idx] = el)}
                className="relative z-10 text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-gold tabular-nums"
              >
                {stat.value}
              </span>
              <span className="relative z-10 text-[10px] sm:text-xs font-light tracking-[0.14rem] sm:tracking-[0.22rem] uppercase text-white/55">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Filterable Tech Arsenal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-6 h-px bg-gold" />
            <p className="text-[11px] font-light tracking-[0.4rem] uppercase text-white/55">
              Tech Arsenal &amp; Tools
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {TECH_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTechTab(cat);
                }}
                className={`px-3.5 py-1 text-[10px] sm:text-[11px] tracking-[0.2rem] uppercase rounded-full border cursor-pointer transition-all duration-200 ${
                  activeTechTab === cat
                    ? "bg-gold text-obsidian border-gold font-normal"
                    : "border-white/15 text-white/55 hover:border-gold/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="tech-grid grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredTech.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 sm:py-3.5 transition-all duration-300 border rounded-xl border-white/10 bg-white/[0.03] text-white/80 hover:border-gold/60 hover:text-gold hover:bg-gold/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <Icon icon={tech.icon} className="size-4 sm:size-5 shrink-0" />
                <span className="text-xs sm:text-sm font-light tracking-wider truncate">
                  {tech.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 4-Step Freelance Process Strip with Scroll-Drawn Gold Connecting Line */}
        <div className="w-full h-px my-10 sm:my-14 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <span className="w-6 h-px bg-gold shrink-0" />
          <p className="text-[10px] sm:text-[11px] font-light tracking-[0.22rem] sm:tracking-[0.4rem] uppercase text-white/55">
            How I Work — From Idea to Production
          </p>
        </div>

        <div className="relative">
          {/* Connecting gold hairline across desktop steps */}
          <div
            ref={processLineRef}
            aria-hidden="true"
            className="hidden lg:block absolute top-10 left-8 right-8 h-px bg-gradient-to-r from-gold/60 via-gold/30 to-gold/60 pointer-events-none"
          />

          <div className="workflow-grid grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((item, idx) => (
              <div
                key={item.step}
                ref={(el) => (workflowRefs.current[idx] = el)}
                onMouseMove={handleSpotlightMove}
                className="workflow-card group relative overflow-hidden flex flex-col gap-3 p-5 sm:p-6 transition-colors duration-300 border rounded-2xl border-white/10 bg-obsidian/90 hover:border-gold/55"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(207, 163, 85, 0.1), transparent 70%)",
                  }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-light tracking-[0.25rem] uppercase rounded-full border border-gold/40 text-gold bg-gold/10">
                    Step {item.step}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-gold/40 group-hover:bg-gold transition-colors" />
                </div>
                <h3 className="relative z-10 text-lg sm:text-xl font-normal uppercase text-white mt-1">
                  {item.title}
                </h3>
                <p className="relative z-10 text-sm font-light leading-relaxed text-white/55">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
