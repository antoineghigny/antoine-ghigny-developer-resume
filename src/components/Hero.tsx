"use client";
import { useTranslations } from 'next-intl';
import React, {useEffect, useRef, useState} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import TechIcon from "@/components/TechIcon";
import dynamic from "next/dynamic";
import styles from "./Hero.module.css";
const StarfieldDyn = dynamic(() => import("@/components/Starfield"), { ssr: false, loading: () => null });

gsap.registerPlugin(ScrollTrigger);
const Hero3D = dynamic(() => import("@/components/Hero3D"), { ssr: false });

export default function Hero() {
  const t = useTranslations('Hero');
  const ref = useRef<HTMLDivElement | null>(null);
  const [showStars, setShowStars] = useState(false);
  // Render 3D immediately; do not wait for idle to avoid invisible center node
  const [show3D, setShow3D] = useState(true);
  const [starDensity, setStarDensity] = useState(0.6);
  
  const scrollToCTA = () => {
    const target = document.getElementById('cta');
    if (!target) return;
    const lenis = (window as any).__lenis;
    try {
      if (lenis && typeof lenis.scrollTo === 'function') {
        // Use element target to account for responsive reflow/layout shifts, with small offset
        lenis.scrollTo(target, { duration: 1.0, offset: -16 });
        // Corrective pass after layout settles a bit (e.g., fonts/images)
        setTimeout(() => {
          const r2 = target.getBoundingClientRect();
          if (r2.top > 40) {
            try { lenis.scrollTo(target, { duration: 0.4, offset: -16 }); } catch {}
          }
        }, 180);
      } else if ('scrollTo' in window) {
        const rect = target.getBoundingClientRect();
        const absoluteY = rect.top + (window.scrollY || window.pageYOffset);
        window.scrollTo({ top: Math.max(absoluteY - 16, 0), behavior: 'smooth' });
        setTimeout(() => {
          const r2 = target.getBoundingClientRect();
          if (r2.top > 40) {
            const abs2 = r2.top + (window.scrollY || window.pageYOffset);
            window.scrollTo({ top: Math.max(abs2 - 16, 0), behavior: 'smooth' });
          }
        }, 180);
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch {
      try { window.location.hash = '#cta'; } catch {}
    }
  };


  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ric = (cb: () => void) => ("requestIdleCallback" in window ? (window as any).requestIdleCallback(cb) : setTimeout(cb, 1));

    const ctx = gsap.context(() => {
      const splits: any[] = [];
      const titleEl = el.querySelector(".hero-title") as HTMLElement | null;
      const taglineEl = el.querySelector(".hero-tagline") as HTMLElement | null;
      const subEl = el.querySelector(".hero-sub") as HTMLElement | null;
      const badgeEl = el.querySelector(".keyword-tag.available") as HTMLElement | null;
      const chips = el.querySelectorAll(".chip");
      const pl = gsap.utils.toArray<HTMLElement>(".parallax", el);

      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Pre-hide to avoid initial flash before animations bind (autoAlpha controls visibility)
      if (titleEl) gsap.set(titleEl, { autoAlpha: 0, y: 8, css: { "--glow": 0 } });
      if (taglineEl) gsap.set(taglineEl, { autoAlpha: 0, y: 8 });
      if (subEl) gsap.set(subEl, { autoAlpha: 0, y: 8 });
      if (badgeEl) gsap.set(badgeEl, { autoAlpha: 0, y: 8 });
      if (chips.length) gsap.set(chips, { autoAlpha: 0, y: 10 });

      // SplitType animations for title & subtitle (run immediately; simplified if reduced motion)
      (async () => {
        // Fallback: if idle work is delayed, reveal everything quickly to avoid hidden text
        let fallbackFired = false;
        const fallback = setTimeout(() => {
          fallbackFired = true;
          gsap.to([titleEl, taglineEl, subEl, badgeEl], { autoAlpha: 1, y: 0, duration: 0.12, ease: "power1.out" });
          gsap.to(chips, { autoAlpha: 1, y: 0, duration: 0.12, ease: "power1.out" });
        }, 600);
        if (reduced) {
          clearTimeout(fallback);
          gsap.to([titleEl, taglineEl, subEl, badgeEl], { autoAlpha: 1, y: 0, duration: 0.001, ease: "none" });
          gsap.to(chips, { autoAlpha: 1, y: 0, duration: 0.001, ease: "none" });
          return;
        }
        const { default: SplitType } = await import("split-type");
        // Prevent fallback now that SplitType is ready
        clearTimeout(fallback);
        if (titleEl) {
          const split = new SplitType(titleEl, { types: "chars" });
          splits.push(split);
          // Ensure parent visible before child reveal
          gsap.set(titleEl, { autoAlpha: 1 });
          if (!fallbackFired) {
            // Impactful char entrance
            gsap.from(split.chars, {
              opacity: 0,
              yPercent: 40,
              rotateX: 35,
              transformOrigin: "50% 50% -20",
              filter: "blur(6px)",
              force3D: true,
              duration: 0.9,
              ease: "power3.out",
              stagger: { each: 0.015, from: "start" },
              onUpdate: function(){ /* allow future hooks */ },
              onComplete: function(){ /* sheen queued below */ }
            });
            // Badge reveal in sync with title
            if (badgeEl) {
              gsap.to(badgeEl, {
                autoAlpha: 1,
                y: 0,
                duration: 0.4,
                ease: "power2.out",
                delay: 0.25,
                force3D: true,
                onStart: () => {
                  // Disable magnetic effect during entrance to avoid extra transforms/reflow
                  badgeEl.removeAttribute('data-magnetic');
                  gsap.set(badgeEl, { willChange: "transform, opacity", pointerEvents: "none" });
                },
                onComplete: () => {
                  gsap.set(badgeEl, { willChange: "auto", clearProps: "transform", pointerEvents: "" });
                  // Re-enable magnetic
                  badgeEl.setAttribute('data-magnetic', "");
                },
              });
            }
            // Quick color sheen sweep across chars
            gsap.to(split.chars, {
              color: "#7c5cff",
              duration: 0.22,
              ease: "power1.inOut",
              yoyo: true,
              repeat: 1,
              stagger: { each: 0.012, from: "start" },
              delay: 0.25,
            });
            // Idle glow breathing via CSS variable (text-shadow in CSS)
            gsap.to(titleEl, { duration: 2.0, ease: "sine.inOut", repeat: -1, yoyo: true, "--glow": 0.6 });
          }
        }
        if (taglineEl) {
          if (!fallbackFired) {
            gsap.to(taglineEl, {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              delay: 0.4,
            });
          }
        }
        if (subEl) {
          const split = new SplitType(subEl, { types: "words" });
          splits.push(split);
          gsap.set(subEl, { opacity: 1 });
          if (!fallbackFired) {
            gsap.from(split.words, {
              opacity: 0,
              y: 12,
              duration: 0.6,
              ease: "power3.out",
              stagger: 0.03,
              delay: 0.6,
            });
          }
        }
        if (!fallbackFired) {
          gsap.fromTo(chips, { autoAlpha: 0, y: 10 }, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.5,
            ease: "power3.out",
            delay: 0.15
          });
        }
        // already cleared after import, keep this as safety
        clearTimeout(fallback);
      })();

      // Mouse-based parallax (reduced intensity) — disabled if reduced motion or no layers
      const mm = (e: MouseEvent) => {
        const bounds = el.getBoundingClientRect();
        const cx = bounds.left + bounds.width / 2;
        const cy = bounds.top + bounds.height / 2;
        const dx = (e.clientX - cx) / (bounds.width / 2);
        const dy = (e.clientY - cy) / (bounds.height / 2);
        pl.forEach((layer: HTMLElement) => {
          const depth = parseFloat(layer.dataset.depth || "0.2");
          gsap.to(layer, { x: dx * 16 * depth, y: dy * 10 * depth, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        });
      };
      if (!reduced && pl.length) el.addEventListener("mousemove", mm as any);

      // Scroll-based float
      if (!reduced && pl.length) {
        pl.forEach((layer: HTMLElement) => {
          const depth = parseFloat(layer.dataset.depth || "0.2");
          gsap.to(layer, {
            yPercent: 12 * depth,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
          });
        });
      }

      // Scroll-based fade out of hero-only visuals to blend with next section
      const fadeTargets = gsap.utils.toArray<HTMLElement>([".bg-grad", ".stars", ".hero-3d"], el);
      if (fadeTargets.length) {
        gsap.fromTo(fadeTargets, { autoAlpha: 1 }, {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top center", end: "bottom top", scrub: true }
        });
      }

      return () => {
        if (!reduced && pl.length) el.removeEventListener("mousemove", mm as any);
        splits.forEach((s) => {
          try { s.revert(); } catch {}
        });
      };
    }, ref);

    // Defer non-critical visuals to idle
    // Adaptive star density based on device capabilities and viewport
    ric(() => {
      try {
        const dm: number = (navigator as any).deviceMemory || 8;
        const isNarrow = window.innerWidth < 900;
        const base = dm <= 4 ? 0.45 : 0.6;
        setStarDensity(isNarrow ? Math.min(base, 0.5) : base);
      } catch {}
    });
    ric(() => setShowStars(true));

    return () => ctx.revert();
  }, []);

  

  // Fade-in stars when they first mount
  useEffect(() => {
    if (!showStars) return;
    const el = ref.current;
    if (!el) return;
    const stars = el.querySelector(".stars") as HTMLElement | null;
    if (!stars) return;
    gsap.fromTo(stars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
  }, [showStars]);

  return (
    <section className="hero" ref={ref}>
      <div className="bg-grad parallax" data-depth="0.25" />
      {showStars && (
        <div className="stars parallax" data-depth="0.15">
          <StarfieldDyn density={starDensity} />
        </div>
      )}
      {/* Parallax decorative orbs */}
      <div className="parallax-layer parallax float slow" data-depth="0.35" style={{ top: "24%", right: "-10%" }}>
        <div className="orb" />
      </div>
      <div className="parallax-layer parallax float" data-depth="0.20" style={{ bottom: "8%", left: "-6%" }}>
        <div className="orb small" />
      </div>
      <div className="parallax-layer parallax float fast" data-depth="0.12" style={{ top: "10%", left: "14%" }}>
        <div className="orb tiny" />
      </div>
      {show3D && (
        <div className="hero-3d-wrap">
          <Hero3D />
        </div>
      )}
      <div className={`container hero-inner ${styles.heroInner}`}>
        <button
          type="button"
          className={`keyword-tag available ${styles.availBadge}`}
          onClick={scrollToCTA}
          data-magnetic
          aria-label={t('availability')}
          style={{ opacity: 0, transform: "translateY(8px)" }}
        >
          {t('availability')}
        </button>
        <h1 className="h1 hero-title" style={{ opacity: 0, transform: "translateY(8px)" }}>Antoine Ghigny</h1>
        <p className="p hero-tagline" style={{ marginBottom: 8, opacity: 0, transform: "translateY(8px)", fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          {t('title')}
        </p>
        <p className="p hero-sub" style={{ marginBottom: 16, opacity: 0, transform: "translateY(8px)" }}>
          {t('subtitle')}
        </p>
        <div className="chips" style={{ marginTop: 8 }}>
          <span className="chip" data-magnetic style={{ opacity: 0, transform: "translateY(10px)" }}><TechIcon label="JA" color="#f89820" size={22} />Java</span>
          <span className="chip" data-magnetic style={{ opacity: 0, transform: "translateY(10px)" }}><TechIcon label="SB" color="#6DB33F" size={22} />Spring Boot</span>
          <span className="chip" data-magnetic style={{ opacity: 0, transform: "translateY(10px)" }}><TechIcon label="AN" color="#DD0031" size={22} />Angular</span>
          <span className="chip" data-magnetic style={{ opacity: 0, transform: "translateY(10px)" }}><TechIcon label="NO" color="#3C873A" size={22} />Node.js</span>
          <span className="chip" data-magnetic style={{ opacity: 0, transform: "translateY(10px)" }}><TechIcon label="GQ" color="#E10098" size={22} />GraphQL</span>
          <span className="chip" data-magnetic style={{ opacity: 0, transform: "translateY(10px)" }}><TechIcon label="DK" color="#2496ED" size={22} />Docker / K8s</span>
        </div>
      </div>
    </section>
  );
}

