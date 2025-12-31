import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
gsap.registerPlugin(ScrollTrigger);
export const AnimatedTextLines = ({ text, className }) => {
  const isMobileXs = useMediaQuery({ maxWidth: 360 });
  const isMobileSm = useMediaQuery({ minWidth: 361, maxWidth: 640 });
  const isMobileMd = useMediaQuery({ minWidth: 641, maxWidth: 768 });
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const isDeviceLg = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDeviceXl = useMediaQuery({ minWidth: 1025, maxWidth: 1280 });
  const isFHd = useMediaQuery({ minWidth: 1920, maxWidth: 1920 });
  const containerRef = useRef(null);
  const lineRefs = useRef([]);
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  useGSAP(() => {
    if (lineRefs.current.length > 0) {
      gsap.from(lineRefs.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "back.out",
        scrollTrigger: {
          trigger: containerRef.current,
        },
      });
    }
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        fontSize: isMobileXs
          ? "15px"
          : isFHd
          ? "27.5px"
          : isDeviceXl
          ? "20px"
          : "",
      }}
    >
      {lines.map((line, index) => (
        <span
          key={index}
          ref={(el) => (lineRefs.current[index] = el)}
          className="block leading-relaxed tracking-wide text-pretty"
        >
          {line}
        </span>
      ))}
    </div>
  );
};
