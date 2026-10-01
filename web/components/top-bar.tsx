"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Field,
  Menu,
  MenuLink,
  MenuSeparator,
  NavItem,
  NavList,
  Sheet,
  ThemeToggle,
} from "@/components/ui";
import styles from "./top-bar.module.css";

type Link = { label: string; href: string };

type TopBarProps = {
  brand: Link;
  tabs: Link[];
  secondary?: (Link & { sub?: boolean })[];
  search?: { action: string; name?: string };
};

const NARROW = "(width < 768px)";
const OVERLAP = 10;
const EDITABLE = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

/**
 * The site's top bar. Tabs that don't fit fold into More in order; under 768px
 * everything moves into the Sheet.
 *
 * @example
 * ```tsx
 * <TopBar
 *   brand={{ label: "EF-B", href: "/" }}
 *   tabs={[{ label: "Pathways", href: "/pathways" }, { label: "Courses", href: "/courses" }]}
 *   secondary={[{ label: "Glossary", href: "/glossary" }]}
 * />
 * ```
 */
export function TopBar({
  brand,
  tabs,
  secondary = [],
  search = { action: "/search" },
}: TopBarProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(tabs.length);
  const [narrow, setNarrow] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const measureRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const sheetFieldRef = useRef<HTMLInputElement>(null);
  const [focusField, setFocusField] = useState(false);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const inner = innerRef.current;
    const measure = measureRef.current;
    if (!header || !inner || !measure) return;

    const layout = () => {
      const isNarrow = matchMedia(NARROW).matches;
      setNarrow(isNarrow);
      if (isNarrow) return;
      setSheetOpen(false);

      const cs = getComputedStyle(inner);
      const gap = parseFloat(cs.columnGap) || 0;
      const room = inner.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const brandWidth = brandRef.current?.getBoundingClientRect().width ?? 0;
      const rightWidth = rightRef.current?.getBoundingClientRect().width ?? 0;
      const fieldMin = searchRef.current ? parseFloat(getComputedStyle(searchRef.current).minWidth) || 0 : 0;

      const items = [...measure.children];
      const more = items.pop();
      const moreWidth = more?.getBoundingClientRect().width ?? 0;
      const start = measure.getBoundingClientRect().left;

      // tabs + More, less the search field's tuck under More and the three gaps
      const budget = room - brandWidth - rightWidth - fieldMin - 2 * gap + 2 * OVERLAP - moreWidth - 2;
      const fits = items.filter((item) => item.getBoundingClientRect().right - start <= budget).length;
      setVisible(fits);
    };

    const observer = new ResizeObserver(layout);
    observer.observe(header);
    document.fonts?.ready.then(layout);
    return () => observer.disconnect();
  }, [tabs.length]);

  useEffect(() => {
    if (!narrow) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if ((event.target as Element | null)?.closest?.(EDITABLE)) return;
      event.preventDefault();
      setFocusField(true);
      setSheetOpen(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [narrow]);

  const shown = tabs.slice(0, visible);
  const hidden = tabs.slice(visible);
  const hasMore = hidden.length > 0 || secondary.length > 0;
  const isCurrent = (href: string) => href === pathname;
  const name = search.name ?? "q";

  return (
    <header ref={headerRef} className={styles.header}>
      <div ref={innerRef} className={styles.inner}>
        <a ref={brandRef} className={styles.brand} href={brand.href}>
          {brand.label}
        </a>

        <NavList aria-label="Primary" className={styles.tabs}>
          {shown.map((tab, i) => (
            <NavItem key={tab.href} href={tab.href} first={i === 0} current={isCurrent(tab.href)}>
              {tab.label}
            </NavItem>
          ))}
          {hasMore && (
            <Menu label="More" first={shown.length === 0}>
              {hidden.map((tab) => (
                <MenuLink key={tab.href} href={tab.href} current={isCurrent(tab.href)}>
                  {tab.label}
                </MenuLink>
              ))}
              {hidden.length > 0 && secondary.length > 0 && <MenuSeparator />}
              {secondary.map((link) => (
                <MenuLink key={link.href} href={link.href} sub={link.sub} current={isCurrent(link.href)}>
                  {link.label}
                </MenuLink>
              ))}
            </Menu>
          )}
        </NavList>

        <NavList ref={measureRef} className={styles.measure} aria-hidden="true" inert>
          {tabs.map((tab, i) => (
            <NavItem key={tab.href} href={tab.href} first={i === 0}>
              {tab.label}
            </NavItem>
          ))}
          <NavItem as="button" indicator={<span className={styles.caretSlot} />}>
            More
          </NavItem>
        </NavList>

        <form ref={searchRef} className={styles.search} action={search.action} method="get" role="search">
          <Field
            interlock
            name={name}
            placeholder="Search, or ask"
            aria-label="Search, or ask the assistant"
            shortcut={narrow ? undefined : "/"}
            className={styles.field}
          />
        </form>

        <div ref={rightRef} className={styles.right}>
          <ThemeToggle />
        </div>

        <div className={styles.compact}>
          <Sheet
            label="Menu"
            header={
              <a className={styles.brand} href={brand.href}>
                {brand.label}
              </a>
            }
            open={sheetOpen}
            onOpenChange={(open) => {
              setSheetOpen(open);
              if (!open) setFocusField(false);
            }}
            initialFocus={focusField ? sheetFieldRef : undefined}
          >
            <form action={search.action} method="get" role="search">
              <Field ref={sheetFieldRef} name={name} placeholder="Search, or ask" aria-label="Search, or ask the assistant" />
            </form>
            <nav aria-label="Primary" className={styles.sheetTabs}>
              {tabs.map((tab) => (
                <NavItem key={tab.href} href={tab.href} first current={isCurrent(tab.href)}>
                  {tab.label}
                </NavItem>
              ))}
            </nav>
            {secondary.length > 0 && (
              <nav aria-label="Secondary" className={styles.secondary}>
                {secondary.map((link) => (
                  <a key={link.href} href={link.href} aria-current={isCurrent(link.href) ? "page" : undefined}>
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
            <div className={styles.foot}>
              <ThemeToggle />
            </div>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
