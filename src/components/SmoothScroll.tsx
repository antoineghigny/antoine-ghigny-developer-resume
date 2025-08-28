"use client";
import { useLayoutEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Respect reduced motion: fall back to native scroll
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 2), // easeOutQuad
      smoothWheel: true,
      smoothTouch: true,
      gestureOrientation: "vertical",
    });

    // Expose globally for on-demand programmatic scrolls (e.g., CTA jump)
    try { (window as any).__lenis = lenis; } catch {}

    // Track current Lenis scroll value for accurate proxy reads
    let currentScroll = 0;
    lenis.on("scroll", (e: any) => {
      currentScroll = e?.scroll ?? currentScroll;
      ScrollTrigger.update();
    });

    // Sync ScrollTrigger with Lenis
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (arguments.length && typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
          return 0;
        }
        // Return Lenis' virtual scroll value for transform-based smooth scrolling
        return currentScroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      // With Lenis smooth, the scroller is transform-based; force 'transform' to avoid Safari/body transform issues
      pinType: "transform",
    });

    // Ensure all ScrollTriggers use the same scroller as the proxy
    ScrollTrigger.defaults({ scroller: document.documentElement });

    // Connect Lenis to GSAP's RAF and ScrollTrigger updates
    let rafId = 0;
    const update = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(update);
    };

    requestAnimationFrame(update);

    // Refresh ScrollTrigger after setup and once more on next frame (after any layout-class toggles)
    ScrollTrigger.refresh();
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(rafId);
      try { if ((window as any).__lenis === lenis) (window as any).__lenis = undefined; } catch {}
      lenis.destroy();
    };
  }, []);

  return null;
}
