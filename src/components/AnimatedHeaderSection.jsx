import React from "react";
import { useRef } from "react";
import { AnimatedTextLines } from "../components/AnimatedTextLines";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMediaQuery } from "react-responsive";
const AnimatedHeaderSection = ({
  subTitle,
  title,
  text,
  textColor,
  withScrollTrigger = false,
}) => {
  const isMobileXs = useMediaQuery({ maxWidth: 360 });
  const isMobileSm = useMediaQuery({ minWidth: 361, maxWidth: 640 });
  const isMobileMd = useMediaQuery({ minWidth: 641, maxWidth: 768 });
  const isDeviceLg = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDeviceXl = useMediaQuery({ minWidth: 1025, maxWidth: 1280 });
  const isFHd = useMediaQuery({ minWidth: 1920, maxWidth: 1920 });
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const contextRef = useRef(null);
  const headerRef = useRef(null);
  const shouldSplitTitle = title.includes(" ");
  const titleParts = shouldSplitTitle ? title.split(" ") : [title];
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: withScrollTrigger
        ? {
            trigger: contextRef.current,
          }
        : undefined,
    });
    tl.from(contextRef.current, {
      y: "50vh",
      duration: 1,
      ease: "circ.out",
    });
    tl.from(
      headerRef.current,
      {
        opacity: 0,
        y: "200",
        duration: 1,
        ease: "circ.out",
      },
      "<+0.2"
    );
  }, []);
  return (
    <div ref={contextRef}>
      <div style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}>
        <div
          ref={headerRef}
          className="flex flex-col justify-center gap-12 pt-16 sm:gap-16"
        >
          <p
            className={`${
              isMobileXs || isMobileSm
                ? "text-xs text-center"
                : isMobileMd
                ? "text-center"
                : "text-sm"
            } font-light tracking-[0.5rem] uppercase px-10 ${textColor}`}
            style={{fontSize: isMobileXs?"10px":""}}
          >
            {subTitle}
          </p>
          <div className="px-10">
            <h1
              className={`flex flex-col gap-12 uppercase banner-text-responsive sm:gap-16 md:block ${textColor} ${
                isMobileXs || isMobileSm
                  ? "text-5xl text-center"
                  : isMobileMd
                  ? "text-center"
                  : ""
              }`}
              style={{
                fontSize: isMobileXs
                  ? "45px"
                  : isMobileMd
                  ? "115px"
                  : isDeviceLg
                  ? "95px"
                  : isFHd
                  ? "110px"
                  : isDeviceXl
                  ? "83.3px"
                  : "",
              }}
            >
              {titleParts.map((part, index) => (
                <span key={index}>{part} </span>
              ))}
            </h1>
          </div>
        </div>
      </div>
      <div className={`relative px-10 ${textColor}`}>
        <div className="absolute inset-x-0 border-t-2" />
        <div className="py-12 sm:py-16 text-end">
          <AnimatedTextLines
            text={text}
            className={`font-light uppercase value-text-responsive ${textColor} ${
              isMobileXs || isMobileSm
                ? "text-lg text-center"
                : isMobileMd
                ? "text-2xl text-center"
                : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedHeaderSection;
