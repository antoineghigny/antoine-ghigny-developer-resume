"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "./BackToTop.module.css";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setVisible(y > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onClick = useCallback(() => {
    const lenis: any = (window as any).__lenis;
    const target = 0;
    if (lenis && typeof lenis.scrollTo === "function") {
      try { lenis.scrollTo(target, { duration: 0.8 }); return; } catch {}
    }
    window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      className={`${styles.backToTop} ${visible ? styles.show : ""}`}
      onClick={onClick}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 4l-7 7h4v9h6v-9h4l-7-7z" fill="currentColor"/>
      </svg>
    </button>
  );
}
