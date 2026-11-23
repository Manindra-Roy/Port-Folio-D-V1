import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import Marquee from "../components/Marquee";
import Magnetic from "../components/Magnetic";
import { socials } from "../constants";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { playClickSound } from "../utils/sound";
import { scrollToSection } from "../utils/scroll";

gsap.registerPlugin(ScrollTrigger);

const PROJECT_TYPES = [
  "Full-Stack Web App",
  "Mobile App",
  "E-Commerce",
  "DevOps & Cloud",
  "UI/UX & 3D Web",
];

const TIMELINES = ["< 1 Month", "1–3 Months", "3+ Months / Ongoing"];
const BUDGETS = ["$1k – $3k", "$3k – $8k", "$8k+", "Flexible"];

const FOOTER_MARQUEE_ITEMS = [
  "just imagine, I code",
  "just imagine, I code",
  "just imagine, I code",
  "just imagine, I code",
  "just imagine, I code",
];

// Isolated clock component so 1s ticks never re-render the Contact form or Marquee
const LiveIndiaClock = () => {
  const [istTime, setIstTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const formatted = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(new Date());
      setIstTime(formatted);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!istTime) return null;

  return (
    <div className="contact-reveal flex items-center gap-2.5 sm:gap-3 pt-4 border-t border-white/10 text-[11px] sm:text-xs tracking-[0.14rem] sm:tracking-[0.22rem] uppercase text-white/45">
      <span className="w-2 h-2 rounded-full bg-gold animate-pulse shrink-0" />
      <span>
        Local Time (India):{" "}
        <span className="text-gold tabular-nums">{istTime} IST</span>
      </span>
    </div>
  );
};

