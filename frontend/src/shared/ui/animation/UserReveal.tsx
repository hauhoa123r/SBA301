import type { ElementType } from "react";

import { usePrefersReducedMotion, useUserInView } from "@/shared/hooks";

import type {
  MotionComponentProps,
  MotionStyle,
  PolymorphicProps,
} from "./polymorphic";
import "./userMotion.css";

interface UserRevealOwnProps extends MotionComponentProps {
  delay?: number;
  distance?: number;
  duration?: number;
  once?: boolean;
  rootMargin?: string;
  threshold?: number | readonly number[];
}

export type UserRevealProps<TElement extends ElementType = "div"> =
  PolymorphicProps<TElement, UserRevealOwnProps>;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(Number(value) || 0, minimum), maximum);

export const UserReveal = <TElement extends ElementType = "div">({
  as,
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
}: UserRevealProps<TElement>) => {
  const Component: ElementType = as ?? "div";
  const prefersReducedMotion = usePrefersReducedMotion();
  const { elementRef, isVisible } = useUserInView<HTMLElement>({
    disabled: prefersReducedMotion,
    once,
    rootMargin,
    threshold,
  });
  const motionStyle: MotionStyle = {
    "--user-reveal-delay": `${clamp(delay, 0, 500)}ms`,
    "--user-reveal-distance": `${clamp(distance, 0, 50)}px`,
    "--user-reveal-duration": `${clamp(duration, 400, 800)}ms`,
    ...style,
  };

  return (
    <Component
      ref={elementRef}
      className={`user-reveal ${isVisible ? "user-reveal--visible" : ""} ${className}`.trim()}
      style={motionStyle}
      {...props}
    >
      {children}
    </Component>
  );
};

export default UserReveal;
