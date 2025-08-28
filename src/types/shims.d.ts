declare module "lenis" {
  const Lenis: any;
  export default Lenis;
}

declare module "split-type" {
  const SplitType: any;
  export default SplitType;
}

declare module "@react-three/fiber";
declare module "@react-three/drei";
declare module "@react-three/postprocessing";

declare namespace JSX {
  // Temporary: allow unknown JSX tags (e.g., r3f lights) until types resolve
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// next-intl link type shim (package provides types, but TS may not resolve path under certain configs)
declare module 'next-intl/link' {
  import type { LinkProps } from 'next/link';
  import * as React from 'react';
  const Link: React.ForwardRefExoticComponent<LinkProps & { locale?: string | false }>;
  export default Link;
}
