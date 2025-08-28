"use client";

import { MutableRefObject, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const noop = () => {};

function getDistance(track: HTMLElement, viewport: HTMLElement) {
  return Math.max(0, track.scrollWidth - viewport.clientWidth);
}

function computePositions(track: HTMLElement, viewport: HTMLElement) {
  const cards = Array.from(track.querySelectorAll<HTMLElement>(`[data-xp-card]`));
  const distLimit = getDistance(track, viewport);
  if (!cards.length) return { startX: 0, endX: 0 } as const;

  const startX = 0;
  // Align last card's right edge with viewport right
  const last = cards[cards.length - 1];
  const lastRight = last.offsetLeft + last.offsetWidth;
  const endX = -(lastRight - viewport.clientWidth);
  const minX = Math.min(0, -distLimit);
  const maxX = 0;
  const clampedEndX = Math.max(minX, Math.min(maxX, endX));
  return { startX, endX: clampedEndX } as const;
}

function initHorizontalPin(
  stage: HTMLElement,
  viewport: HTMLElement,
  track: HTMLElement,
  dwell: number,
  scrub: number,
  stRef: MutableRefObject<ScrollTrigger | null>
) {
  gsap.set(track, { x: 0 });

  if (getDistance(track, viewport) < 1) return noop;

  const tween = gsap.fromTo(
    track,
    { x: () => computePositions(track, viewport).startX },
    {
      x: () => computePositions(track, viewport).endX,
      ease: "none",
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => "+=" + getDistance(track, viewport) * dwell,
        scrub,
        pin: true,
        anticipatePin: 2,
        invalidateOnRefresh: true,
        refreshPriority: 1,
        // use default window scroller to avoid mismatches
      },
    }
  );
  stRef.current = tween.scrollTrigger ?? null;

  const ro = new ResizeObserver(() => {
    ScrollTrigger.refresh();
  });
  ro.observe(track);

  return () => {
    ro.disconnect();
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}

export type UseHorizontalPinningArgs = Readonly<{
  stageRef: MutableRefObject<HTMLDivElement | null>;
  viewportRef: MutableRefObject<HTMLDivElement | null>;
  trackRef: MutableRefObject<HTMLDivElement | null>;
  reduceMotion: boolean;
  itemsLength: number;
  // tuning
  dwell?: number; // pin distance multiplier
  scrub?: number; // scrub smoothing
}>;

export default function useHorizontalPinning({
  stageRef,
  viewportRef,
  trackRef,
  reduceMotion,
  itemsLength,
  dwell = 1.2,
  scrub = 0.25,
}: UseHorizontalPinningArgs) {
  const stRef = useRef<ScrollTrigger | null>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    // Initialize immediately so fast scrolls don't stall before pin setup
    if (!reduceMotion) {
      mm.add("(min-width: 1024px)", () => {
        const s = stageRef.current;
        const v = viewportRef.current;
        const t = trackRef.current;
        if (!s || !t || !v) return noop;
        return initHorizontalPin(s, v, t, dwell, scrub, stRef);
      });
    }
    mm.add("(max-width: 1023px)", () => noop);
    // Refresh right after init to account for layout adjustments
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      mm.revert();
    };
  }, [itemsLength, reduceMotion, stageRef, viewportRef, trackRef, dwell, scrub]);

  return stRef;
}

