"use client";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useRef } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import {profile} from "@/data/profile";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./About.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const t = useTranslations('About');
  const tProfile = useTranslations('Profile');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const monthsTotal = useMemo(() => {
    return profile.experience.reduce((acc, xp) => acc + (xp.months || 0), 0);
  }, []);

  const companyCount = useMemo(() => {
    const s = new Set<string>();
    profile.experience.forEach(xp => { s.add(xp.company); if (xp.customer) s.add(xp.customer); });
    return s.size;
  }, []);
  

  const keywords = useMemo(() => {
    const set = new Set<string>();
    // from skills
    Object.values(profile.skills).forEach(arr => arr.forEach(s => set.add(s.toLowerCase())));
    // from experience tech
    profile.experience.forEach(xp => xp.tech.forEach(t => set.add(t.toLowerCase())));
    // extra domain terms likely present in the about copy
    ['microservices','observability','performance','reactive','graphql','react','angular','java','node.js','spring','spring boot','sql','nosql','docker','kubernetes','ci/cd','devops','arhs','proximus']
      .forEach(k => set.add(k.toLowerCase()));
    return set;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Scrub highlight for keywords line by line
      const lineNodes = Array.from(containerRef.current!.querySelectorAll<HTMLElement>(`.${styles.kwLine}`));
      lineNodes.forEach(line => {
        const kws = line.querySelectorAll<HTMLElement>(`.${styles.kw}`);
        if (!kws.length) return;
        gsap.set(kws, { backgroundSize: '100% 0%' });
        if (!reduceMotion) {
          gsap.to(kws, {
            backgroundSize: '100% 52%',
            ease: 'none',
            stagger: { each: 0.08, from: 'start' },
            scrollTrigger: {
              trigger: line,
              start: 'top 80%',
              end: 'bottom 30%',
              scrub: true,
            }
          });
        } else {
          gsap.set(kws, { backgroundSize: '100% 40%' });
        }
      });

      // Stats: animate count-up + subtle scale/opacity on enter
      const nums = Array.from(containerRef.current!.querySelectorAll<HTMLElement>(`.${styles.aboutStat} .num`));
      nums.forEach(n => {
        const to = Number(n.getAttribute('data-to') || n.textContent || '0');
        if (!reduceMotion) {
          // number tween
          const obj = { val: 0 };
          n.textContent = '0';
          gsap.to(obj, {
            val: to,
            duration: 1.2,
            ease: 'power3.out',
            onUpdate: () => { n.textContent = Math.floor(obj.val).toString(); },
            scrollTrigger: { trigger: n, start: 'top 90%', once: true }
          });
          // appearance
          gsap.from(n, {
            scale: 0.94,
            opacity: 0.0,
            duration: 0.5,
            ease: 'power3.out',
            scrollTrigger: { trigger: n, start: 'top 90%', once: true }
          });
        } else {
          n.textContent = String(to);
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [reduceMotion]);

  const renderWithKeywords = (text: string) => {
    const tokens = text.split(/(\s+)/);
    const normalize = (t: string) => t.replace(/[.,;:!?()\[\]{}"'`’–—-]/g, '').toLowerCase();
    return tokens.map((tok, i) => {
      const fragKey = `${tok}-${i}`;
      if (/^\s+$/.test(tok)) return <React.Fragment key={fragKey}>{tok}</React.Fragment>;
      const norm = normalize(tok);
      const isKw = keywords.has(norm);
      if (isKw) {
        return (
          <span key={`kw-${norm}-${i}`} className={`${styles.kw} ${styles.kwShimmer}`}>{tok}</span>
        );
      }
      return <React.Fragment key={fragKey}>{tok}</React.Fragment>;
    });
  };

  return (
    <AnimatedSection className={`container ${styles.aboutStory}`}>
      <div ref={containerRef} className="grid grid-2" style={{alignItems: 'start'}}>
        {/* Sticky left: 2 stats */}
        <div className={styles.aboutStats}>
          <div className={`${styles.aboutStat} anim-child`} data-reveal="up">
            <div className={`num ${styles.statNum}`} data-stat="months" data-to={monthsTotal}>{monthsTotal}</div>
            <div className={`label ${styles.statLabel}`}>{t('stats.months')}</div>
          </div>
          <div className={`${styles.aboutStat} anim-child`} data-reveal="up">
            <div className={`num ${styles.statNum}`} data-stat="companies" data-to={companyCount}>{companyCount}</div>
            <div className={`label ${styles.statLabel}`}>{t('stats.companies')}</div>
          </div>
        </div>

        {/* Right column: kinetic story with keyword highlight sweep */}
        <div style={{display:'grid', gap:24}}>
          <div>
            {['p1', 'p2', 'p3'].map((key) => (
              <p key={key} className={`p ${styles.kwLine} anim-child`} data-reveal="up" style={{margin:0, marginBottom: 16}}>
                {renderWithKeywords(tProfile(`about.${key}`))}
              </p>
            ))}
          </div>

          <div className="about-keywords anim-child" data-reveal="up">
            <h3 className="h3" style={{ marginBottom: 16 }}>{t('keywords.title')}</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="keyword-tag">{t('keywords.value1')}</div>
              <div className="keyword-tag">{t('keywords.value2')}</div>
              <div className="keyword-tag">{t('keywords.value3')}</div>
              <div className="keyword-tag">{t('keywords.value4')}</div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
