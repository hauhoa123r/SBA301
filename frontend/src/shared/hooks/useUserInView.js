import { useEffect, useRef, useState } from "react";

export default function useUserInView({
    disabled = false,
    once = true,
    rootMargin = "0px 0px -12% 0px",
    threshold = 0,
} = {}) {
    const elementRef = useRef(null);
    const [isVisible, setIsVisible] = useState(disabled);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || disabled) return undefined;

        if (typeof window.IntersectionObserver !== "function") {
            const frame = window.requestAnimationFrame(() => setIsVisible(true));
            return () => window.cancelAnimationFrame(frame);
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.unobserve(entry.target);
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { rootMargin, threshold },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [disabled, once, rootMargin, threshold]);

    return { elementRef, isVisible: disabled || isVisible };
}
