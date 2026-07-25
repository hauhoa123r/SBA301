import { useEffect, useRef, useState, type RefObject } from "react";

export interface UseUserInViewOptions {
  disabled?: boolean;
  once?: boolean;
  rootMargin?: string;
  threshold?: number | readonly number[];
}

export interface UseUserInViewResult<TElement extends Element> {
  elementRef: RefObject<TElement | null>;
  isVisible: boolean;
}

export const useUserInView = <TElement extends Element = HTMLElement>({
  disabled = false,
  once = true,
  rootMargin = "0px 0px -12% 0px",
  threshold = 0,
}: UseUserInViewOptions = {}): UseUserInViewResult<TElement> => {
  const elementRef = useRef<TElement>(null);
  const [isVisible, setIsVisible] = useState(disabled);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return undefined;

    if (typeof window.IntersectionObserver !== "function") {
      const frame = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    const normalizedThreshold = typeof threshold === "number"
      ? threshold
      : Array.from(threshold);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { rootMargin, threshold: normalizedThreshold },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [disabled, once, rootMargin, threshold]);

  return { elementRef, isVisible: disabled || isVisible };
};

export default useUserInView;
