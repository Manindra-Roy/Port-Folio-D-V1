import { Icon } from "@iconify/react/dist/iconify.js";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { projects } from "../constants";
import { useRef, useState, useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";
import { playHoverTick, playClickSound } from "../utils/sound";
import { scrollToSection, startLenis, stopLenis } from "../utils/scroll";

gsap.registerPlugin(ScrollTrigger);

const PROJECT_CATEGORIES = ["All", "E-Commerce", "Web Apps", "Platforms"];

const Works = () => {
  const sectionRef = useRef(null);
  const overlayRefs = useRef([]);
  const previewRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const isPreviewOpen = useRef(false);
  const moveX = useRef(null);
  const moveY = useRef(null);
  const rotatePreview = useRef(null);
  const lastMouseX = useRef(0);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // Refresh ScrollTrigger positions below Works whenever filtering or view mode changes height
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [activeCategory, viewMode]);

  // Allow CommandPalette to open a specific project modal
  useEffect(() => {
    const handleOpenProject = (e) => {
      const found = projects.find((p) => p.id === e.detail);
      if (found) setSelectedProject(found);
    };
    window.addEventListener("open-project-modal", handleOpenProject);
    return () =>
      window.removeEventListener("open-project-modal", handleOpenProject);
  }, []);

  // Modal keyboard controls & Lenis scroll lock
  useEffect(() => {
    if (!selectedProject) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      } else if (e.key === "ArrowRight") {
        const idx = projects.findIndex((p) => p.id === selectedProject.id);
        setSelectedProject(projects[(idx + 1) % projects.length]);
      } else if (e.key === "ArrowLeft") {
        const idx = projects.findIndex((p) => p.id === selectedProject.id);
        setSelectedProject(
          projects[(idx - 1 + projects.length) % projects.length]
        );
      }
    };
    stopLenis();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      startLenis();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  const text = `Featured projects meticulously
    crafted with precision to drive
    real results and impact.`;

  useGSAP(
    () => {
      if (previewRef.current) {
        moveX.current = gsap.quickTo(previewRef.current, "x", {
          duration: 0.45,
          ease: "power3.out",
        });
        moveY.current = gsap.quickTo(previewRef.current, "y", {
          duration: 0.45,
          ease: "power3.out",
        });
        rotatePreview.current = gsap.quickTo(previewRef.current, "rotation", {
          duration: 0.5,
          ease: "power3.out",
        });
      }
    },
    { scope: sectionRef, dependencies: [] }
  );

  const computePreviewCoords = (clientX, clientY) => {
    const previewWidth = window.innerWidth < 1280 ? 380 : 460;
    const previewHeight = 295;
    const margin = 24;

    let targetX = clientX + 36;
    if (targetX + previewWidth + margin > window.innerWidth) {
      targetX = clientX - previewWidth - 36;
    }
    targetX = Math.max(margin, targetX);

    const targetY = Math.min(
      Math.max(clientY - previewHeight / 2, margin),
      window.innerHeight - previewHeight - margin
    );
    return { targetX, targetY };
  };

  const handleRowEnter = (projectId, index, e) => {
    if (window.innerWidth < 768) return;
    playHoverTick();
    setCurrentProjectId(projectId);

    const el = overlayRefs.current[index];
    if (el) {
      gsap.killTweensOf(el);
      gsap.fromTo(
        el,
        { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
        {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
          duration: 0.24,
          ease: "power2.out",
        }
      );
    }

    if (previewRef.current) {
      if (!isPreviewOpen.current) {
        const { targetX, targetY } = computePreviewCoords(e.clientX, e.clientY);
        gsap.set(previewRef.current, { x: targetX, y: targetY, rotation: 0 });
        lastMouseX.current = e.clientX;
        isPreviewOpen.current = true;
      }

      gsap.to(previewRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.28,
        ease: "power2.out",
      });
    }
  };

  const handleRowLeave = (index) => {
    if (window.innerWidth < 768) return;
    const el = overlayRefs.current[index];
    if (el) {
      gsap.killTweensOf(el);
      gsap.to(el, {
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        duration: 0.2,
        ease: "power2.in",
      });
    }
  };

  const handleListLeave = () => {
    if (window.innerWidth < 768) return;
    isPreviewOpen.current = false;
    setCurrentProjectId(null);

    if (previewRef.current) {
      gsap.to(previewRef.current, {
        opacity: 0,
        scale: 0.94,
        rotation: 0,
        duration: 0.25,
        ease: "power2.out",
      });
    }
  };

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768 || !moveX.current || !moveY.current) return;

    const { targetX, targetY } = computePreviewCoords(e.clientX, e.clientY);
    const deltaX = e.clientX - lastMouseX.current;
    lastMouseX.current = e.clientX;
    const clampedTilt = Math.max(-5, Math.min(5, deltaX * 0.14));

    moveX.current(targetX);
    moveY.current(targetY);
    rotatePreview.current?.(clampedTilt);
  };

  const navigateModal = (direction) => {
    if (!selectedProject) return;
    playClickSound();
    const idx = projects.findIndex((p) => p.id === selectedProject.id);
    const nextIdx = (idx + direction + projects.length) % projects.length;
    setSelectedProject(projects[nextIdx]);
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      className="flex flex-col min-h-screen bg-primary text-obsidian pb-16"
    >
      <AnimatedHeaderSection
        subTitle="Logic meets Aesthetics, Seamlessly"
        title="Works"
        sectionIndex="03"
        text={text}
        textColor="text-black"
        withScrollTrigger={true}
      />

      {/* Interactive Filter & View Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 sm:px-10 pb-5 sm:pb-6">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {PROJECT_CATEGORIES.map((cat) => {
            const count =
              cat === "All"
                ? projects.length
                : projects.filter((p) => p.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  playClickSound();
                  handleListLeave();
                  setActiveCategory(cat);
                }}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] tracking-[0.14rem] sm:tracking-[0.2rem] uppercase rounded-full border cursor-pointer transition-all duration-250 active:scale-95 ${
                  isActive
                    ? "bg-obsidian text-white border-obsidian"
                    : "border-obsidian/20 text-DarkLava hover:border-obsidian hover:text-obsidian"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] ${
                    isActive ? "text-gold" : "text-DarkLava/50"
                  }`}
                >
                  0{count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop List / Gallery Grid Switcher */}
        <div className="hidden md:inline-flex items-center p-1 rounded-full border border-obsidian/20 bg-obsidian/[0.04]">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setViewMode("list");
            }}
            aria-label="List view"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] tracking-[0.2rem] uppercase rounded-full cursor-pointer transition-all ${
              viewMode === "list"
                ? "bg-obsidian text-gold shadow-sm"
                : "text-DarkLava/75 hover:text-obsidian"
            }`}
          >
            <Icon icon="lucide:list" className="size-3.5" />
            List
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              handleListLeave();
              setViewMode("grid");
            }}
            aria-label="Gallery grid view"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] tracking-[0.2rem] uppercase rounded-full cursor-pointer transition-all ${
              viewMode === "grid"
                ? "bg-obsidian text-gold shadow-sm"
                : "text-DarkLava/75 hover:text-obsidian"
            }`}
          >
            <Icon icon="lucide:layout-grid" className="size-3.5" />
            Gallery
          </button>
        </div>
      </div>

      {/* VIEW 1: Iconic Editorial List */}
      {viewMode === "list" ? (
        <div
          className="projects-list relative flex flex-col font-light border-t border-obsidian/20"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleListLeave}
        >
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                playClickSound();
                setSelectedProject(project);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  playClickSound();
                  setSelectedProject(project);
                }
              }}
              className="project-item relative z-0 flex flex-col gap-3 py-6 sm:py-7 border-b border-obsidian/20 cursor-pointer group"
              onMouseEnter={(e) => handleRowEnter(project.id, index, e)}
              onMouseLeave={() => handleRowLeave(index)}
            >
              {/* Desktop Dark Sweep Overlay */}
              <div
                ref={(el) => {
                  overlayRefs.current[index] = el;
                }}
                className="absolute inset-0 hidden md:block bg-obsidian -z-10 clip-path"
              />

              {/* Top Row: Index, Title, Category/Year & Arrow */}
              <div className="flex items-center justify-between gap-4 px-6 sm:px-10 text-obsidian transition-all duration-500 md:group-hover:px-14 md:group-hover:text-white">
                <div className="flex items-baseline gap-3.5 sm:gap-6 min-w-0">
                  <span className="text-xs sm:text-sm font-light tracking-widest text-DarkLava/60 transition-colors duration-300 md:group-hover:text-gold shrink-0">
                    0{index + 1}
                  </span>
                  <h2 className="text-xl sm:text-2xl lg:text-[34px] font-normal leading-snug tracking-tight">
                    {project.name}
                  </h2>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="hidden lg:flex items-center gap-3 text-xs tracking-[0.22rem] uppercase text-DarkLava/70 md:group-hover:text-white/60 transition-colors">
                    <span>{project.category}</span>
                    <span className="text-gold">•</span>
                    <span>{project.year}</span>
                  </div>
                  <Icon
                    icon="lucide:arrow-up-right"
                    className="size-5 md:size-6 shrink-0 transition-all duration-300 md:group-hover:text-gold md:group-hover:translate-x-1 md:group-hover:-translate-y-1"
                  />
                </div>
              </div>

              {/* Tech Stack Strip */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 sm:px-10 md:pl-20 text-[11px] sm:text-xs tracking-[0.18rem] uppercase transition-all duration-500 md:group-hover:pl-24">
                {project.frameworks.map((framework, fwIdx) => (
                  <span
                    key={framework.id}
                    className="inline-flex items-center gap-4 text-DarkLava/80 transition-colors duration-300 md:group-hover:text-white/75"
                  >
                    {framework.name}
                    {fwIdx < project.frameworks.length - 1 && (
                      <span className="w-1 h-1 rounded-full bg-gold/70" />
                    )}
                  </span>
                ))}
              </div>

              {/* Mobile Editorial Card Preview */}
              <div className="px-5 sm:px-10 pt-2 md:hidden">
                <div className="relative overflow-hidden rounded-2xl aspect-[16/10] border border-obsidian/15 bg-obsidian shadow-md">
                  <img
                    src={project.bgImage}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 object-cover w-full h-full brightness-45 scale-105"
                  />
                  <div className="relative z-10 flex items-center justify-center w-full h-full p-4 sm:p-8">
                    <img
                      src={project.image}
                      alt={project.name}
                      loading="lazy"
                      className="object-cover w-full h-full rounded-xl shadow-2xl border border-white/15"
                    />
                  </div>
                  <span className="absolute top-3 left-3 z-20 px-2.5 py-1 text-[9px] tracking-[0.16rem] uppercase rounded-full bg-obsidian/80 text-white/85 border border-white/15 backdrop-blur-sm">
                    {project.category} • {project.year}
                  </span>
                  <span className="absolute bottom-3 right-3 z-20 px-3 py-1 text-[10px] tracking-[0.18rem] uppercase rounded-full bg-obsidian/85 text-gold border border-gold/40 backdrop-blur-sm">
                    Case Study ↗
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VIEW 2: Visual Gallery Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 sm:px-10 pt-2">
          {filteredProjects.map((project, index) => (
            <article
              key={project.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                playClickSound();
                setSelectedProject(project);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  playClickSound();
                  setSelectedProject(project);
                }
              }}
              className="project-item group flex flex-col overflow-hidden rounded-3xl border border-obsidian/15 bg-obsidian text-white cursor-pointer shadow-lg hover:border-gold/60 transition-all duration-400 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.name}
                  loading="lazy"
                  className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10px] font-light tracking-[0.25rem] uppercase">
                  <span className="px-3 py-1 rounded-full bg-obsidian/80 border border-white/15 text-gold backdrop-blur-md">
                    0{index + 1} / {project.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-obsidian/80 border border-white/15 text-white/80 backdrop-blur-md">
                    {project.year}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-3 flex-1 justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-2xl font-normal tracking-tight text-white group-hover:text-gold-light transition-colors">
                      {project.name}
                    </h2>
                    <Icon
                      icon="lucide:arrow-up-right"
                      className="size-5 text-gold shrink-0 mt-1 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                  <p className="mt-2 text-sm font-light leading-relaxed text-white/60 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                  {project.frameworks.map((fw) => (
                    <span
                      key={fw.id}
                      className="px-2.5 py-0.5 text-[10px] tracking-[0.16rem] uppercase rounded-full border border-white/15 text-white/70"
                    >
                      {fw.name}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Desktop Floating Hover Preview Card (List Mode) */}
      <div
        ref={previewRef}
        className="fixed top-0 left-0 z-40 hidden md:block pointer-events-none opacity-0 scale-95 w-[380px] xl:w-[460px] h-[295px] rounded-2xl overflow-hidden border border-gold/50 bg-obsidian shadow-[0_30px_80px_rgba(0,0,0,0.6)] will-change-transform"
      >
        {projects.map((project, index) => {
          const isCurrent = currentProjectId === project.id;
          return (
            <div
              key={project.id}
              className={`absolute inset-0 transition-opacity duration-250 ease-out ${
                isCurrent ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={project.image}
                alt={project.name}
                className={`object-cover w-full h-full transition-transform duration-500 ${
                  isCurrent ? "scale-100" : "scale-105"
                }`}
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-obsidian/80 border border-gold/40 text-[10px] tracking-[0.2rem] text-gold backdrop-blur-md">
                0{index + 1} / 0{projects.length}
              </div>
              <div className="absolute inset-x-0 bottom-0 px-5 py-3.5 bg-gradient-to-t from-obsidian via-obsidian/85 to-transparent flex items-center justify-between text-[11px] tracking-[0.22rem] uppercase text-white/90">
                <span>{project.category}</span>
                <span className="text-gold">{project.performance} LH</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Animated Case Study Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-backdrop-in"
          onClick={() => setSelectedProject(null)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white bg-obsidian border rounded-3xl border-white/15 shadow-[0_30px_100px_rgba(0,0,0,0.9)] animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero Image */}
            <div className="relative h-56 sm:h-72 overflow-hidden">
              <img
                src={selectedProject.image}
                alt={selectedProject.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-black/35" />

              <div className="absolute top-4 left-5 flex items-center gap-2 text-[10px] font-light tracking-[0.25rem] uppercase px-3 py-1 rounded-full bg-obsidian/75 border border-white/15 text-gold backdrop-blur-md">
                <span>{selectedProject.category}</span>
                <span>•</span>
                <span>{selectedProject.year}</span>
              </div>

              <button
                type="button"
                aria-label="Close project details"
                onClick={() => {
                  playClickSound();
                  setSelectedProject(null);
                }}
                className="absolute flex items-center justify-center w-10 h-10 text-white transition-all bg-obsidian/80 border border-white/20 rounded-full cursor-pointer top-4 right-4 hover:bg-gold hover:text-obsidian hover:border-gold backdrop-blur-md"
              >
                <Icon icon="lucide:x" className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 flex flex-col gap-5 font-light">
              <h3 className="text-2xl sm:text-3xl font-normal uppercase tracking-tight">
                {selectedProject.name}
              </h3>

              {/* Case Study Metrics Strip */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-white/[0.025]">
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] tracking-[0.12rem] sm:tracking-[0.2rem] uppercase text-white/40 truncate">
                    Role
                  </p>
                  <p className="text-xs sm:text-sm text-white/90 mt-0.5 truncate">
                    {selectedProject.role}
                  </p>
                </div>
                <div className="border-l border-white/10 pl-2 sm:pl-3 min-w-0">
                  <p className="text-[9px] sm:text-[10px] tracking-[0.12rem] sm:tracking-[0.2rem] uppercase text-white/40 truncate">
                    Timeline
                  </p>
                  <p className="text-xs sm:text-sm text-white/90 mt-0.5 truncate">
                    {selectedProject.timeline}
                  </p>
                </div>
                <div className="border-l border-white/10 pl-2 sm:pl-3 min-w-0">
                  <p className="text-[9px] sm:text-[10px] tracking-[0.12rem] sm:tracking-[0.2rem] uppercase text-white/40 truncate">
                    Lighthouse
                  </p>
                  <p className="text-xs sm:text-sm text-gold mt-0.5 truncate">
                    {selectedProject.performance}
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-white/70">
                {selectedProject.description}
              </p>

              {/* Key Highlights */}
              {selectedProject.highlights?.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-[10px] tracking-[0.35rem] uppercase text-gold/85">
                    Key Highlights
                  </p>
                  <ul className="space-y-2">
                    {selectedProject.highlights.map((pt) => (
                      <li
                        key={pt}
                        className="flex items-start gap-2.5 text-sm text-white/75"
                      >
                        <Icon
                          icon="lucide:check"
                          className="size-4 text-gold shrink-0 mt-0.5"
                        />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedProject.frameworks.map((fw) => (
                  <span
                    key={fw.id}
                    className="px-3 py-1 text-[11px] tracking-[0.18rem] uppercase border rounded-full border-gold/40 bg-gold/5 text-gold"
                  >
                    {fw.name}
                  </span>
                ))}
              </div>

              {/* Actions & Prev/Next Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 mt-1 border-t border-white/12">
                <div className="flex flex-wrap items-center gap-3">
                  {selectedProject.href && (
                    <a
                      href={selectedProject.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.2rem] text-obsidian uppercase transition-colors rounded-full bg-gold hover:bg-gold-light font-normal"
                    >
                      GitHub{" "}
                      <Icon icon="lucide:arrow-up-right" className="size-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedProject(null);
                      setTimeout(() => scrollToSection("contact"), 140);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.2rem] text-white uppercase transition-colors border rounded-full cursor-pointer border-white/25 hover:border-gold hover:text-gold"
                  >
                    Build Similar →
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous project"
                    onClick={() => navigateModal(-1)}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-white/15 text-white/75 hover:border-gold hover:text-gold cursor-pointer transition-colors"
                  >
                    <Icon icon="lucide:chevron-left" className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next project"
                    onClick={() => navigateModal(1)}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-white/15 text-white/75 hover:border-gold hover:text-gold cursor-pointer transition-colors"
                  >
                    <Icon icon="lucide:chevron-right" className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Works;
