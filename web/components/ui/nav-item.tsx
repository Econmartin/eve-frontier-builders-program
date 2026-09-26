import type { ComponentPropsWithRef, ReactNode } from "react";
import { Surface } from "./surface";
import { cn } from "@/lib/cn";
import styles from "./nav-item.module.css";

type NavItemProps = {
  first?: boolean;
  current?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithRef<"a">, "style">;

/**
 * An interlocking navigation link intended for use inside `NavList`.
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
  first = false,
  current = false,
  className,
  children,
  ...rest
}: NavItemProps) {
  return (
    <Surface
      as="a"
      {...rest}
      shape={first ? "diagonal" : "interlock"}
      fill={current ? "var(--color-card)" : "var(--color-background)"}
      className={cn(styles.item, !first && styles.linked, className)}
      aria-current={current ? "page" : undefined}
    >
      <span className={styles.lamp} aria-hidden="true" />
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
