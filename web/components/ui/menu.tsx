"use client";

import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Icon } from "./icon";
import { NavItemControl, NavSlot } from "./nav-item";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import { EXTERNAL, isExternal } from "@/lib/external";
import styles from "./menu.module.css";

export type MenuProps = {
  label: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * A navigation dropdown whose trigger is a `NavItem`, so it interlocks with
 * the items around it in a `NavList`. The popup portals to the body, so the
 * row's clip-path can't cut it off, and closes when the window's width
 * changes, since its contents and anchor move.
 *
 * @example
 * ```tsx
 * <NavList aria-label="Primary">
 *   <NavItem href="/pathways">Pathways</NavItem>
 *   <Menu label="More">
 *     <MenuLink href="/docs">Documentation</MenuLink>
 *     <MenuLink href="/glossary" sub>Glossary</MenuLink>
 *     <MenuSeparator />
 *     <MenuLink href="/about">About</MenuLink>
 *   </Menu>
 * </NavList>
 * ```
 */
export function Menu({ label, defaultOpen = false, children }: MenuProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!open) return;
    const width = window.innerWidth;
    // Width only: mobile browsers fire resize when their toolbar or keyboard shows
    const onResize = () => {
      if (window.innerWidth !== width) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  // Opening moves focus onto the first link, which the browser treats as
  // :focus-visible; the ring is kept for menus driven by the keyboard
  const [input, setInput] = useState<"pointer" | "keyboard">("pointer");
  const pointer = () => setInput("pointer");
  const keyboard = () => setInput("keyboard");

  return (
    // Listens on the slot, in the capture phase, so Base UI keeps its own
    // handlers and can't stop these; the portalled popup's events still pass
    // through here in React's tree
    <NavSlot onPointerEnter={pointer} onPointerDownCapture={pointer} onKeyDownCapture={keyboard}>
      <BaseMenu.Root modal={false} open={open} onOpenChange={setOpen}>
        {/* Opens at once on hover, like the nav's own hover states; the close
          delay lets the pointer cross the gap to the popup */}
        <BaseMenu.Trigger
          openOnHover
          delay={0}
          closeDelay={240}
          render={
            <NavItemControl
              as="button"
              className="group"
              indicator={
                <Icon
                  name="caret"
                  className={cn(
                    "size-2.5 text-muted transition-[rotate,color] duration-200 motion-reduce:transition-none",
                    "group-hover:text-foreground group-focus-visible:text-foreground",
                    "group-data-popup-open:rotate-180 group-data-popup-open:text-foreground",
                  )}
                />
              }
            >
              {label}
            </NavItemControl>
          }
        />
        <BaseMenu.Portal>
          <BaseMenu.Positioner className="z-(--layer-menu) outline-none" align="start" sideOffset={6}>
            <BaseMenu.Popup
              data-input={input}
              onPointerMove={pointer}
              render={<Plate className={cn("min-w-60 p-px outline-none", styles.popup)} />}
            >
              <Plate className={cn("grid", styles.list)}>{children}</Plate>
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </BaseMenu.Root>
    </NavSlot>
  );
}

export type MenuLinkProps = {
  sub?: boolean;
  current?: boolean;
} & ComponentProps<typeof BaseMenu.LinkItem>;

/**
 * A link inside `Menu`; `sub` indents it under the link before, `current`
 * marks the page. Links on the site go through Next's `Link`; links off it
 * open in a new tab.
 */
export function MenuLink({ sub = false, current = false, href, className, children, ...rest }: MenuLinkProps) {
  const external = href ? isExternal(href) : false;

  return (
    <BaseMenu.LinkItem
      closeOnClick
      {...rest}
      render={
        external ? <Plate as="a" href={href} {...EXTERNAL} /> : href ? <Plate as={Link} href={href} /> : <Plate as="a" />
      }
      aria-current={current ? "page" : undefined}
      className={(state) =>
        cn(
          "flex items-center gap-3 py-2.5 pr-5 text-sm leading-5 font-bold tracking-[0.06em] text-foreground uppercase no-underline outline-none",
          sub ? "pl-8" : "pl-4",
          styles.link,
          sub && styles.sub,
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {sub && <span className={styles.branch} aria-hidden="true" />}
      <span className={cn("h-2 w-1 flex-none", styles.lamp)} aria-hidden="true" />
      {children}
      {external && (
        <>
          <Icon name="external" className="size-2.5 text-muted" />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </BaseMenu.LinkItem>
  );
}

/** A divider between groups of `MenuLink`s. */
export function MenuSeparator() {
  return <BaseMenu.Separator className={cn("border-t border-line", styles.separator)} />;
}
