"use client";

import React, {useEffect, useRef} from "react";

export type InteractiveCardProps = Readonly<{
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  maxTiltDeg?: number; // tilt intensity
  hoverScale?: number;  // scale on hover
  reveal?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade' | false; // default reveal direction for AnimatedSection
}> & React.HTMLAttributes<HTMLDivElement>;

export default function InteractiveCard({
  className,
  children,
  style,
  maxTiltDeg = 3,
  hoverScale = 1.005,
  reveal = 'up',
  ...rest
}: InteractiveCardProps){
  const ref = useRef<HTMLDivElement | null>(null);
  const raf = useRef<number | null>(null);
  const state = React.useRef({ rx: 0, ry: 0, scale: 1, hovering: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onEnter = () => {
      state.current.hovering = true;
      state.current.scale = hoverScale;
      el.style.setProperty("--spot-opacity", "1");
    };

    const onLeave = () => {
      state.current.hovering = false;
      state.current.rx = 0; state.current.ry = 0; state.current.scale = 1;
      el.style.setProperty("--spot-opacity", "0");
      schedule();
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);

      const px = (x / rect.width) - 0.5; // -0.5..0.5
      const py = (y / rect.height) - 0.5;
      state.current.ry = px * maxTiltDeg;      // yaw
      state.current.rx = -py * maxTiltDeg;     // pitch
      schedule();
    };

    const schedule = () => {
      if (raf.current != null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        const { rx, ry, scale } = state.current;
        el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mousemove", onMove);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mousemove", onMove);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [hoverScale, maxTiltDeg]);

  return (
    <div
      ref={ref}  
      className={["card", "interactive-card", reveal !== false && "anim-child", className].filter(Boolean).join(" ")}
      data-reveal={reveal === false ? undefined : reveal}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}
