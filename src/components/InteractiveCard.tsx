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

    // Detect touch device - also check for touch support directly
    const isTouchDevice = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches || 
                          'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const schedule = () => {
      if (raf.current != null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        const { rx, ry, scale } = state.current;
        // Smooth transitions for mobile
        if (isTouchDevice) {
          el.style.transition = 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)';
          el.style.transform = `scale(${scale})`;
        } else {
          el.style.transition = '';
          el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
        }
      });
    };

    // Always add touch interactions for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        state.current.scale = 1.02;
        schedule();
      }
    };
    
    const onTouchEnd = () => {
      state.current.scale = 1;
      schedule();
    };
    
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    if (isTouchDevice) {
      // Mobile: Disable spot opacity
      el.style.setProperty("--spot-opacity", "0");
      
      return () => {
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchend", onTouchEnd);  
        el.removeEventListener("touchcancel", onTouchEnd);
        if (raf.current != null) cancelAnimationFrame(raf.current);
      };
    } else {
      // Desktop: Mouse interactions with tilt and scale
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

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("mousemove", onMove);
      
      return () => {
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchend", onTouchEnd);  
        el.removeEventListener("touchcancel", onTouchEnd);
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("mousemove", onMove);
        if (raf.current != null) cancelAnimationFrame(raf.current);
      };
    }
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
