import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

export interface MotionComponentProps {
  children?: ReactNode;
  className?: string;
  style?: MotionStyle;
}

export type MotionStyle = CSSProperties & {
  [property: `--${string}`]: string | number | undefined;
};

export type PolymorphicProps<
  TElement extends ElementType,
  TOwnProps extends object,
> = TOwnProps & {
  as?: TElement;
} & Omit<ComponentPropsWithoutRef<TElement>, keyof TOwnProps | "as">;
