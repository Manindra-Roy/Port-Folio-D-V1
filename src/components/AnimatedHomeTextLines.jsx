import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export const AnimatedHomeTextLines = ({
  text,
  className = "",
  isReady = true,
}) => {
  const containerRef = useRef(null);
  const lineRefs = useRef([]);
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  useGSAP(
    () => {
      const validLines = lineRefs.current.filter(Boolean);
      if (!validLines.length) return;

      if (!isReady) {
        gsap.set(validLines, { y: 40, opacity: 0 });
        return;
      }

      gsap.fromTo(
        validLines,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.95,
          delay: 0.45,
          stagger: 0.15,
          ease: "power3.out",
        }
      );
    },
    { scope: containerRef, dependencies: [isReady] }
  );

  return (
    <div ref={containerRef} className={className}>
      {lines.map((line, index) => (
        <span
          key={index}
          ref={(el) => (lineRefs.current[index] = el)}
          className="block leading-relaxed tracking-wide text-pretty"
        >
          {line.trim()}
        </span>
      ))}
    </div>
  );
};
