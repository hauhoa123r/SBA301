import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";

export const adminMotion = {
  hover: 160, control: 180, layout: 240, page: 220, dialog: 200, chart: 520, count: 360,
  enter: "cubic-bezier(0.16, 1, 0.3, 1)", layoutEase: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

const preference = "(prefers-reduced-motion: reduce)";
function subscribe(callback: () => void) {
  const media = window.matchMedia(preference);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(preference).matches, () => true);
}

// Content keys describe data, not object identity: hover/rerenders/refetching the
// same values must never replay chart or page entrance effects.
export function useContentEntrance<T extends HTMLElement | SVGElement>(ref: RefObject<T | null>, contentKey: string, duration: number = adminMotion.page) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !contentKey || !ref.current?.animate) return;
    const animation = ref.current.animate([
      { opacity: .55, transform: "translateY(6px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { duration, easing: adminMotion.enter });
    // Release the finished effect/compositor layer; final styling lives in CSS.
    animation.onfinish = () => animation.cancel();
    return () => animation.cancel();
  }, [contentKey, duration, reduced, ref]);
}

// Only whole, non-financial counts interpolate. The accessible value and title
// always contain the final server value; visual intermediate values carry ≈.
// DOM updates are confined to this span, avoiding a React render every frame.
export function useCountUp(value: number | undefined, enabled: boolean, format: (n: number) => string) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef<number | undefined>(undefined);
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || value === undefined || !Number.isFinite(value)) return;
    const from = previous.current ?? 0;
    previous.current = value;
    node.textContent = format(value);
    if (!enabled || reduced || document.hidden || !Number.isSafeInteger(value) || value < 0 || from === value) return;
    let frame = 0; let start: number | undefined;
    const tick = (time: number) => {
      start ??= time;
      const progress = Math.min(1, (time - start) / adminMotion.count);
      const count = Math.round(from + (value - from) * (1 - (1 - progress) ** 3));
      node.textContent = progress < 1 ? `≈ ${format(count)}` : format(value);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); node.textContent = format(value); };
  }, [value, enabled, reduced, format]);
  return ref;
}
