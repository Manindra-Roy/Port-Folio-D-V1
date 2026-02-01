import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Maa_saraswati_001 } from "../components/Maa_saraswati_001";
import { CodeM } from "../components/CodeM";
import { MathClock } from "../components/MathClock";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import AnimatedHomeSection from "../components/AnimatedHomeSection";

const Hero = () => {
  const isMobileXs = useMediaQuery({ maxWidth: 360 });
  const isMobileSm = useMediaQuery({ minWidth: 361, maxWidth: 640 });
  const isMobileMd = useMediaQuery({ minWidth: 641, maxWidth: 768 });
  const isDeviceLg = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDeviceXl = useMediaQuery({ minWidth: 1025, maxWidth: 1280 });
  const isMobile = useMediaQuery({ maxWidth: 853 });

  // 1. VISIBILITY LOGIC: Track if Hero is in view
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state based on visibility
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 } // Trigger as soon as 1 pixel is out/in
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const text = `${
    isMobileXs || isMobileSm
      ? `I help growing brands and 
startups gain an unfair 
advantage through 
premium results 
driven webs`
      : `I help growing brands and startups gain an
unfair advantage through premium
results driven webs/apps`
  }`;

  const RenderCodeM = !isMobile ? <CodeM scale={1} /> : null;
  const RenderClock = isMobile ? (
    <MathClock scale={0.7} position={[1.875, isMobileMd ? 1.25 : 2.4, 1]} />
  ) : null;
  const RenderSaraswati = !isMobile ? <Maa_saraswati_001 scale={1} /> : null;

  return (
    <section
      ref={sectionRef}
      id="home"
      className="flex flex-col justify-end min-h-screen bg-black -z-30 relative"
      style={{height:"100svh"}}
    >
      <AnimatedHomeSection
        subTitle={"404 No Bugs Found"}
        title={"Manindra Roy"}
        text={text}
        textColor={"text-white"}
      />
      <figure
        className="absolute inset-0 -z-20"
        style={{ width: "100dvw", height: "50%",  }}
      >
        <Canvas
          // 2. PAUSE RENDERING when out of view
          frameloop={isInView ? "always" : "never"}
          shadows={!isMobile}
          dpr={[1, 2]}
          camera={{
            position: [0, 0, isMobileMd ? -17.5 : isMobile ? -27.5 : -10],
            fov: 17.5,
            near: 1,
            far: isMobile ? 50 : 20,
          }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
          <ambientLight intensity={0.5} />
          <Float
            speed={isInView ? (isMobile ? 0 : 0) : 0} // Stop calculation if hidden
            rotationIntensity={0}
            floatIntensity={isMobileMd ? 0 : isMobile ? 0 : 0}
          >
            {RenderClock}
          </Float>
          <Environment resolution={256}>
            <group rotation={[-Math.PI / 3, 4, 1]}>
              <Lightformer
                form={"circle"}
                intensity={0.5}
                position={[0, 5, -9]}
                scale={10}
              />
              <Lightformer
                form={"circle"}
                intensity={0.5}
                position={[0, 3, 1]}
                scale={10}
              />
              <Lightformer
                form={"circle"}
                intensity={0.5}
                position={[-5, -1, -1]}
                scale={10}
              />
              <Lightformer
                form={"circle"}
                intensity={0.5}
                position={[10, 1, 0]}
                scale={16}
              />
            </group>
          </Environment>
        </Canvas>
      </figure>
    </section>
  );
};

export default Hero;

