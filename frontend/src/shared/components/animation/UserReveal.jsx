import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import useUserInView from "../../hooks/useUserInView";
import "./userMotion.css";

const clamp = (value, min, max) => Math.min(Math.max(Number(value) || 0, min), max);

export default function UserReveal({
    as: Component = "div",
    children,
    className = "",
    delay = 0,
    distance = 30,
    duration = 600,
    once = true,
    rootMargin,
    style,
    threshold,
    ...props
}) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const { elementRef, isVisible } = useUserInView({
        disabled: prefersReducedMotion,
        once,
        rootMargin,
        threshold,
    });

    return (
        <Component
            ref={elementRef}
            className={`user-reveal ${isVisible ? "user-reveal--visible" : ""} ${className}`.trim()}
            style={{
                "--user-reveal-delay": `${clamp(delay, 0, 500)}ms`,
                "--user-reveal-distance": `${clamp(distance, 0, 50)}px`,
                "--user-reveal-duration": `${clamp(duration, 400, 800)}ms`,
                ...style,
            }}
            {...props}
        >
            {children}
        </Component>
    );
}
