import { Children } from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import useUserInView from "../../hooks/useUserInView";
import "./userMotion.css";

const clamp = (value, min, max) => Math.min(Math.max(Number(value) || 0, min), max);

export default function UserStagger({
    as: Component = "div",
    children,
    className = "",
    distance = 30,
    duration = 600,
    itemAs: ItemComponent = "div",
    itemClassName = "",
    once = true,
    rootMargin = "0px 0px -12% 0px",
    step = 70,
    style,
    threshold = 0,
    ...props
}) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const { elementRef, isVisible } = useUserInView({
        disabled: prefersReducedMotion,
        once,
        rootMargin,
        threshold,
    });
    const staggerStep = clamp(step, 0, 100);

    return (
        <Component
            ref={elementRef}
            className={`user-stagger ${isVisible ? "user-stagger--visible" : ""} ${className}`.trim()}
            style={{
                "--user-reveal-distance": `${clamp(distance, 0, 50)}px`,
                "--user-reveal-duration": `${clamp(duration, 400, 800)}ms`,
                ...style,
            }}
            {...props}
        >
            {Children.toArray(children).map((child, index) => (
                <ItemComponent
                    key={child.key ?? index}
                    className={`user-stagger-item ${itemClassName}`.trim()}
                    style={{ "--user-stagger-delay": `${Math.min(index * staggerStep, 420)}ms` }}
                >
                    {child}
                </ItemComponent>
            ))}
        </Component>
    );
}
