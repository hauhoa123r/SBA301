import type { ElementType } from "react";

import type { MotionComponentProps, PolymorphicProps } from "./polymorphic";
import "./userMotion.css";

export type AnimatedCardProps<TElement extends ElementType = "div"> =
  PolymorphicProps<TElement, MotionComponentProps>;

export const AnimatedCard = <TElement extends ElementType = "div">({
  as,
  children,
  className = "",
  ...props
}: AnimatedCardProps<TElement>) => {
  const Component: ElementType = as ?? "div";

  return (
    <Component
      className={`user-interactive-card ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
};

export default AnimatedCard;
