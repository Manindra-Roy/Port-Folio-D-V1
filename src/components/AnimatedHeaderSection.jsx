import React, { useRef } from "react";
import { AnimatedTextLines } from "../components/AnimatedTextLines";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const AnimatedHeaderSection = ({
  subTitle,
  title,
  text,
  textColor = "text-white",
  sectionIndex = "",
  withScrollTrigger = false,
}) => {
  const contextRef = useRef(null);
  const subRef = useRef(null);
  const wordRefs = useRef([]);
  const lineRef = useRef(null);

  const isLight = textColor.includes("black");
  const titleParts = title.includes(" ") ? title.split(" ") : [title];

  useGSAP(
    () => {
      const words = wordRefs.current.filter(Boolean);
      const tl = gsap.timeline({
        scrollTrigger: withScrollTrigger
          ? {
              trigger: contextRef.current,
              start: "top 82%",
              once: true,
            }
          : undefined,
      });

      tl.from(subRef.current, {
        opacity: 0,
        y: 22,
        duration: 0.7,
        ease: "power3.out",
      })
        .from(
          words,
          {
            yPercent: 115,
            opacity: 0,
            duration: 0.95,
            stagger: 0.08,
            ease: "power4.out",
          },
          "<+0.08"
        )
        .from(
          lineRef.current,
          {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.9,
            ease: "power3.out",
          },
          "<+0.2"
        );
    },
    { scope: contextRef, dependencies: [] }
  );

  return (
    <div ref={contextRef}>
      <div className="flex flex-col justify-center gap-4 pt-12 sm:pt-20 sm:gap-8 px-5 sm:px-10">
        <div
          ref={subRef}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mx-auto md:mx-0">
            <span className="w-5 sm:w-7 h-px bg-gold shrink-0" />
            <p
              className={`text-[10px] sm:text-xs font-light tracking-[0.2rem] sm:tracking-[0.42rem] uppercase text-center md:text-left ${
                isLight ? "text-DarkLava/80" : "text-gold/90"
              }`}
            >
              {subTitle}
            </p>
          </div>
          {sectionIndex && (
            <span
              className={`hidden md:inline-block text-xs font-light tracking-[0.3rem] uppercase ${
                isLight ? "text-DarkLava/50" : "text-white/30"
              }`}
            >
              [ {sectionIndex} ]
            </span>
          )}
        </div>

        <h1
          className={`uppercase font-normal banner-text-responsive text-center md:text-left ${textColor}`}
        >
          {titleParts.map((part, index) => (
            <span
              key={index}
              className="inline-block overflow-hidden align-bottom mr-3 sm:mr-5 pb-1"
            >
              <span
                ref={(el) => (wordRefs.current[index] = el)}
                className="inline-block"
              >
                {part}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <div className={`relative mt-6 sm:mt-10 px-5 sm:px-10 ${textColor}`}>
        <div
          ref={lineRef}
          className={`w-full h-px ${
            isLight
              ? "bg-gradient-to-r from-obsidian/35 via-obsidian/20 to-transparent"
              : "bg-gradient-to-r from-gold/45 via-white/20 to-transparent"
          }`}
        />
        <div className="py-7 sm:py-14 flex justify-center md:justify-end">
          <AnimatedTextLines
            text={text}
            className={`max-w-2xl font-light uppercase value-text-responsive text-center md:text-right ${
              isLight ? "text-obsidian/80" : "text-white/75"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedHeaderSection;
