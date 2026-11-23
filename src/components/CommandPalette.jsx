import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { socials, projects } from "../constants";
import { isSoundEnabled, toggleSound, playClickSound } from "../utils/sound";
import { scrollToSection, startLenis, stopLenis } from "../utils/scroll";

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        playClickSound();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) {
            setQuery("");
            setActiveIndex(0);
          }
          return next;
        });
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOpenPalette = () => {
      playClickSound();
      setQuery("");
      setActiveIndex(0);
      setIsOpen(true);
    };

    const handleSoundChange = (e) => {
      setSoundOn(e.detail);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenPalette);
    window.addEventListener("sound-toggle", handleSoundChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenPalette);
      window.removeEventListener("sound-toggle", handleSoundChange);
    };
  }, []);

  const jumpTo = (section) => {
    playClickSound();
    setIsOpen(false);
    scrollToSection(section);
  };

  const actions = useMemo(
    () => [
      {
        id: "copy-email",
        label: copied
          ? "Email Copied to Clipboard ✓"
          : "Copy Email (Technet0110@gmail.com)",
        category: "Quick Actions",
        icon: copied ? "lucide:check" : "lucide:copy",
        run: () => {
          navigator.clipboard?.writeText("Technet0110@gmail.com");
          playClickSound(660, 0.04);
          window.dispatchEvent(
            new CustomEvent("show-toast", { detail: "Email Copied to Clipboard" })
          );
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
      },
      {
        id: "whatsapp",
        label: "Chat on WhatsApp (+91 8436438750)",
        category: "Quick Actions",
        icon: "lucide:message-circle",
        run: () => {
          playClickSound();
          window.open(
            "https://wa.me/918436438750",
            "_blank",
            "noopener,noreferrer"
          );
          setIsOpen(false);
        },
      },
      {
        id: "sound",
        label: `UI Sound Effects: ${soundOn ? "ON" : "OFF"}`,
        category: "Quick Actions",
        icon: soundOn ? "lucide:volume-2" : "lucide:volume-x",
        run: () => {
          toggleSound();
        },
      },
      {
        id: "nav-home",
        label: "Go to Home",
        category: "Navigation",
        icon: "lucide:home",
        run: () => jumpTo("home"),
      },
      {
        id: "nav-services",
        label: "Go to Services",
        category: "Navigation",
        icon: "lucide:layers",
        run: () => jumpTo("services"),
      },
      {
        id: "nav-about",
        label: "Go to About & Tech Stack",
        category: "Navigation",
        icon: "lucide:user",
        run: () => jumpTo("about"),
      },
      {
        id: "nav-work",
        label: "Go to Selected Works",
        category: "Navigation",
        icon: "lucide:briefcase",
        run: () => jumpTo("work"),
      },
      {
        id: "nav-contact",
        label: "Go to Contact",
        category: "Navigation",
        icon: "lucide:mail",
        run: () => jumpTo("contact"),
      },
      ...projects.map((p) => ({
        id: `project-${p.id}`,
        label: `Inspect Project: ${p.name}`,
        category: "Selected Works",
        icon: "lucide:sparkles",
        run: () => {
          playClickSound();
          setIsOpen(false);
          scrollToSection("work");
          window.dispatchEvent(
            new CustomEvent("open-project-modal", { detail: p.id })
          );
        },
      })),
      ...socials.map((s) => ({
        id: `social-${s.name}`,
        label: `Open ${s.name}`,
        category: "Socials",
        icon: "lucide:external-link",
        run: () => {
          playClickSound();
          window.open(s.href, "_blank", "noopener,noreferrer");
          setIsOpen(false);
        },
      })),
    ],
    [copied, soundOn]
  );

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [actions, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

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

  // Keyboard ↑ / ↓ / Enter navigation inside palette
  useEffect(() => {
    if (!isOpen) return;
    const handleNav = (e) => {
      if (filteredActions.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredActions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(
          (prev) => (prev - 1 + filteredActions.length) % filteredActions.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        filteredActions[activeIndex]?.run();
      }
    };
    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [isOpen, filteredActions, activeIndex]);

  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(
      `[data-index="${activeIndex}"]`
    );
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-backdrop-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden text-white bg-obsidian border rounded-2xl border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.85)] font-light animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <Icon icon="lucide:search" className="size-4 text-gold shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections, projects, or actions..."
            className="w-full text-sm text-white bg-transparent focus:outline-none placeholder:text-white/35"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-2 py-0.5 text-[10px] tracking-widest uppercase border rounded border-white/15 text-white/50 hover:text-white hover:border-white/40 cursor-pointer transition-colors"
          >
            ESC
          </button>
        </div>

        <div
          ref={listRef}
          data-lenis-prevent
          className="max-h-80 overflow-y-auto p-2 space-y-1"
        >
          {filteredActions.length === 0 ? (
            <p className="py-10 text-xs tracking-widest text-center uppercase text-white/40">
              No matching commands
            </p>
          ) : (
            filteredActions.map((action, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={action.id}
                  data-index={index}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={action.run}
                  className={`flex items-center justify-between w-full px-3.5 py-2.5 text-left transition-all duration-150 rounded-xl cursor-pointer ${
                    isActive
                      ? "bg-gold/15 border border-gold/40 text-white"
                      : "border border-transparent text-white/75 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      icon={action.icon}
                      className={`size-4 shrink-0 ${
                        isActive ? "text-gold" : "text-white/45"
                      }`}
                    />
                    <span className="text-sm tracking-wide truncate">
                      {action.label}
                    </span>
                  </div>
                  <span
                    className={`ml-3 shrink-0 text-[10px] tracking-widest uppercase ${
                      isActive ? "text-gold" : "text-white/30"
                    }`}
                  >
                    {action.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-2.5 text-[10px] tracking-widest uppercase border-t border-white/10 bg-white/[0.02] text-white/35">
          <span>↑↓ Navigate • ↵ Select</span>
          <span className="text-gold/70">⌘K Quick Menu</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
