import { useRef } from "react";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { servicesData } from "../constants";
import { useMediaQuery } from "react-responsive";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const CARD_SURFACES = ["#0a0a09", "#10100e", "#151412", "#1a1916"];

const Services = () => {
  const sectionRef = useRef(null);
  const innerRefs = useRef([]);
  const isDesktop = useMediaQuery({ minWidth: 768 });

  const text = `I build secure, high-performance full-stack apps
    with smooth UX to drive growth,
    not headaches.`;

  // Animate inner content only — never translate a position:sticky outer container!
  useGSAP(
    () => {
      innerRefs.current.forEach((el) => {
        if (!el) return;
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });
    },
    { scope: sectionRef, dependencies: [] }
  );

  const handleCardMouseMove = (e) => {
    if (!isDesktop) return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      className="bg-obsidian rounded-t-[2.25rem] sm:rounded-t-[3rem] pb-10 sm:pb-16"
    >
      <AnimatedHeaderSection
        subTitle="Behind the scene, Beyond the screen"
        title="Services"
        sectionIndex="01"
        text={text}
        textColor="text-white"
        withScrollTrigger={true}
      />

      <div className="relative">
        {servicesData.map((service, index) => (
          <div
            key={service.title}
            onMouseMove={handleCardMouseMove}
            className={`${
              isDesktop ? "sticky" : "relative"
            } group/card overflow-hidden px-6 sm:px-10 pt-8 pb-10 sm:pt-9 sm:pb-14 text-white border-t border-white/15 shadow-[0_-20px_50px_rgba(0,0,0,0.75)]`}
            style={{
              backgroundColor: CARD_SURFACES[index % CARD_SURFACES.length],
              ...(isDesktop ? { top: `${56 + index * 56}px` } : {}),
            }}
          >
            {/* Subtle Metallic Gold Top Hairline Shimmer */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent opacity-60 group-hover/card:opacity-100 transition-opacity duration-500"
            />

            {/* Mouse-Tracking Subtle Radial Gold Spotlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), rgba(207, 163, 85, 0.085), transparent 65%)",
              }}
            />

            <div
              ref={(el) => (innerRefs.current[index] = el)}
              className="relative z-10 flex flex-col gap-5 sm:gap-6 font-light"
            >
              {/* Top Row: Title & Editorial Gold Index */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2.5 max-w-3xl">
                  <span className="text-[11px] tracking-[0.35rem] uppercase text-gold/80">
                    Capability 0{index + 1}
                  </span>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white">
                    {service.title}
                  </h2>
                </div>
                <span className="hidden sm:block text-5xl lg:text-6xl font-light italic text-gold/25 select-none leading-none group-hover/card:text-gold/45 transition-colors duration-500">
                  0{index + 1}
                </span>
              </div>

              <p className="max-w-3xl text-sm sm:text-base lg:text-lg leading-relaxed tracking-wide text-white/60 text-pretty">
                {service.description}
              </p>

              {/* Stack Tags Strip */}
              {service.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-[10px] sm:text-[11px] tracking-[0.18rem] uppercase rounded-full border border-white/12 bg-white/[0.03] text-white/65 group-hover/card:border-gold/30 group-hover/card:text-gold-light/90 transition-colors duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Sub-Items List */}
              <div className="flex flex-col mt-1 text-base sm:text-xl lg:text-2xl text-white/85">
                {service.items.map((item, itemIndex) => (
                  <div
                    key={`item-${index}-${itemIndex}`}
                    className="group py-3 sm:py-3.5 border-t border-white/12 first:border-t-white/20 transition-all duration-300 hover:pl-2.5"
                  >
                    <h3 className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="text-xs sm:text-sm tracking-widest text-gold/55 group-hover:text-gold transition-colors">
                        0{itemIndex + 1}
                      </span>
                      <span className="font-normal text-white/90 group-hover:text-white transition-colors">
                        {item.title}
                      </span>
                      {item.description && (
                        <span className="text-xs sm:text-sm md:text-base text-white/45 font-light tracking-wide">
                          {item.description}
                        </span>
                      )}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
