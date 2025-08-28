import React from "react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Education from "@/components/Education";
import CTA from "@/components/CTA";

export default function Page() {
  return (
    <main>
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Education />
      <CTA />
      <footer>© {new Date().getFullYear()} Antoine Ghigny</footer>
    </main>
  );
}
