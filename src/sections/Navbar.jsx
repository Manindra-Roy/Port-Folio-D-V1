import React, { useCallback, useEffect, useRef, useState } from "react";
import { socials } from "../constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { isSoundEnabled, playClickSound, toggleSound } from "../utils/sound";
import { scrollToSection, startLenis, stopLenis } from "../utils/scroll";
import Magnetic from "../components/Magnetic";

const NAV_SECTIONS = ["home", "services", "about", "work", "contact"];

const Navbar = () => {
  const navRef = useRef(null);
  const backdropRef = useRef(null);
  const linksRef = useRef([]);
  const contactRef = useRef(null);
  const topLineRef = useRef(null);
  const bottomLineRef = useRef(null);
  const tl = useRef(null);
  const iconTl = useRef(null);
  const burgerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [showBurger, setShowBurger] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    const handleSoundEvent = (e) => setSoundOn(e.detail);
    window.addEventListener("sound-toggle", handleSoundEvent);
    return () => window.removeEventListener("sound-toggle", handleSoundEvent);
  }, []);

  // Lock background scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      stopLenis();
      document.body.style.overflow = "hidden";
    } else {
      startLenis();
      document.body.style.overflow = "";
    }
    return () => {
      startLenis();
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Track active section in viewport
  useEffect(() => {
    const elements = NAV_SECTIONS.map((id) =>
      document.getElementById(id)
    ).filter(Boolean);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    gsap.set(navRef.current, { xPercent: 100, visibility: "hidden" });
    gsap.set(backdropRef.current, { autoAlpha: 0, pointerEvents: "none" });
    gsap.set([linksRef.current, contactRef.current], {
      autoAlpha: 0,
      x: -24,
    });

    tl.current = gsap
      .timeline({ paused: true })
      .to(backdropRef.current, {
        autoAlpha: 1,
        pointerEvents: "auto",
        duration: 0.4,
        ease: "power2.out",
      })
      .to(
        navRef.current,
        {
          xPercent: 0,
          visibility: "visible",
          duration: 0.78,
          ease: "power3.out",
        },
        "<"
      )
      .to(
        linksRef.current,
        {
          autoAlpha: 1,
          x: 0,
          stagger: 0.065,
          duration: 0.42,
          ease: "power2.out",
        },
        "<+0.16"
      )
      .to(
        contactRef.current,
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.42,
          ease: "power2.out",
        },
        "<+0.18"
      );

    // Mathematically centered X transform (gap-1.5 = 6px + line 1.5px => ±3.75px)
    iconTl.current = gsap
      .timeline({ paused: true })
      .to(topLineRef.current, {
        rotate: 45,
        y: 3.75,
        duration: 0.28,
        ease: "power2.inOut",
      })
      .to(
        bottomLineRef.current,
        {
          rotate: -45,
          y: -3.75,
          duration: 0.28,
          ease: "power2.inOut",
        },
        "<"
      );
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowBurger(
        isOpen || currentScrollY <= lastScrollY || currentScrollY < 30
      );
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  const toggleMenu = useCallback(() => {
    playClickSound();
    if (isOpen) {
      tl.current?.reverse();
      iconTl.current?.reverse();
    } else {
      tl.current?.play();
      iconTl.current?.play();
    }
    setIsOpen((prev) => !prev);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen) {
        toggleMenu();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggleMenu]);

  const handleNavigate = (section) => {
    toggleMenu();
    setTimeout(() => scrollToSection(section), 140);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center pointer-events-none">
      <div className="relative w-full h-full max-w-[1920px] overflow-hidden">
        {/* Frosted Dark Backdrop */}
        <div
          ref={backdropRef}
          onClick={toggleMenu}
          aria-hidden="true"
          className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        />

        {/* Slide-Out Editorial Navigation Drawer */}
        <nav
          ref={navRef}
          data-lenis-prevent
          aria-label="Primary Navigation"
          className="absolute top-0 right-0 pointer-events-auto flex flex-col justify-between w-full h-full overflow-y-auto px-7 sm:px-12 uppercase bg-obsidian border-l border-white/10 text-white/80 py-20 sm:py-24 gap-y-8 md:w-1/2 lg:w-[45%] shadow-[-30px_0_80px_rgba(0,0,0,0.85)]"
        >
          <div className="flex flex-col gap-y-2 sm:gap-y-2.5">
            <p className="mb-2 text-[10px] font-light tracking-[0.45rem] text-gold/80">
              Navigation
            </p>
            {NAV_SECTIONS.map((section, index) => {
              const isActive = activeSection === section;
              return (
                <div key={section} ref={(el) => (linksRef.current[index] = el)}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(section)}
                    style={{ fontSize: "clamp(2rem, 4.4vw, 4.25rem)" }}
                    className={`inline-flex items-baseline gap-4 leading-[1.08] font-light uppercase transition-all duration-300 cursor-pointer group hover:text-white hover:translate-x-2 ${
                      isActive ? "text-white" : "text-white/65"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-light tracking-widest text-gold/75 group-hover:text-gold">
                      0{index + 1}
                    </span>
                    <span className={isActive ? "italic text-gold-light" : ""}>
                      {section}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-gold self-center ml-1" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div
            ref={contactRef}
            className="flex flex-col gap-5 pt-6 border-t border-white/15"
          >
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-light tracking-[0.25rem]">
              <button
                type="button"
                onClick={() => toggleSound()}
                className="px-3.5 py-1.5 border rounded-full border-white/15 text-white/70 hover:border-gold hover:text-gold transition-colors cursor-pointer uppercase"
              >
                Sound: {soundOn ? "ON" : "OFF"}
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleMenu();
                  window.dispatchEvent(new CustomEvent("open-command-palette"));
                }}
                className="px-3.5 py-1.5 border rounded-full border-white/15 text-white/70 hover:border-gold hover:text-gold transition-colors cursor-pointer uppercase"
              >
                Quick Menu ⌘K
              </button>
            </div>

            <div className="flex flex-col flex-wrap justify-between gap-5 sm:flex-row">
              <div className="font-light">
                <p className="text-xs tracking-[0.3rem] text-white/40 mb-1">
                  E-mail
                </p>
                <a
                  href="mailto:TechNet0110@gmail.com"
                  className="text-sm sm:text-base tracking-widest lowercase text-white/85 hover:text-gold transition-colors duration-300"
                >
                  TechNet0110@gmail.com
                </a>
              </div>
              <div className="font-light">
                <p className="text-xs tracking-[0.3rem] text-white/40 mb-1">
                  Socials
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs leading-loose tracking-widest uppercase text-white/75 hover:text-gold transition-colors duration-300"
                    >
                      {"{ "}
                      {social.name}
                      {" }"}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* High-Contrast Luxury Floating Magnetic Burger Button */}
        <div
          className={`absolute z-50 top-4 sm:top-5 right-5 sm:right-10 transition-all duration-300 ${
            showBurger
              ? "scale-100 opacity-100 pointer-events-auto"
              : "scale-0 opacity-0 pointer-events-none"
          }`}
        >
          <Magnetic strength={0.3}>
            <button
              type="button"
              ref={burgerRef}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              onClick={toggleMenu}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 rounded-full cursor-pointer w-12 h-12 sm:w-14 sm:h-14 border backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.45)] ${
                isOpen
                  ? "bg-gold border-gold text-obsidian"
                  : "bg-obsidian/90 border-gold/50 text-white hover:border-gold"
              }`}
            >
              <span
                ref={topLineRef}
                className={`block w-5 sm:w-6 h-[1.5px] rounded-full origin-center transition-colors ${
                  isOpen ? "bg-obsidian" : "bg-white"
                }`}
              />
              <span
                ref={bottomLineRef}
                className={`block w-5 sm:w-6 h-[1.5px] rounded-full origin-center transition-colors ${
                  isOpen ? "bg-obsidian" : "bg-gold"
                }`}
              />
            </button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
