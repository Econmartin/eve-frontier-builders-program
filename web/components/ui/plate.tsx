import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";
import styles from "./plate.module.css";

export type PlateCorners = "tl" | "tr" | "br" | "bl" | "tl-br" | "tr-bl";
export type PlateCut = "sm" | "md";

interface PlateOwnProps<T extends ElementType> {
  as?: T;
  corners?: PlateCorners;
  cut?: PlateCut;
  keyline?: CSSProperties["background"];
  fill?: CSSProperties["background"];
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export type PlateProps<T extends ElementType> = PlateOwnProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof PlateOwnProps<T>>;

/**
 * A plate: a keyline and fill clipped to one corner or a diagonal pair.
 *
 * @example
 * ```tsx
 * <Plate as="section" corners="tr-bl" cut="md" className="p-m">
 *   Card content
 * </Plate>
 * ```
 */
export function Plate<T extends ElementType = "div">(
  props: PlateProps<T>,
) {
  const {
    as,
    corners = "tr-bl",
    cut = "md",
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
      className={cn(styles.plate, styles[corners], styles[cut], className)}
      style={
        {
          ...style,
          ...(keyline ? { "--plate-keyline": keyline } : null),
          ...(fill ? { "--plate-fill": fill } : null),
        } as CSSProperties
      }
    >
      {children}
    </Component>
  );
}
