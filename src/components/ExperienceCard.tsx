"use client";

import React, { useRef } from "react";
import styles from "./Experience.module.css";
import type { Experience as Xp } from "@/data/profile";

export type ExperienceCardProps = Readonly<{
  xp: Xp;
  index: number;
  isDesktop: boolean;
  isHovered: boolean;
  isActive: boolean;
  isDimmed: boolean;
  grow: number;
  t: (k: string) => string;
  reduceMotion: boolean;
  onHoverChange: (index: number | null) => void;
  onToggleActive: (index: number) => void;
  onRequestScroll: (el: HTMLElement) => void;
}>;

export default function ExperienceCard({
  xp,
  index: i,
  isDesktop,
  isHovered,
  isActive,
  isDimmed,
  grow,
  t,
  reduceMotion,
  onHoverChange,
  onToggleActive,
  onRequestScroll,
}: ExperienceCardProps) {
  // Internal tilt state maps
  const rafMap = useRef(new WeakMap<HTMLElement, number>());
  const rectMap = useRef(new WeakMap<HTMLElement, DOMRect>());
  const posMap = useRef(new WeakMap<HTMLElement, { mx: number; my: number; rx: number; ry: number }>());

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    onHoverChange(i);
    if (reduceMotion) return;
    const card = e.currentTarget.parentElement as HTMLElement;
    rectMap.current.set(card, card.getBoundingClientRect());
    card.style.setProperty("--spot-opacity", "1");
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    onHoverChange(null);
    const card = e.currentTarget.parentElement as HTMLElement;
    if (!reduceMotion) {
      card.style.setProperty("--rx", `0deg`);
      card.style.setProperty("--ry", `0deg`);
      card.style.setProperty("--spot-opacity", "0");
      const rafId = rafMap.current.get(card);
      if (rafId != null) { cancelAnimationFrame(rafId); rafMap.current.delete(card); }
      rectMap.current.delete(card);
      posMap.current.delete(card);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduceMotion) return;
    const card = e.currentTarget.parentElement as HTMLElement;
    const rect = card.getBoundingClientRect();
    rectMap.current.set(card, rect);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;
    const maxTilt = 2; // softer tilt for smoother feel
    posMap.current.set(card, { mx: x, my: y, rx: -py * maxTilt, ry: px * maxTilt });
    if (rafMap.current.get(card) != null) return;
    const id = requestAnimationFrame(() => {
      rafMap.current.delete(card);
      const s = posMap.current.get(card);
      if (!s) return;
      card.style.setProperty("--mx", `${s.mx}px`);
      card.style.setProperty("--my", `${s.my}px`);
      card.style.setProperty("--rx", `${s.rx.toFixed(2)}deg`);
      card.style.setProperty("--ry", `${s.ry.toFixed(2)}deg`);
    });
    rafMap.current.set(card, id);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onToggleActive(i);
    const card = e.currentTarget.parentElement as HTMLElement;
    // Defer scroll mapping to next frame so layout (flex-grow) is settled
    requestAnimationFrame(() => onRequestScroll(card));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleActive(i);
      const card = e.currentTarget.parentElement as HTMLElement;
      requestAnimationFrame(() => onRequestScroll(card));
    }
  };

  return (
    <article
      data-xp-card
      className={`${styles.xpCard} interactive-card card${isActive ? " is-active" : ""} ${isHovered ? styles.xpCardHovered : ""} ${isDimmed ? styles.xpCardDimmed : ""}`}
      style={{ flexGrow: isDesktop ? 0 : grow }}
    >
      <button
        type="button"
        className={styles.xpCardBtn}
        aria-labelledby={`xp-title-${xp.id}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      />
      <div className={styles.xpBody}>
        <header className={styles.xpHead}>
          <span className="badge">
            {xp.end ? `${xp.start} → ${xp.end}` : `${xp.start} → ${t('present')}`} · {xp.months} {t('months')} · {t(`type.${xp.type}`)}
          </span>
          <h3 id={`xp-title-${xp.id}`} className={styles.xpTitle}>{t(`${xp.id}.title`)}</h3>
          <p className={styles.xpMeta}>
            {xp.company}
            {xp.customer && xp.customer !== xp.company ? ` — ${xp.customer}` : ""}
          </p>
        </header>
        <p className={styles.xpSummary}>{t(`${xp.id}.summary`)}</p>
        {!!xp.tech?.length && (
          <div className={styles.tlTech}>
            {xp.tech.map((tech) => (
              <span key={tech} className="chip">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
