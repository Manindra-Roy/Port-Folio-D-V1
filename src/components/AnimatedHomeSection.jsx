import React, { useRef } from "react";
import { AnimatedHomeTextLines } from "../components/AnimatedHomeTextLines";
import Magnetic from "../components/Magnetic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { scrollToSection } from "../utils/scroll";
import { playClickSound } from "../utils/sound";

const AnimatedHomeSection = ({
  subTitle,
  title,
  text,
  textColor = "text-white",
  isReady = true,
}) => {
  const contextRef = useRef(null);
  const eyebrowRef = useRef(null);
  const wordRefs = useRef([]);
  const ruleRef = useRef(null);

  const titleParts = title.split(" ");

  useGSAP(
    () => {
      const words = wordRefs.current.filter(Boolean);
      if (!isReady) {
        gsap.set(eyebrowRef.current, { opacity: 0, y: 20 });
        gsap.set(words, { yPercent: 115, opacity: 0 });
        gsap.set(ruleRef.current, { scaleX: 0, transformOrigin: "left center" });
        return;
      }

      const tl = gsap.timeline({ delay: 0.14 });
      tl.to(eyebrowRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .to(
          words,
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.11,
            ease: "power4.out",
          },
          "<+0.08"
        )
        .to(
          ruleRef.current,
          {
            scaleX: 1,
            duration: 0.95,
            ease: "power3.out",
          },
          "<+0.25"
        );
    },
    { scope: contextRef, dependencies: [isReady] }
  );

  return (
    <div ref={contextRef} className="relative z-10 w-full mt-auto">
      <div className="px-5 sm:px-10">
        <div className="flex flex-col justify-center gap-2.5 sm:gap-5">
          <div
            ref={eyebrowRef}
            className="flex items-center gap-2 sm:gap-3 justify-center md:justify-start"
          >
            <span className="w-4 sm:w-7 h-px bg-gold shrink-0" />
            <p className="text-[10px] sm:text-xs font-light tracking-[0.2rem] sm:tracking-[0.45rem] uppercase text-gold/90 text-center md:text-left">
              {subTitle}
            </p>
          </div>

          <h1
            className={`uppercase hero-title-responsive text-center md:text-left ${textColor}`}
          >
            {titleParts.map((part, index) => (
              <span
                key={index}
                className="inline-block overflow-hidden align-bottom mr-2 sm:mr-6 pb-1"
              >
                <span
                  ref={(el) => (wordRefs.current[index] = el)}
                  className={
                    index === 1
                      ? "italic font-light text-white/95 inline-block"
                      : "font-normal inline-block"
                  }
                >
                  {part}
                </span>
              </span>
            ))}
            <span className="inline-block overflow-hidden align-bottom pb-1">
              <span
                ref={(el) => (wordRefs.current[titleParts.length] = el)}
                className="text-gold inline-block"
              >
                .
              </span>
            </span>
          </h1>
        </div>
      </div>

      <div
        className={`relative mt-3.5 sm:mt-8 px-5 sm:px-10 pb-5 sm:pb-10 ${textColor}`}
      >
        <div
          ref={ruleRef}
          className="w-full h-px bg-gradient-to-r from-gold/60 via-white/25 to-white/10"
        />

        <div className="pt-3.5 sm:pt-8 flex flex-col md:flex-row md:items-end justify-between gap-3.5 sm:gap-6">
          {/* Editorial Scroll Cue + Primary CTA (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                scrollToSection("services");
              }}
              className="inline-flex items-center gap-3.5 text-[11px] font-light tracking-[0.3rem] uppercase text-white/50 hover:text-gold transition-colors cursor-pointer group"
            >
              <span className="relative w-px h-10 bg-white/15 overflow-hidden">
                <span className="absolute inset-x-0 top-0 h-1/2 bg-gold animate-scroll-cue" />
              </span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                Scroll to Explore
              </span>
            </button>

            <Magnetic strength={0.22}>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  scrollToSection("work");
                }}
                className="px-5 py-2.5 text-[11px] font-light tracking-[0.25rem] uppercase rounded-full border border-gold/45 text-gold hover:bg-gold hover:text-obsidian transition-colors cursor-pointer"
              >
                Selected Works ↗
              </button>
            </Magnetic>
          </div>

          <AnimatedHomeTextLines
            text={text}
            isReady={isReady}
            className="max-w-2xl md:ml-auto font-light uppercase value-text-responsive text-center md:text-right text-white/80"
          />

          {/* Mobile Primary Action Row */}
          <div className="flex md:hidden items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                scrollToSection("work");
              }}
              className="px-5 py-2.5 text-[11px] font-normal tracking-[0.22rem] uppercase rounded-full bg-gold text-obsidian active:scale-95 transition-transform cursor-pointer"
            >
              Selected Works ↗
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                scrollToSection("services");
              }}
              className="px-4 py-2.5 text-[11px] font-light tracking-[0.22rem] uppercase rounded-full border border-white/20 text-white/75 active:border-gold active:text-gold active:scale-95 transition-all cursor-pointer"
            >
              Explore ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedHomeSection;
