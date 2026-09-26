import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";
import styles from "./surface.module.css";

type SurfaceShape = "card" | "card-small" | "diagonal" | "diagonal-small";

interface SurfaceOwnProps<T extends ElementType> {
  as?: T;
  shape?: SurfaceShape;
  keyline?: CSSProperties["background"];
  fill?: CSSProperties["background"];
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

type SurfaceProps<T extends ElementType> = SurfaceOwnProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof SurfaceOwnProps<T>>;

/**
 * A clipped surface with a configurable keyline and fill.
 *
 * @example
 * ```tsx
 * <Surface
 *   as="section"
 *   shape="card"
 *   fill="var(--color-card)"
 *   className="p-m"
 * >
 *   Card content
 * </Surface>
 * ```
 */

export function Surface<T extends ElementType = "div">(
  props: SurfaceProps<T>,
) {
  const {
    as,
    shape = "card",
    keyline,
    fill,
    children,
    className,
    style,
    ...rest
  } = props;

  const Component: ElementType = as ?? "div";

  return (
    <Component
      {...rest}
      className={cn(styles.surface, className)}
      style={
        {
          ...style,
          "--surface-clip": `var(--clip-${shape})`,
          ...(keyline ? { "--surface-keyline": keyline } : null),
          ...(fill ? { "--surface-fill": fill } : null),
        } as CSSProperties
      }
    >
      {children}
    </Component>
  );
}
