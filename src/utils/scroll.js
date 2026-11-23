// Unified smooth scrolling helper that works seamlessly with ReactLenis
let lenisInstance = null;

export const setLenisInstance = (instance) => {
  lenisInstance = instance;
};

export const stopLenis = () => {
  lenisInstance?.stop();
};

export const startLenis = () => {
  lenisInstance?.start();
};

export const scrollToSection = (sectionId, offset = 0) => {
  const el = document.getElementById(sectionId);
  if (!el) return;

  if (lenisInstance) {
    lenisInstance.start();
    lenisInstance.scrollTo(el, {
      offset,
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
