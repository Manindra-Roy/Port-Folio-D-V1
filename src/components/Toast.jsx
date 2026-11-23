import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const Toast = () => {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    const handleToast = (e) => {
      setMessage(e.detail);
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 2400);
    };

    window.addEventListener("show-toast", handleToast);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("show-toast", handleToast);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[250] pointer-events-none transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
    >
      <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-obsidian/95 border border-gold/50 text-white shadow-[0_14px_40px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <Icon icon="lucide:sparkles" className="size-3.5 text-gold shrink-0" />
        <span className="text-xs font-light tracking-[0.2rem] uppercase whitespace-nowrap">
          {message}
        </span>
      </div>
    </div>
  );
};

export default Toast;
