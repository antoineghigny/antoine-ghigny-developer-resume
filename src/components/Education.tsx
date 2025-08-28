"use client";
import { useTranslations, useLocale } from "next-intl";
import React, { useLayoutEffect, useRef } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import {profile} from "@/data/profile";
import InteractiveCard from "@/components/InteractiveCard";

export default function Education(){
  const t = useTranslations('Education');
  const locale = useLocale();

  // Layout constants to keep timeline robust and in sync
  const GAP = 16;      // must match grid gap below
  const DOT = 12;      // dot diameter in px (slightly larger)

  // Refs to measure and set connector heights
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const colRefs = useRef<Array<HTMLDivElement | null>>([]);
  const connRefs = useRef<Array<HTMLSpanElement | null>>([]);

  // Safe date formatter: fallback to 'en' or ISO slice if Node ICU lacks locale on SSR
  const safeFormat = (d: Date): string => {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    try { return new Intl.DateTimeFormat(locale, opts).format(d); } catch {}
    try { return new Intl.DateTimeFormat('en', opts).format(d); } catch {}
    return d.toISOString().slice(0, 7);
  };

  const formatDates = (start: string, end?: string) => {
    try {
      const s = safeFormat(new Date(start));
      const e = end ? safeFormat(new Date(end)) : t('present');
      return `${s} – ${e}`; // EN DASH
    } catch {
      return `${start} – ${end ?? t('present')}`;
    }
  };

  // Compute connector heights from the center of each dot column to the next
  useLayoutEffect(() => {
    const compute = () => {
      const cols = colRefs.current;
      const conns = connRefs.current;
      const baseTop = timelineRef.current?.getBoundingClientRect().top ?? 0;
      for (let i = 0; i < cols.length - 1; i++) {
        const a = cols[i];
        const b = cols[i + 1];
        const c = conns[i];
        if (!a || !b || !c) continue;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const cyA = (ra.top - baseTop) + ra.height / 2;
        const cyB = (rb.top - baseTop) + rb.height / 2;
        // Exact center-to-center height (no overlap) to avoid seam dominance
        const h = Math.max(0, cyB - cyA);
        c.style.height = `${h.toFixed(2)}px`;
      }
    };
    // Run after paint
    requestAnimationFrame(compute);
    // And once more after potential async layout
    const raf2 = requestAnimationFrame(compute);
    // Recompute when fonts load (layout can change)
    try { (document as any).fonts?.ready?.then(() => compute()); } catch {}
    // Observe size changes on the timeline and each column
    const obs = new ResizeObserver(() => compute());
    if (timelineRef.current) obs.observe(timelineRef.current);
    colRefs.current.forEach((el) => { if (el) obs.observe(el); });
    window.addEventListener('resize', compute);
    // Defer a late compute to catch async content
    const t = setTimeout(compute, 120);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', compute);
      clearTimeout(t);
      cancelAnimationFrame(raf2);
    };
  }, []);

  return (
    <AnimatedSection className="container">
      <h2 className="h2 anim-child">{t('title')}</h2>
      <div ref={timelineRef} className="timeline" style={{display:'grid', gap:GAP, marginTop:8, overflow:'hidden'}}>
        {profile.education.map((e, idx) => (
          <div key={e.id} className="anim-child" data-reveal="up" style={{display:'grid', gridTemplateColumns:'20px 1fr', gap:12}}>
            <div aria-hidden="true" style={{position:'relative'}} ref={(el) => { colRefs.current[idx] = el; }}>
              {/* Dot centered vertically in the row (i.e., middle of the card) */}
              <span className="edu-dot" style={{position:'absolute', zIndex:1, left:'50%', top:'50%', transform:'translate(-50%, -50%)', width:DOT, height:DOT, borderRadius:999, background:'var(--accent, #7c5cff)'}} />
              {/* Thick connector from the dot center going downward, long enough to overlap next rows */}
              {idx < profile.education.length - 1 ? (
                <span ref={(el) => { connRefs.current[idx] = el; }} style={{
                  position:'absolute',
                  left:'calc(50% - 1.5px)',
                  top:'50%',
                  height: 0,
                  width:3,
                  background:`linear-gradient(to bottom, rgba(124,92,255,${idx===0?0.60:0.45}) 0%, rgba(124,92,255,0.48) 60%, rgba(124,92,255,0.45) 100%)`,
                  pointerEvents:'none'
                }} />
              ) : (
                <span style={{
                  position:'absolute',
                  left:'calc(50% - 1.5px)',
                  top:'50%',
                  height: 64, /* finite fade */
                  width:3,
                  background:'linear-gradient(to bottom, rgba(124,92,255,0.45) 0%, rgba(124,92,255,0.26) 60%, rgba(124,92,255,0.0) 100%)',
                  pointerEvents:'none'
                }} />
              )}
            </div>
            <InteractiveCard reveal={false}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <code style={{
                  background:'rgba(124,92,255,0.12)',
                  border:'1px solid rgba(124,92,255,0.35)',
                  padding:'2px 6px', borderRadius:6,
                  fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize:12,
                  color:'var(--accent, #7c5cff)'
                }}>&lt;degree/&gt;</code>
                <strong>{e.school}</strong>
              </div>
              <div className="p" style={{marginTop:6}}>
                {t(`${e.id}.degree`)}
              </div>
              <div className="p" style={{opacity:0.8, marginTop:6}}>
                {formatDates(e.start, e.end)}
              </div>
            </InteractiveCard>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
}
