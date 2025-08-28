"use client";

import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, Link } from '@/navigation';
import gsap from 'gsap';
import styles from './LanguageSwitcher.module.css';

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('UI');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Using next-intl/navigation's usePathname, we can link to the same path and switch locale
  const currentPath = pathname || '/';

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const root = containerRef.current!;
      const optionsEl = root.querySelector(`.${styles.langOrbOptions}`);
      const optionEls = root.querySelectorAll(`.${styles.langOrbOption}`);
      tlRef.current = gsap.timeline({ paused: true })
        .to(optionsEl, { width: 'auto', duration: 0.3, ease: 'power3.inOut' })
        .to(optionEls, { opacity: 1, x: 0, stagger: 0.05, duration: 0.2, ease: 'power2.out' }, "-=.15");
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleMouseEnter = () => {
    setIsOpen(true);
    tlRef.current?.play();
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
    tlRef.current?.reverse();
  };

  const handleToggleClick = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) tlRef.current?.play(); else tlRef.current?.reverse();
      return next;
    });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleClick();
    }
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
      tlRef.current?.reverse();
    }
  };

  const allLocales = ['en', 'fr', 'nl'] as const;
  const otherLocales = allLocales.filter((loc) => loc !== locale);

  const optionsId = 'lang-options';

  // Detect touch device
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return (
    <div
      ref={containerRef}
      className={styles.langOrbContainer}
      onMouseEnter={!isTouchDevice ? handleMouseEnter : undefined}
      onMouseLeave={!isTouchDevice ? handleMouseLeave : undefined}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-haspopup="true"
      aria-expanded={isOpen}
      aria-controls={optionsId}
      aria-label={t('changeLanguage')}
      title={t('changeLanguage')}
      onClick={handleToggleClick}
    >
      <div className={styles.langOrbIcon} aria-hidden>
        <GlobeIcon />
      </div>
      <span className={styles.langLabel}>{t('language')}</span>
      <span className={styles.langCurrent}>{locale.toUpperCase()}</span>
      <div id={optionsId} className={styles.langOrbOptions}>
        {otherLocales.map(loc => (
          <Link
            key={loc}
            href={currentPath}
            locale={loc}
            className={`${styles.langOrbOption} ${locale === loc ? styles.active : ''}`}
            prefetch={false}
          >
            {loc.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}
