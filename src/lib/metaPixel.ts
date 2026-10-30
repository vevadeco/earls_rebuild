export const META_PIXEL_ID = "1119733070518402";

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

export function trackMeta(event: "PageView" | "Lead") {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }
  window.fbq("track", event);
}
