"use client";
import React, { Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, MeshDistortMaterial, Preload } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

function AnimatedOrb() {
  const matProps = useMemo(() => ({
    color: "#7c5cff",
    emissive: "#3b2fd4",
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.6,
    clearcoatRoughness: 0.4,
  }), []);

  useFrame((state: any) => {
    const t = state.clock.getElapsedTime();
    const g = state.scene.getObjectByName("orb");
    if (g) {
      (g.rotation as any).x = Math.sin(t * 0.6) * 0.2;
      (g.rotation as any).y = t * 0.25;
    }
  });

  return (
    <Icosahedron name="orb" args={[1.1, 1]} position={[0, 0, 0]}>
      <MeshDistortMaterial distort={0.28} speed={1.2} {...matProps} />
    </Icosahedron>
  );
}

export default function Hero3D() {
  return (
    <div className="hero-3d" aria-hidden>
      <Canvas
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3.2], fov: 55 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[2, 2, 2]} intensity={0.8} />
          <directionalLight position={[-2, -1, -1]} intensity={0.4} color="#6ac6ff" />

          <AnimatedOrb />

          {/* Effects removed per user preference */}

          <EffectComposer multisampling={0}>
            <Bloom intensity={0.6} luminanceThreshold={0.1} luminanceSmoothing={0.2} mipmapBlur />
            <Vignette eskil={false} offset={0.2} darkness={0.6} />
          </EffectComposer>

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
