"use client";

import { useTranslations } from "next-intl";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { profile } from "@/data/profile";
import styles from "./Experience.module.css";
import AnimatedSection from "./AnimatedSection";
import useHorizontalPinning from "@/hooks/useHorizontalPinning";
import ExperienceCard from "./ExperienceCard";

export default function Experience() {
  const t = useTranslations('Experience');
  const sectionRef = useRef<HTMLElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const items = useMemo(() => profile.experience, []);

  useLayoutEffect(() => {
    // Respect reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  useLayoutEffect(() => {
    // Track viewport breakpoint to keep exactly 3 cards visible on desktop
    const mq = window.matchMedia('(min-width: 1024px)');
    const set = () => setIsDesktop(mq.matches);
    set();
    mq.addEventListener?.('change', set);
    return () => mq.removeEventListener?.('change', set);
  }, [items.length]);

  // Install horizontal pinning using reusable hook
  const pinTriggerRef = useHorizontalPinning({
    stageRef,
    viewportRef,
    trackRef,
    reduceMotion,
    itemsLength: items.length,
    dwell: 1.2,
    scrub: 0.35,
  });

  // Helper to scroll the pinned section to align a given card to the left edge on desktop
  const scrollToCard = (cardEl: HTMLElement) => {
    const track = trackRef.current;
    const st = pinTriggerRef.current;
    const v = viewportRef.current;
    if (!track || !st || !v) return;
    // Compute endX in the same way as the pin tween: align last card's right edge with viewport right
    const cards = Array.from(track.querySelectorAll<HTMLElement>(`[data-xp-card]`));
    const last = cards[cards.length - 1];
    const lastRight = last ? last.offsetLeft + last.offsetWidth : v.clientWidth;
    const rawEndX = -(lastRight - v.clientWidth);
    const distLimit = Math.max(0, track.scrollWidth - v.clientWidth);
    const minX = Math.min(0, -distLimit);
    const endX = Math.max(minX, Math.min(0, rawEndX));
    const startX = 0;
    // Desired x for the selected card (left aligned), clamped within [endX, 0]
    const desiredX = Math.max(endX, Math.min(0, -cardEl.offsetLeft));
    const delta = endX - startX || -1;
    const p = (desiredX - startX) / delta; // 0..1
    const target = st.start + (st.end - st.start) * p;
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.scrollTo === 'function') {
      try { lenis.scrollTo(target, { duration: 0.8 }); } catch { window.scrollTo({ top: target, behavior: "smooth" }); }
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
    // Corrective pass after layout settles (flex-grow animation etc.)
    setTimeout(() => {
      // Recompute with possibly updated sizes
      const cards2 = Array.from(track.querySelectorAll<HTMLElement>(`[data-xp-card]`));
      const last2 = cards2[cards2.length - 1];
      const lastRight2 = last2 ? last2.offsetLeft + last2.offsetWidth : v.clientWidth;
      const rawEndX2 = -(lastRight2 - v.clientWidth);
      const distLimit2 = Math.max(0, track.scrollWidth - v.clientWidth);
      const minX2 = Math.min(0, -distLimit2);
      const endX2 = Math.max(minX2, Math.min(0, rawEndX2));
      const startX2 = 0;
      const desiredX2 = Math.max(endX2, Math.min(0, -cardEl.offsetLeft));
      const delta2 = endX2 - startX2 || -1;
      const p2 = (desiredX2 - startX2) / delta2;
      const target2 = st.start + (st.end - st.start) * p2;
      if (lenis && typeof lenis.scrollTo === 'function') {
        try { lenis.scrollTo(target2, { duration: 0.5 }); } catch { window.scrollTo({ top: target2, behavior: "smooth" }); }
      } else {
        window.scrollTo({ top: target2, behavior: "smooth" });
      }
    }, 180);
  };

  return (
    <section ref={sectionRef} className={styles.xpHscroll}>
      <div className={`container ${styles.xpContainer}`} ref={wrapRef}>
        <div className={styles.xpStage} ref={stageRef}>
          <AnimatedSection duration={1.2} start="top 90%" y={36} stagger={0.12}>
            <h2 className={`h2 ${styles.xpHeading} anim-child`} data-reveal="up">{t('title')}</h2>
            <div className={`${styles.xpViewport} anim-child`} data-reveal="up" ref={viewportRef}>
              <div className={styles.xpTrack} ref={trackRef}>
          {items.map((xp, i) => {
            const isHovered = hovered === i;
            const isActive = active === i;
            const isNeighbor = active !== null && Math.abs(i - active) === 1;
            const isDimmed = (hovered !== null && hovered !== i) || (active !== null && !isActive && !isNeighbor);
            const grow = active !== null
              ? (isActive ? 1.7 : isNeighbor ? 0.9 : 0.75)
              : (isHovered ? 1.35 : hovered !== null ? 0.9 : 1);
            return (
              <ExperienceCard
                key={xp.id}
                xp={xp}
                index={i}
                isDesktop={isDesktop}
                isHovered={isHovered}
                isActive={isActive}
                isDimmed={isDimmed}
                grow={grow}
                t={(k) => t(k)}
                reduceMotion={reduceMotion}
                onHoverChange={setHovered}
                onToggleActive={(idx) => setActive((prev) => (prev === idx ? null : idx))}
                onRequestScroll={(el) => scrollToCard(el)}
              />
            );
          })}
          {/* end of track */}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
