import { Children, isValidElement, type ElementType } from "react";

import { usePrefersReducedMotion, useUserInView } from "@/shared/hooks";

import type {
  MotionComponentProps,
  MotionStyle,
  PolymorphicProps,
} from "./polymorphic";
import "./userMotion.css";

interface UserStaggerOwnProps extends MotionComponentProps {
  distance?: number;
  duration?: number;
  itemAs?: ElementType;
  itemClassName?: string;
  once?: boolean;
  rootMargin?: string;
  step?: number;
  threshold?: number | readonly number[];
}

export type UserStaggerProps<TElement extends ElementType = "div"> =
  PolymorphicProps<TElement, UserStaggerOwnProps>;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(Number(value) || 0, minimum), maximum);

export const UserStagger = <TElement extends ElementType = "div">({
  as,
  children,
  className = "",
  distance = 30,
  duration = 600,
  itemAs,
  itemClassName = "",
  once = true,
  rootMargin = "0px 0px -12% 0px",
  step = 70,
  style,
  threshold = 0,
  ...props
}: UserStaggerProps<TElement>) => {
  const Component: ElementType = as ?? "div";
  const ItemComponent: ElementType = itemAs ?? "div";
  const prefersReducedMotion = usePrefersReducedMotion();
  const { elementRef, isVisible } = useUserInView<HTMLElement>({
    disabled: prefersReducedMotion,
    once,
    rootMargin,
    threshold,
  });
  const staggerStep = clamp(step, 0, 100);
  const motionStyle: MotionStyle = {
    "--user-reveal-distance": `${clamp(distance, 0, 50)}px`,
    "--user-reveal-duration": `${clamp(duration, 400, 800)}ms`,
    ...style,
  };

  return (
    <Component
      ref={elementRef}
      className={`user-stagger ${isVisible ? "user-stagger--visible" : ""} ${className}`.trim()}
      style={motionStyle}
      {...props}
    >
      {Children.toArray(children).map((child, index) => {
        const key = isValidElement(child) ? (child.key ?? index) : index;
        const itemStyle: MotionStyle = {
          "--user-stagger-delay": `${Math.min(index * staggerStep, 420)}ms`,
        };

        return (
          <ItemComponent
            key={key}
            className={`user-stagger-item ${itemClassName}`.trim()}
            style={itemStyle}
          >
            {child}
          </ItemComponent>
        );
      })}
    </Component>
  );
};

export default UserStagger;
