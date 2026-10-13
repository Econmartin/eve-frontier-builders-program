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

export type PlateProps<T extends ElementType = "div"> = PlateOwnProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof PlateOwnProps<T>>;

/**
 * A plate: a keyline and fill clipped to one corner or a diagonal pair.
 *
 * The clip cuts off anything outside the polygon — outlines, box shadows and
 * overflowing children — so components draw focus inside the plate (a thicker
 * keyline) or wrap it. The keyline is painted under the fill, so a translucent
 * `fill` shows the keyline colour through it.
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
