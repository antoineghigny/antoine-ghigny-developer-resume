"use client";
import React, {useRef, useState} from "react";
import AnimatedSection from "@/components/AnimatedSection";
import {profile} from "@/data/profile";
import TechIcon from "@/components/TechIcon";
import InteractiveCard from "@/components/InteractiveCard";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import {useTranslations} from "next-intl";

gsap.registerPlugin(Flip);

const colorFor = (name: string): string => {
  const RULES: Array<{re: RegExp; c: string}> = [
    {re: /java/i, c: "#f89820"},
    {re: /spring/i, c: "#6DB33F"},
    {re: /angular/i, c: "#DD0031"},
    {re: /typescript|ts\b/i, c: "#3178C6"},
    {re: /node/i, c: "#3C873A"},
    {re: /graphql/i, c: "#E10098"},
    {re: /kafka/i, c: "#231F20"},
    {re: /docker/i, c: "#2496ED"},
    {re: /kubernetes|\bk8/i, c: "#326CE5"},
    {re: /postgres/i, c: "#336791"},
    {re: /mysql/i, c: "#00758F"},
    {re: /mongo/i, c: "#4DB33D"},
    {re: /redis/i, c: "#DC382D"},
    {re: /python/i, c: "#3776AB"},
    {re: /c\+\+/i, c: "#6295CB"},
    {re: /kotlin/i, c: "#7F52FF"},
    {re: /laravel/i, c: "#FF2D20"},
    {re: /django/i, c: "#092E20"},
  ];
  return RULES.find(r => r.re.test(name))?.c ?? "#7c5cff";
};

const abbr = (name: string): string => {
  // Prefer two letters for better readability on tiny icons
  if (/^c\+\+$/i.test(name)) return "C";
  if (/docker/.test(name.toLowerCase())) return "D";
  const words = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0]?.slice(0,2) || name.slice(0,2)).toUpperCase();
};

function SkillGroupCard({group, initial}: Readonly<{group: string; initial: readonly string[]}>){
  const [items, setItems] = useState<string[]>([...initial]);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const onChipClick = (s: string) => {
    if (!wrapRef.current) return;
    const state = Flip.getState(wrapRef.current.querySelectorAll(".chip"));
    const next = [s, ...items.filter(i => i !== s)];
    setItems(next);
    Flip.from(state, {
      duration: 0.6,
      ease: "power3.inOut",
      stagger: 0.02,
    });
  };

  return (
    <InteractiveCard className="anim-child" data-reveal="up">
      <strong style={{textTransform:'capitalize'}}>{group}</strong>
      <div ref={wrapRef} className="chips" style={{marginTop:8}}>
        {items.map(s => (
          <button
            key={s}
            type="button"
            className="chip"
            data-flip-id={s}
            onClick={() => onChipClick(s)}
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
            aria-label={`Promote ${s}`}
          >
            <TechIcon label={abbr(s)} color={colorFor(s)} size={22} />
            {s}
          </button>
        ))}
      </div>
    </InteractiveCard>
  );
}

export default function Skills(){
  const t = useTranslations('Skills');
  return (
    <AnimatedSection className="container" stagger={0.12} y={28}>
      <h2 className="h2 anim-child" data-reveal="left">{t('title')}</h2>
      <div className="grid grid-2">
        {(Object.keys(profile.skills) as Array<keyof typeof profile.skills>).map((group) => (
          <SkillGroupCard key={group} group={group} initial={profile.skills[group]} />
        ))}
      </div>
    </AnimatedSection>
  );
}
