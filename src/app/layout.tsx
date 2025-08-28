import "./globals.css";
import React from "react";
import Script from "next/script";
import SmoothScroll from "@/components/SmoothScroll";
import BackToTop from "@/components/BackToTop";
import {Inter, Space_Grotesk, JetBrains_Mono} from "next/font/google";

export const metadata = {
  title: "Antoine Ghigny — Software Engineer",
  description: "Portfolio MVP — React, Next.js, GSAP animations"
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  weight: ["400", "700"],
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>){
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${grotesk.variable} ${mono.variable}`}>
        <Script id="set-js" strategy="beforeInteractive">
          {`try{document.documentElement.classList.add('js')}catch(e){}`}
        </Script>
        <noscript>
          <style>{`.hero .hero-title, .hero .hero-sub, .hero .chips .chip{opacity:1 !important; transform:none !important}`}</style>
        </noscript>
        <SmoothScroll />
        <div className="app-root">
          <div className="app-content">
            {children}
          </div>
          <BackToTop />
        </div>
      </body>
    </html>
  );
}
