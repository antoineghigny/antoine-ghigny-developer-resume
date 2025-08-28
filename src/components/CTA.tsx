"use client";
import React from "react";
import AnimatedSection from "@/components/AnimatedSection";
import InteractiveCard from "@/components/InteractiveCard";

export default function CTA(){
  return (
    <AnimatedSection className="container" id="cta" style={{ scrollMarginTop: '32px' }}>
      <InteractiveCard className="anim-child" data-reveal="up" style={{textAlign:'center'}}>
        <h2 className="h2">Let’s build something great</h2>
        <p className="p" style={{margin:'8px 0 16px'}}>Available for freelance missions. I can help with backend microservices, front-end apps, and DevOps.</p>
        <a className="badge" href="mailto:antoine.ghigny+freelance@example.com">Contact me</a>
      </InteractiveCard>
    </AnimatedSection>
  );
}
