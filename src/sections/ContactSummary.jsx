import { useRef } from "react";
import Marquee from "../components/Marquee";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const TOP_MARQUEE_ITEMS = [
  "Innovation",
  "Precision",
  "Trust",
  "Collaboration",
  "Excellence",
];

const BOTTOM_MARQUEE_ITEMS = [
  "contact me",
  "contact me",
  "contact me",
  "contact me",
  "contact me",
];

const QUOTE_LINES = [
  [
    { text: "“ Let’s", style: "" },
    { text: "build", style: "" },
    { text: "a", style: "" },
  ],
  [
    { text: "memorable", style: "font-normal" },
    { text: "&", style: "text-gold" },
    { text: "inspiring", style: "italic" },
  ],
  [
    { text: "web", style: "" },
    { text: "application", style: "" },
    { text: "together ”", style: "text-gold font-normal" },
  ],
];

const ContactSummary = () => {
  const containerRef = useRef(null);
  const wordRefs = useRef([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const words = wordRefs.current.filter(Boolean);
        gsap.fromTo(
          words,
          { opacity: 0.16, y: 12 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 78%",
              end: "center 45%",
              scrub: 0.6,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [] }
  );

  let wordCounter = 0;

  return (
    <section
      ref={containerRef}
      className="flex flex-col items-center justify-between gap-14 sm:gap-20 py-10 sm:py-16 bg-primary text-obsidian overflow-hidden"
    >
      <Marquee items={TOP_MARQUEE_ITEMS} className="text-white bg-obsidian" />

      <div className="px-6 sm:px-10 py-10 sm:py-16 font-light text-center contact-text-responsive">
        <div className="flex flex-col items-center gap-1 sm:gap-2 tracking-tight">
          {QUOTE_LINES.map((line, lineIdx) => (
            <div
              key={lineIdx}
              className="flex flex-wrap items-baseline justify-center gap-x-3 sm:gap-x-5"
            >
              {line.map((word) => {
                const idx = wordCounter++;
                return (
                  <span
                    key={`${lineIdx}-${idx}`}
                    ref={(el) => (wordRefs.current[idx] = el)}
                    className={`inline-block will-change-[opacity,transform] ${word.style}`}
                  >
                    {word.text}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Marquee
        items={BOTTOM_MARQUEE_ITEMS}
        reverse={true}
        className="text-obsidian bg-transparent border-y border-obsidian/25"
        iconClassName="stroke-gold stroke-2 text-primary"
        icon="material-symbols-light:square"
      />
    </section>
  );
};

export default ContactSummary;
