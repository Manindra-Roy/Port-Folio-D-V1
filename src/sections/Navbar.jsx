import React, { useEffect, useRef, useState } from "react";
import { socials } from "../constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link } from "react-scroll";
import { useMediaQuery } from "react-responsive";

const Navbar = () => {
  const navRef = useRef(null);
  const linksRef = useRef([]);
  const contactRef = useRef(null);
  const topLineRef = useRef(null);
  const bottomLineRef = useRef(null);
  const tl = useRef(null);
  const iconTl = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showBurger, setShowBurger] = useState(true);

  // Media queries
  const isMobileXs = useMediaQuery({ maxWidth: 360 });
  const isMobileSm = useMediaQuery({ minWidth: 361, maxWidth: 640 });
  const isMobileMd = useMediaQuery({ minWidth: 641, maxWidth: 768 });
  const isDeviceLg = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDeviceXl = useMediaQuery({ minWidth: 1025, maxWidth: 1280 });
  const isFHd = useMediaQuery({ minWidth: 1920, maxWidth: 1920 });
  const isMobile = useMediaQuery({ maxWidth: 853 });

  const burgerRef = useRef(null);

  useGSAP(() => {
    // Retain visibility hidden to ensure it's gone when animation completes
    gsap.set(navRef.current, { xPercent: 100, visibility: "hidden" });
    gsap.set([linksRef.current, contactRef.current], {
      autoAlpha: 0,
      x: -20,
    });

    tl.current = gsap
      .timeline({ paused: true })
      .to(navRef.current, {
        xPercent: 0,
        visibility: "visible",
        duration: 1,
        ease: "power3.out",
      })
      .to(
        linksRef.current,
        {
          autoAlpha: 1,
          x: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
        },
        "<"
      )
      .to(
        contactRef.current,
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "<+0.2"
      );

    iconTl.current = gsap
      .timeline({ paused: true })
      .to(topLineRef.current, {
        rotate: 45,
        y: 3.3,
        duration: 0.3,
        ease: "power2.inOut",
      })
      .to(
        bottomLineRef.current,
        {
          rotate: -45,
          y: -3.3,
          duration: 0.3,
          ease: "power2.inOut",
        },
        "<"
      );
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowBurger(currentScrollY <= lastScrollY || currentScrollY < 10);
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        navRef.current &&
        !navRef.current.contains(event.target) &&
        burgerRef.current &&
        !burgerRef.current.contains(event.target)
      ) {
        toggleMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) {
      tl.current.reverse();
      iconTl.current.reverse();
    } else {
      tl.current.play();
      iconTl.current.play();
    }
    setIsOpen(!isOpen);
  };

  const handleLinkClick = (e) => {
    e.stopPropagation();
    toggleMenu();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-center pointer-events-none">
        <div className="relative w-full h-full max-w-[1920px] overflow-hidden">
          <nav
            ref={navRef}
            className="absolute top-0 right-0 pointer-events-auto flex flex-col justify-between w-full h-full px-10 uppercase bg-black text-white/80 py-28 gap-y-10 md:w-1/2"
            onClick={toggleMenu}
          >
            <div
              className="flex flex-col text-5xl gap-y-2 md:text-6xl lg:text-8xl"
              style={{ fontSize: isDeviceXl ? "65px" : "" }}
            >
              {["home", "services", "about", "work", "contact"].map(
                (section, index) => (
                  <div key={index} ref={(el) => (linksRef.current[index] = el)}>
                    <Link
                      className="transition-all duration-300 cursor-pointer hover:text-white"
                      to={`${section}`}
                      smooth
                      offset={0}
                      duration={2000}
                      onClick={handleLinkClick}
                    >
                      {section}
                    </Link>
                  </div>
                )
              )}
            </div>
            <div
              ref={contactRef}
              className="flex flex-col flex-wrap justify-between gap-8 md:flex-row"
            >
              <div className="font-light">
                <p className="tracking-wider text-white/50">E-mail</p>
                <p className="text-xl tracking-widest lowercase text-pretty">
                  TechNet0110@gmail.com
                </p>
              </div>
              <div className="font-light">
                <p className="tracking-wider text-white/50">Social Media</p>
                <div className="flex flex-col flex-wrap md:flex-row gap-x-2">
                  {socials.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="text-sm leading-loose tracking-widest uppercase hover:text-white transition-colors duration-300"
                    >
                      {"{ "}
                      {social.name}
                      {" }"}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div
            ref={burgerRef}
            className="absolute z-50 flex flex-col items-center justify-center gap-1 transition-all duration-300 bg-white rounded-full cursor-pointer w-14 h-14 md:w-20 md:h-20 top-4 right-10 pointer-events-auto"
            onClick={toggleMenu}
            style={
              showBurger
                ? { clipPath: "circle(50% at 50% 50%)" }
                : { clipPath: "circle(0% at 50% 50%)" }
            }
          >
            <span
              ref={topLineRef}
              className="block w-8 h-0.5 bg-black rounded-full origin-center"
            ></span>
            <span
              ref={bottomLineRef}
              className="block w-8 h-0.5 bg-black rounded-full origin-center"
            ></span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
