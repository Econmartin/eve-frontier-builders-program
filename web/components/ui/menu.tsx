"use client";

import type { ComponentProps, ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { NavItem } from "./nav-item";
import { Surface } from "./surface";
import { cn } from "@/lib/cn";
import styles from "./menu.module.css";

type MenuProps = {
  label: ReactNode;
  first?: boolean;
  children: ReactNode;
};

/**
 * A navigation dropdown whose trigger interlocks with `NavItem`s in a `NavList`.
 *
 * The popup portals to the body, so the bar's `clip-path` can't cut it off.
 *
 * @example
 * ```tsx
 * <NavList aria-label="Primary">
 *   <NavItem href="/" first>Learn</NavItem>
 *   <Menu label="More">
 *     <MenuLink href="/tools">Tools</MenuLink>
 *     <MenuSeparator />
 *     <MenuLink href="/changelog" sub>Changelog</MenuLink>
 *   </Menu>
 * </NavList>
 * ```
 */
export function Menu({ label, first = false, children }: MenuProps) {
  return (
    <BaseMenu.Root modal={false}>
      <BaseMenu.Trigger
        openOnHover
        closeDelay={240}
        render={
          <NavItem
            as="button"
            first={first}
            indicator={<span className={styles.caret} aria-hidden="true" />}
            className={styles.trigger}
          >
            {label}
          </NavItem>
        }
      />
      <BaseMenu.Portal>
        <BaseMenu.Positioner className={styles.positioner} align="start" sideOffset={6}>
          <BaseMenu.Popup
            onPointerMove={(event) => { event.currentTarget.dataset.input = "pointer"; }}
            onKeyDown={(event) => { event.currentTarget.dataset.input = "keyboard"; }}
            render={
              <Surface shape="card" fill="var(--color-background)" className={styles.popup} />
            }
          >
            <div className={styles.list}>{children}</div>
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

type MenuLinkProps = {
  sub?: boolean;
  current?: boolean;
} & ComponentProps<typeof BaseMenu.LinkItem>;

/** A link inside `Menu`; `sub` indents it under the link before, `current` marks the page. */
export function MenuLink({ sub = false, current = false, className, ...rest }: MenuLinkProps) {
  return (
    <BaseMenu.LinkItem
      closeOnClick
      {...rest}
      aria-current={current ? "page" : undefined}
      className={(state) =>
        cn(
          styles.link,
          sub && styles.sub,
          current && styles.current,
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

/** A divider between groups of `MenuLink`s. */
export function MenuSeparator() {
  return <BaseMenu.Separator className={styles.separator} />;
}
