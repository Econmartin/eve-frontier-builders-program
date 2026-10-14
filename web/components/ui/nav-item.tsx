import type { ComponentPropsWithRef, ReactNode } from "react";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import styles from "./nav-item.module.css";

export type NavItemProps = {
  current?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithRef<"a">, "style">;

export type NavListProps = ComponentPropsWithRef<"nav">;

/**
 * An interlocking navigation link for use inside `NavList`. The first item
 * takes the full octagon and each following item notches into the one
 * before it.
 *
 * @example
 * ```tsx
 * <NavList aria-label="Primary">
 *   <NavItem href="/">Learn</NavItem>
 *   <NavItem href="/build" current>Build</NavItem>
 * </NavList>
 * ```
 */
export function NavItem({ current = false, className, children, ...rest }: NavItemProps) {
  return (
    <li className={styles.slot}>
      <Plate
        as="a"
        {...rest}
        className={cn(
          "inline-flex min-h-[2.75rem] items-center gap-2xs py-2xs pr-m pl-(--nav-inset) whitespace-nowrap",
          "font-heading text-step-0 leading-none font-bold tracking-[0.02em] text-foreground",
          styles.item,
          className,
        )}
        aria-current={current ? "page" : undefined}
      >
        <span className={cn("h-3 w-1 flex-none", styles.lamp)} aria-hidden="true" />
        {children}
      </Plate>
    </li>
  );
}

/** A navigation row that controls the interlock spacing. */
export function NavList({ children, className, ...rest }: NavListProps) {
  return (
    <nav {...rest} className={className}>
      <ul role="list" className={cn("flex items-center", styles.list)}>{children}</ul>
    </nav>
  );
}
