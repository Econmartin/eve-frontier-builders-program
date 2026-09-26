import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";

type SurfaceShape = "card" | "card-small" | "diagonal" | "diagonal-small";

interface SurfaceOwnProps<T extends ElementType> {
  as?: T;
  shape?: SurfaceShape;
  fill?: CSSProperties["background"];
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

type SurfaceProps<T extends ElementType> = SurfaceOwnProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof SurfaceOwnProps<T>>;

export function Surface<T extends ElementType = "div">(
  props: SurfaceProps<T>,
) {
  const {
    as,
    shape = "card",
    fill = "var(--color-card)",
    children,
    className,
    style,
    ...rest
  } = props;

  const Component: ElementType = as ?? "div";
  const clipPath = `var(--clip-${shape})`;

  return (
    <Component
      {...rest}
      className={cn("relative isolate bg-line", className)}
      style={{ ...style, clipPath }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-px block"
        style={{ clipPath, background: fill }}
      />
      <span className="relative block h-full">{children}</span>
    </Component>
  );
}
