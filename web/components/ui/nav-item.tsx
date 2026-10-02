import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";
import Link from "next/link";
import { Surface } from "./surface";
import { cn } from "@/lib/cn";
import styles from "./nav-item.module.css";

type NavItemOwnProps = {
  first?: boolean;
  current?: boolean;
  indicator?: ReactNode;
  children: ReactNode;
};

type NavItemProps = NavItemOwnProps &
  (
    | ({ as?: "a" } & Omit<ComponentPropsWithRef<"a">, "style">)
    | ({ as: "button" } & Omit<ComponentPropsWithRef<"button">, "style">)
  );

/**
 * An interlocking navigation link intended for use inside `NavList`.
 *
 * Links go through Next's `Link`. Renders a button with `as="button"`;
 * `indicator` replaces the lamp.
 *
 * @example
 * ```tsx
 * <NavList aria-label="Primary">
 *   <NavItem href="/" first>Learn</NavItem>
 *   <NavItem href="/build" current>Build</NavItem>
 * </NavList>
 * ```
 */
export function NavItem({
  as = "a",
  first = false,
  current = false,
  indicator,
  className,
  children,
  ...rest
}: NavItemProps) {
  const Component: ElementType = as === "button" ? "button" : "href" in rest && rest.href ? Link : "a";

  return (
    <Surface
      as={Component}
      {...rest}
      shape={first ? "diagonal" : "interlock"}
      fill={current ? "var(--color-card)" : "var(--color-background)"}
      className={cn(styles.item, !first && styles.linked, className)}
      aria-current={current ? "page" : undefined}
    >
      {indicator ?? <span className={styles.lamp} aria-hidden="true" />}
      {children}
    </Surface>
  );
}

/** A navigation row that controls interlock spacing and stacking. */
export function NavList({
  children,
  className,
  ...rest
}: ComponentPropsWithRef<"nav">) {
  return (
    <nav {...rest} className={cn(styles.list, className)}>
      {children}
    </nav>
  );
}
