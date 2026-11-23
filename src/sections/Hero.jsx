import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { MathClock } from "../components/MathClock";
import { Environment, Float, Lightformer, Sparkles } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";
import AnimatedHomeSection from "../components/AnimatedHomeSection";
import { isSoundEnabled, playClickSound, toggleSound } from "../utils/sound";
import { scrollToSection } from "../utils/scroll";

const Hero = ({ isReady = true }) => {
  const isMobileMd = useMediaQuery({ minWidth: 641, maxWidth: 853 });
  const isMobile = useMediaQuery({ maxWidth: 853 });

  const sectionRef = useRef(null);
  const spotlightRef = useRef(null);
  const spotlightPosRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    active: false,
  });
  const [isInView, setIsInView] = useState(true);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    const handleSoundEvent = (e) => setSoundOn(e.detail);
    window.addEventListener("sound-toggle", handleSoundEvent);
    return () => window.removeEventListener("sound-toggle", handleSoundEvent);
  }, []);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0 }
    );
    if (sectionEl) observer.observe(sectionEl);
    return () => {
      if (sectionEl) observer.unobserve(sectionEl);
    };
  }, []);

  // Silky RAF-damped atmospheric cursor lamp across the Hero canvas
  useEffect(() => {
    if (isMobile) return;
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const s = spotlightPosRef.current;

      if (s.active && spotlightRef.current) {
        const ease = 1 - Math.exp(-7.5 * dt);
        s.currentX += (s.targetX - s.currentX) * ease;
        s.currentY += (s.targetY - s.currentY) * ease;
        spotlightRef.current.style.background = `radial-gradient(560px circle at ${s.currentX.toFixed(
          1
        )}px ${s.currentY.toFixed(
          1
        )}px, rgba(207, 163, 85, 0.14), rgba(207, 163, 85, 0.04) 36%, transparent 68%)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isMobile]);

  const handleHeroMouseMove = (e) => {
    if (isMobile || !sectionRef.current || !spotlightRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const s = spotlightPosRef.current;
    if (!s.active) {
      s.currentX = x;
      s.currentY = y;
      s.active = true;
      spotlightRef.current.style.opacity = "1";
    }
    s.targetX = x;
    s.targetY = y;
  };

  const handleHeroMouseLeave = () => {
    if (!spotlightRef.current) return;
    spotlightPosRef.current.active = false;
    spotlightRef.current.style.opacity = "0";
  };

  const heroCopy = `I help growing brands and startups gain an
unfair advantage through premium,
results-driven web & mobile apps.`;

  return (
    <section
      ref={sectionRef}
      id="home"
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
      className="flex flex-col justify-between min-h-[100svh] bg-obsidian relative overflow-hidden"
    >
      {/* Subtle Architectural Swiss Grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "76px 76px",
        }}
      />

      {/* Ambient Champagne-Gold Atmospheric Glow Behind Clock (Desktop) */}
      {!isMobile && (
        <div
          aria-hidden="true"
          className="absolute z-0 pointer-events-none top-[22%] right-[8%] w-[480px] h-[480px] rounded-full blur-[135px] opacity-22 bg-gold"
        />
      )}

      {/* Interactive Cursor Spotlight (Desktop) */}
      {!isMobile && (
        <div
          ref={spotlightRef}
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none opacity-0 transition-opacity duration-500 ease-out"
        />
      )}

      {/* Top Editorial Swiss Grid Header */}
      {!isMobile ? (
        <header className="relative z-10 w-full pt-6 px-8 lg:px-10 pr-28 lg:pr-32">
          <div className="grid grid-cols-3 gap-6 lg:gap-8 pb-5 border-b border-white/12 text-[11px] lg:text-xs font-light tracking-[0.2rem] uppercase text-white/70">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-white/35">01 / Location</span>
              <span className="text-white/90">
                West Bengal, IN — 22.57° N, 88.36° E
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-white/35">
                02 / Specialization
              </span>
              <span className="text-white/90">
                Full-Stack • Cloud • Mobile Apps
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-white/35">
                03 / Status &amp; Tools
              </span>
              <div className="flex flex-wrap items-center gap-3.5">
                <span className="inline-flex items-center gap-2 text-gold">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  Available
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    scrollToSection("contact");
                  }}
                  className="text-white underline underline-offset-4 decoration-gold/60 hover:text-gold cursor-pointer transition-colors uppercase"
                >
                  Let’s Talk ↗
                </button>
                <button
                  type="button"
                  onClick={() => toggleSound()}
                  className="text-white/55 hover:text-gold cursor-pointer transition-colors uppercase"
                >
                  [ Sound: {soundOn ? "ON" : "OFF"} ]
                </button>
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("open-command-palette"))
                  }
                  className="text-white/50 hover:text-gold cursor-pointer transition-colors uppercase"
                >
                  [ ⌘K ]
                </button>
              </div>
            </div>
          </div>
        </header>
      ) : (
        <header className="relative z-10 w-full pt-4 px-5 sm:px-6 pr-20">
          <div className="h-12 flex items-center gap-2.5 sm:gap-3 border-b border-white/12 text-[10px] font-light tracking-[0.18rem] sm:tracking-[0.22rem] uppercase whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 text-gold">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shrink-0" />
              Available
            </span>
            <span className="text-white/25">•</span>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                scrollToSection("contact");
              }}
              className="text-white/85 underline underline-offset-4 decoration-gold/60 active:text-gold cursor-pointer uppercase"
            >
              Let’s Talk ↗
            </button>
          </div>
        </header>
      )}

      {/* Interactive 3D Centerpiece Canvas (Flex-Centered Stage on Mobile, Full-Bleed Upper-Right on Desktop) */}
      <figure
        className={`pointer-events-none z-[1] ${
          isMobile
            ? "relative flex-1 w-full min-h-[220px] sm:min-h-[290px]"
            : "absolute inset-0 h-full"
        }`}
      >
        {/* Mobile Ambient Gold Glow — mathematically locked dead-center behind the mobile clock */}
        {isMobile && (
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] rounded-full blur-[110px] opacity-24 bg-gold pointer-events-none"
          />
        )}
        <div className="absolute inset-0 w-full h-full">
          <Canvas
            frameloop={isInView ? "always" : "never"}
            shadows={!isMobile}
            dpr={[1, 2]}
            camera={{
              position: [0, 0, isMobileMd ? -18 : isMobile ? -20 : -16.5],
              fov: 18,
              near: 1,
              far: 60,
            }}
            gl={{ preserveDrawingBuffer: false, antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.45} />
            <spotLight
              position={[6, 8, -10]}
              intensity={2.2}
              color="#f5dfb3"
              angle={0.45}
              penumbra={0.8}
            />
            <pointLight position={[-6, -4, -6]} intensity={0.85} color="#cfa355" />

            <Suspense fallback={null}>
              <Sparkles
                count={isMobile ? 20 : 34}
                scale={isMobile ? [5.2, 4.2, 3] : [7.5, 4.2, 3.5]}
                size={isMobile ? 1.9 : 2.2}
                speed={0.35}
                opacity={0.45}
                color="#e7c582"
                position={isMobile ? [0, 0, -0.5] : [-2.2, 0.38, -0.5]}
              />
              <Float
                speed={isMobile ? 1.0 : 1.3}
                rotationIntensity={isMobile ? 0.08 : 0.14}
                floatIntensity={isMobile ? 0.14 : 0.18}
              >
                <MathClock />
              </Float>
            </Suspense>

            <Environment resolution={256}>
              <group rotation={[-Math.PI / 3, 4, 1]}>
                <Lightformer
                  form="circle"
                  intensity={1.1}
                  color="#fff6e3"
                  position={[0, 5, -9]}
                  scale={10}
                />
                <Lightformer
                  form="circle"
                  intensity={0.7}
                  color="#cfa355"
                  position={[0, 3, 1]}
                  scale={10}
                />
                <Lightformer
                  form="circle"
                  intensity={0.5}
                  position={[-5, -1, -1]}
                  scale={10}
                />
                <Lightformer
                  form="circle"
                  intensity={0.8}
                  color="#e5e5e0"
                  position={[10, 1, 0]}
                  scale={16}
                />
              </group>
            </Environment>
          </Canvas>
        </div>
      </figure>

      {/* Bottom Hero Typography & CTA */}
      <AnimatedHomeSection
        subTitle="Full-Stack Architect • Crafted for Scale"
        title="Manindra Roy"
        text={heroCopy}
        textColor="text-white"
        isReady={isReady}
      />
    </section>
  );
};

export default Hero;
