"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Icon } from "./icon";
import { NavItemControl, NavSlot } from "./nav-item";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import styles from "./menu.module.css";

export type MenuProps = {
  label: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * A navigation dropdown whose trigger is a `NavItem`, so it interlocks with
 * the items around it in a `NavList`. The popup portals to the body, so the
 * row's clip-path can't cut it off.
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
export function Menu({ label, defaultOpen, children }: MenuProps) {
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
      <BaseMenu.Root modal={false} defaultOpen={defaultOpen}>
        <BaseMenu.Trigger
          openOnHover
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

/** A link inside `Menu`; `sub` indents it under the link before, `current` marks the page. */
export function MenuLink({ sub = false, current = false, className, ...rest }: MenuLinkProps) {
  return (
    <BaseMenu.LinkItem
      closeOnClick
      {...rest}
      render={<Plate as="a" />}
      aria-current={current ? "page" : undefined}
      className={(state) =>
        cn(
          "block py-2.5 pr-5 text-step--1 leading-5 font-bold tracking-[0.06em] text-foreground uppercase no-underline outline-none",
          sub ? "pl-8" : "pl-4",
          styles.link,
          sub && styles.sub,
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

/** A divider between groups of `MenuLink`s. */
export function MenuSeparator() {
  return <BaseMenu.Separator className={cn("border-t border-line", styles.separator)} />;
}
