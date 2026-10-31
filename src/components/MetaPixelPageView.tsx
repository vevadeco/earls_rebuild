"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { trackMeta } from "@/lib/metaPixel";

export function MetaPixelPageView() {
  const pathname = usePathname();
  const skippedInitial = useRef(false);

  useEffect(() => {
    // The base pixel snippet already records the first PageView.
    if (!skippedInitial.current) {
      skippedInitial.current = true;
      return;
    }
    trackMeta("PageView");
  }, [pathname]);

  return null;
}