const Contact = () => {
  const sectionRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [selectedType, setSelectedType] = useState(PROJECT_TYPES[0]);
  const [selectedTimeline, setSelectedTimeline] = useState(TIMELINES[0]);
  const [selectedBudget, setSelectedBudget] = useState(BUDGETS[3]);
  const [clientName, setClientName] = useState("");
  const [clientMessage, setClientMessage] = useState("");

  const handleCopyEmail = () => {
    playClickSound(660, 0.04);
    navigator.clipboard?.writeText("Technet0110@gmail.com");
    window.dispatchEvent(
      new CustomEvent("show-toast", { detail: "Email Copied to Clipboard" })
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleQuickSend = (channel) => {
    playClickSound();
    const subject = `Project Inquiry: ${selectedType}${
      clientName ? ` from ${clientName}` : ""
    }`;
    const body = `Hi Manindra,\n\nI'm interested in working together on a ${selectedType} project.\nTimeline: ${selectedTimeline}\nBudget: ${selectedBudget}${
      clientName ? `\nName: ${clientName}` : ""
    }${
      clientMessage ? `\nDetails: ${clientMessage}` : ""
    }\n\nLet's connect!`;

    if (channel === "whatsapp") {
      const url = `https://wa.me/918436438750?text=${encodeURIComponent(body)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = `mailto:Technet0110@gmail.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    }
  };

  const text = `Got a question or a project idea?
    I’d love to hear from you and bring it to life.`;

  useGSAP(
    () => {
      gsap.from(".contact-reveal", {
        y: 45,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact-grid",
          start: "top 86%",
          once: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative flex flex-col justify-between min-h-screen bg-obsidian rounded-t-[2.25rem] sm:rounded-t-[3rem] overflow-hidden"
    >
      {/* Subtle Ambient Gold Aura Behind Inquiry Card */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 right-0 w-[460px] h-[460px] rounded-full bg-gold/10 blur-[140px] pointer-events-none"
      />

      <div className="relative z-10">
        <AnimatedHeaderSection
          subTitle="You Dream It, I Code It"
          title="Contact"
          sectionIndex="04"
          text={text}
          textColor="text-white"
          withScrollTrigger={true}
        />

        <div className="contact-grid grid grid-cols-1 gap-12 px-6 sm:px-10 mb-16 font-light text-white lg:grid-cols-12">
          {/* Left Column: Direct Contact Info */}
          <div className="flex flex-col justify-between gap-10 lg:col-span-5">
            <div className="flex flex-col gap-9">
              <div className="contact-reveal">
                <p className="text-[11px] tracking-[0.35rem] uppercase text-gold/80 mb-2">
                  E-mail
                </p>
                <div className="w-full h-px mb-3.5 bg-white/15" />
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:Technet0110@gmail.com"
                    className="inline-block text-xl sm:text-2xl lg:text-[26px] tracking-wide text-white/95 hover:text-gold transition-colors duration-200 break-all"
                  >
                    Technet0110@gmail.com
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1 text-[11px] tracking-[0.2rem] uppercase transition-all border rounded-full cursor-pointer ${
                      copied
                        ? "bg-gold text-obsidian border-gold"
                        : "border-gold/50 text-gold hover:bg-gold hover:text-obsidian"
                    }`}
                  >
                    <Icon
                      icon={copied ? "lucide:check" : "lucide:copy"}
                      className="size-3.5"
                    />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="contact-reveal">
                <p className="text-[11px] tracking-[0.35rem] uppercase text-gold/80 mb-2">
                  Phone &amp; WhatsApp
                </p>
                <div className="w-full h-px mb-3.5 bg-white/15" />
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="tel:+918436438750"
                    className="inline-block text-xl sm:text-2xl lg:text-[26px] tracking-wide text-white/95 hover:text-gold transition-colors duration-200"
                  >
                    +91 84364 38750
                  </a>
                  <a
                    href="https://wa.me/918436438750"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3.5 py-1 text-[11px] tracking-[0.2rem] uppercase transition-colors border rounded-full border-gold/50 text-gold hover:bg-gold hover:text-obsidian"
                  >
                    WhatsApp ↗
                  </a>
                </div>
              </div>

              <div className="contact-reveal">
                <p className="text-[11px] tracking-[0.35rem] uppercase text-gold/80 mb-2">
                  Social Channels
                </p>
                <div className="w-full h-px mb-3.5 bg-white/15" />
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm tracking-[0.2rem] uppercase text-white/75 hover:text-gold transition-colors duration-200"
                    >
                      {"{ "}
                      {social.name}
                      {" }"}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <LiveIndiaClock />
          </div>

          {/* Right Column: Boutique Studio Project Inquiry Card */}
          <div className="contact-reveal flex flex-col justify-between p-5 sm:p-8 lg:p-9 border rounded-3xl border-white/15 bg-gradient-to-b from-white/[0.05] to-white/[0.015] backdrop-blur-sm shadow-[0_20px_70px_rgba(0,0,0,0.5)] lg:col-span-7">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-normal tracking-wider uppercase text-white">
                  Start a Project
                </h2>
                <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.25rem] uppercase text-gold/85">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  Avg. reply &lt; 24h
                </span>
              </div>

              {/* 1. Service */}
              <div>
                <p className="mb-2 text-[11px] tracking-[0.28rem] uppercase text-white/45">
                  01. Select Service
                </p>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setSelectedType(type);
                      }}
                      className={`px-3.5 py-1.5 text-xs tracking-wider uppercase rounded-full border cursor-pointer transition-all duration-200 ${
                        selectedType === type
                          ? "bg-gold text-obsidian border-gold font-normal"
                          : "border-white/15 text-white/70 hover:border-gold/50 hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Timeline & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-[11px] tracking-[0.28rem] uppercase text-white/45">
                    02. Timeline
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TIMELINES.map((tl) => (
                      <button
                        key={tl}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setSelectedTimeline(tl);
                        }}
                        className={`px-3 py-1 text-[11px] tracking-wider uppercase rounded-full border cursor-pointer transition-all duration-200 ${
                          selectedTimeline === tl
                            ? "bg-white text-obsidian border-white font-normal"
                            : "border-white/15 text-white/65 hover:border-white/40 hover:text-white"
                        }`}
                      >
                        {tl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[11px] tracking-[0.28rem] uppercase text-white/45">
                    03. Budget Range
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setSelectedBudget(b);
                        }}
                        className={`px-3 py-1 text-[11px] tracking-wider uppercase rounded-full border cursor-pointer transition-all duration-200 ${
                          selectedBudget === b
                            ? "bg-white text-obsidian border-white font-normal"
                            : "border-white/15 text-white/65 hover:border-white/40 hover:text-white"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Name & Brief */}
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="client-name"
                    className="block mb-1.5 text-[11px] tracking-[0.28rem] uppercase text-white/45"
                  >
                    04. Your Name
                  </label>
                  <input
                    id="client-name"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-3 text-sm text-white bg-obsidian/70 border rounded-xl border-white/15 focus:border-gold focus:ring-1 focus:ring-gold/40 focus:outline-none transition-all placeholder:text-white/25"
                  />
                </div>
                <div>
                  <label
                    htmlFor="client-message"
                    className="block mb-1.5 text-[11px] tracking-[0.28rem] uppercase text-white/45"
                  >
                    05. Project Brief
                  </label>
                  <textarea
                    id="client-message"
                    rows={3}
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    placeholder="Tell me about your goals, key features, or ideal launch window..."
                    className="w-full px-4 py-3 text-sm text-white bg-obsidian/70 border rounded-xl border-white/15 focus:border-gold focus:ring-1 focus:ring-gold/40 focus:outline-none transition-all resize-none placeholder:text-white/25"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-6 mt-6 border-t border-white/12">
              <Magnetic strength={0.2} className="w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleQuickSend("email")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-normal tracking-[0.2rem] sm:tracking-[0.22rem] text-obsidian uppercase transition-all rounded-full cursor-pointer bg-gold hover:bg-gold-light active:scale-95"
                >
                  Send via Email
                  <Icon icon="lucide:arrow-up-right" className="size-4" />
                </button>
              </Magnetic>
              <Magnetic strength={0.2} className="w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleQuickSend("whatsapp")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs tracking-[0.2rem] sm:tracking-[0.22rem] text-gold uppercase transition-all border rounded-full cursor-pointer border-gold/50 hover:bg-gold hover:text-obsidian active:scale-95"
                >
                  Send on WhatsApp
                  <Icon icon="lucide:message-circle" className="size-4" />
                </button>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>

      <Marquee
        items={FOOTER_MARQUEE_ITEMS}
        className="text-white/85 bg-transparent border-t border-white/10"
        iconClassName="text-gold"
      />

      {/* Statement Editorial Footer */}
      <footer className="relative z-10 px-6 sm:px-10 pt-10 pb-8 border-t border-white/12 overflow-hidden">
        <div
          aria-hidden="true"
          className="text-center font-normal uppercase tracking-tighter text-white/[0.04] select-none leading-none mb-8 whitespace-nowrap"
          style={{ fontSize: "clamp(2.4rem, 11vw, 10.5rem)" }}
        >
          Manindra Roy
        </div>

        <div className="flex flex-col items-center justify-between gap-4 text-[10px] sm:text-[11px] font-light tracking-[0.16rem] sm:tracking-[0.25rem] uppercase text-white/45 text-center md:text-left md:flex-row">
          <p>© {new Date().getFullYear()} Manindra Roy. All Rights Reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {["home", "services", "about", "work"].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  playClickSound();
                  scrollToSection(sec);
                }}
                className="hover:text-gold transition-colors cursor-pointer uppercase"
              >
                {sec}
              </button>
            ))}
          </div>

          <p className="text-white/35">
            Designed &amp; Engineered in West Bengal, IN
          </p>
        </div>
      </footer>
    </section>
  );
};

export default Contact;
