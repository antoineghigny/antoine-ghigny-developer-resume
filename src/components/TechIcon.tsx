"use client";

import React from "react";

export type TechIconProps = Readonly<{
  label: string;
  color?: string; // CSS color for gradient
  size?: number; // px
  className?: string;
}>;

export default function TechIcon({label, color = "#7c5cff", size = 56, className}: TechIconProps){
  const id = React.useId();
  const radius = size / 2;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
    >
      <defs>
        <radialGradient id={`g-${id}`} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="60%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={radius} cy={radius} r={radius - 2} fill={`url(#g-${id})`} />
      <circle cx={radius} cy={radius} r={radius - 2} fill="none" stroke="rgba(255,255,255,0.12)" />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.max(12, Math.round(size * 0.36))}
        fontWeight={700}
        fontFamily="var(--font-grotesk), var(--font-inter), ui-sans-serif"
        fill="#e7e9ee"
      >
        {label}
      </text>
    </svg>
  );
}
