"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Starfield from "@/components/Starfield";
import { Canvas, useFrame } from "@react-three/fiber";
import type { RootState } from "@react-three/fiber";
import * as THREE from "three";

function AuroraPlane({ getShift }: { getShift: () => { x: number; y: number; z: number } }){
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      uColor1: { value: new THREE.Color("#7c5cff") },
      uColor2: { value: new THREE.Color("#34c7ff") },
      uScale: { value: 1.6 },
      uShift: { value: new THREE.Vector2(0, 0) },
      uStrength: { value: 0.65 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float time;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform float uScale;
      uniform vec2 uShift;
      uniform float uStrength;
      varying vec2 vUv;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
      }
      float fbm(vec2 x){
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
        for(int i=0;i<5;i++){
          v += a * noise(x);
          x = rot * x * 2.03;
          a *= 0.5;
        }
        return v;
      }
      void main(){
        vec2 uv = (vUv - 0.5) * uScale + uShift;
        float t = time * 0.06;
        float n = fbm(uv + vec2(t, -t*0.7));
        float glow = smoothstep(0.25, 0.95, n);
        vec3 col = mix(uColor2, uColor1, glow);
        float alpha = glow * uStrength;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  }), []);

  useFrame((_state: any, delta: number) => {
    mat.uniforms.time.value += delta;
    const s = getShift();
    // subtle easing
    mat.uniforms.uShift.value.lerp(new THREE.Vector2(s.x * 0.003, s.y * 0.003), 0.08);
    mat.uniforms.uStrength.value = THREE.MathUtils.lerp(mat.uniforms.uStrength.value, 0.65 + s.z * 0.0006, 0.06);
  });

  return (
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.5, -3]} material={mat}>
      <planeGeometry args={[12, 12, 1, 1]} />
    </mesh>
  );
}

export default function GlobalBackground(){
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<"shader" | "fallback">("fallback");

  // Decide whether to enable shader background
  useEffect(() => {
    const prm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lowMem = ("deviceMemory" in navigator ? (navigator as any).deviceMemory < 4 : false);
    const enable = !prm.matches && !lowMem;
    const ric = (cb: () => void) => ("requestIdleCallback" in window ? (window as any).requestIdleCallback(cb) : setTimeout(cb, 1));
    ric(() => setMode(enable ? "shader" : "fallback"));
  }, []);

  // Fallback parallax for CSS layers (when not using shader)
  useEffect(() => {
    if (mode !== "fallback") return;
    const root = rootRef.current;
    if (!root) return;
    const prm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prm.matches) return;

    const aurora = root.querySelector(".bg-aurora") as HTMLElement | null;
    const stars = root.querySelector(".bg-stars") as HTMLElement | null;
    const sweepA = root.querySelector(".bg-sweep .sweep.a") as HTMLElement | null;
    const sweepB = root.querySelector(".bg-sweep .sweep.b") as HTMLElement | null;

    let sy = 0; let mx = 0.5, my = 0.5; let queued = false;
    const apply = () => {
      queued = false;
      const yAurora = sy * 0.06, yStars = sy * 0.03, ySweepA = sy * 0.09, ySweepB = sy * 0.08;
      const px = (mx - 0.5), py = (my - 0.5);
      const xAurora = px * 14, xStars = px * 9, xSweep = px * 18;
      const mAurora = py * 9,  mStars = py * 6, mSweep = py * 12;
      if (aurora) aurora.style.transform = `translate3d(${xAurora}px, ${yAurora + mAurora}px, 0)`;
      if (stars)  stars.style.transform  = `translate3d(${xStars}px, ${yStars + mStars}px, 0)`;
      if (sweepA) sweepA.style.transform = `translate3d(${xSweep}px, ${ySweepA + mSweep}px, 0)`;
      if (sweepB) sweepB.style.transform = `translate3d(${xSweep * 0.7}px, ${ySweepB + mSweep * 0.9}px, 0)`;
    };
    const schedule = () => { if (!queued){ queued = true; requestAnimationFrame(apply); } };
    const onScroll = () => { sy = (window.scrollY || document.documentElement.scrollTop) || 0; schedule(); };
    const onMouse = (e: MouseEvent) => { mx = e.clientX / window.innerWidth; my = e.clientY / window.innerHeight; schedule(); };
    const ric = (cb: () => void) => ("requestIdleCallback" in window ? (window as any).requestIdleCallback(cb) : setTimeout(cb, 1));
    ric(() => {
      sy = (window.scrollY || document.documentElement.scrollTop) || 0;
      apply();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("mousemove", onMouse);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [mode]);

  // Shared shift accessor for shader scene (mouse + scroll parallax)
  const shiftRef = useRef({ x: 0, y: 0, z: 0 });
  useEffect(() => {
    if (mode !== "shader") return;
    const onMouse = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      shiftRef.current.x = nx;
      shiftRef.current.y = ny;
    };
    const onScroll = () => { shiftRef.current.z = (window.scrollY || document.documentElement.scrollTop) || 0; };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
    };
  }, [mode]);

  return (
    <div ref={rootRef} className="app-bg" aria-hidden>
      {mode === "shader" && (
        <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 3.5], fov: 50 }}>
          <ambientLight intensity={0.2} />
          {/* Animated aurora plane */}
          <AuroraPlane getShift={() => shiftRef.current} />
        </Canvas>
      )}

      {/* Fallback / supplemental layers */}
      <div className="bg-aurora">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>
      {mode !== "shader" && (
        <div className="bg-stars">
          <Starfield density={1.2} />
        </div>
      )}
      <div className="bg-sweep">
        <div className="sweep a" />
        <div className="sweep b" />
      </div>
      <div className="bg-noise" />
    </div>
  );
}
