import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const ServiceSummary = () => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const triggerConfig = {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.1,
          };

          gsap.fromTo(
            "#title-service-1",
            { xPercent: -8 },
            { xPercent: 8, scrollTrigger: triggerConfig }
          );
          gsap.fromTo(
            "#title-service-2",
            { xPercent: 10 },
            { xPercent: -10, scrollTrigger: triggerConfig }
          );
          gsap.fromTo(
            "#title-service-3",
            { xPercent: -10 },
            { xPercent: 10, scrollTrigger: triggerConfig }
          );
          gsap.fromTo(
            "#title-service-4",
            { xPercent: 8 },
            { xPercent: -8, scrollTrigger: triggerConfig }
          );
        }
      );

      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          const triggerConfig = {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          };

          gsap.fromTo(
            "#title-service-1",
            { xPercent: -5 },
            { xPercent: 5, scrollTrigger: triggerConfig }
          );
          gsap.fromTo(
            "#title-service-2",
            { xPercent: 5 },
            { xPercent: -5, scrollTrigger: triggerConfig }
          );
          gsap.fromTo(
            "#title-service-3",
            { xPercent: -5 },
            { xPercent: 5, scrollTrigger: triggerConfig }
          );
          gsap.fromTo(
            "#title-service-4",
            { xPercent: 5 },
            { xPercent: -5, scrollTrigger: triggerConfig }
          );
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 md:py-32 px-4 overflow-hidden font-light text-center text-obsidian bg-primary"
    >
      <div className="mb-8 sm:mb-12 flex items-center justify-center gap-3">
        <span className="w-8 h-px bg-gold" />
        <p className="text-[10px] sm:text-[11px] tracking-[0.4rem] uppercase text-DarkLava/75">
          Core Capabilities
        </p>
        <span className="w-8 h-px bg-gold" />
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-5 contact-text-responsive select-none uppercase">
        <div id="title-service-1" className="will-change-transform">
          <p className="tracking-tight font-normal text-outline-dark">
            Architecture
          </p>
        </div>

        <div
          id="title-service-2"
          className="flex items-center justify-center gap-1.5 sm:gap-5 will-change-transform"
        >
          <p className="font-normal text-obsidian">Development</p>
          <span className="w-3.5 sm:w-16 md:w-28 h-[2px] bg-gold shrink-0" />
          <p className="text-outline-dark">Deployment</p>
        </div>

        <div
          id="title-service-3"
          className="flex items-center justify-center gap-1.5 sm:gap-5 will-change-transform"
        >
          <p className="text-DarkLava/85">APIs</p>
          <span className="w-3.5 sm:w-16 md:w-28 h-[2px] bg-gold shrink-0" />
          <p className="italic font-normal text-gold">Frontends</p>
          <span className="w-3.5 sm:w-16 md:w-28 h-[2px] bg-gold shrink-0" />
          <p className="text-DarkLava/85">Scalability</p>
        </div>

        <div id="title-service-4" className="will-change-transform">
          <p className="tracking-tight text-obsidian">Databases</p>
        </div>
      </div>
    </section>
  );
};

export default ServiceSummary;
