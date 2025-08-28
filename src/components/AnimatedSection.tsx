"use client";

import React, {useLayoutEffect, useRef} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type AnimatedSectionProps = Readonly<{
  className?: string;
  children: React.ReactNode;
  stagger?: number;
  y?: number;
  once?: boolean;
  id?: string;
  style?: React.CSSProperties;
  duration?: number;
  start?: string; // e.g., 'top 70%'
}>;

export default function AnimatedSection({
  className,
  children,
  stagger = 0.08,
  y = 24,
  once = true,
  id,
  style,
  duration,
  start
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const isSmall = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
      const startPos = start ?? (isSmall ? 'top 96%' : 'top 85%');
      const dur = duration ?? (isSmall ? 0.9 : 0.8);
      const yMag = isSmall ? Math.round(y * 1.5) : y;
      const staggerCap = isSmall ? 0.32 : 0.24;
      const targets = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('.anim-child'));
      const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        targets.forEach((t) => {
          gsap.set(t, { opacity: 1, x: 0, y: 0, scale: 1, clearProps: 'transform' });
        });
        return;
      }
      const initialFor = (t: HTMLElement) => {
        const dir = (t.dataset.reveal || "").toLowerCase();
        switch (dir) {
          case "left": return { opacity: 0, x: -yMag };
          case "right": return { opacity: 0, x: yMag };
          case "up": return { opacity: 0, y: yMag };
          case "down": return { opacity: 0, y: -yMag };
          case "scale": return { opacity: 0, scale: 0.95 };
          case "fade": return { opacity: 0 };
          default: return { opacity: 0, y: yMag };
        }
      };
      targets.forEach((t, i) => {
        gsap.set(t, initialFor(t));
        gsap.to(t, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: dur,
          ease: "power3.out",
          // small intra-group offset to keep a bit of rhythm when multiple items share same trigger area
          delay: i === 0 ? 0 : Math.min(i * stagger, staggerCap),
          scrollTrigger: {
            trigger: t,
            start: startPos,
            once,
            invalidateOnRefresh: true,
          }
        });
      });
    }, el);

    return () => ctx.revert();
  }, [stagger, y, once, duration, start]);

  return (
    <section ref={ref} className={className} id={id} style={style}>
      {children}
    </section>
  );
}
