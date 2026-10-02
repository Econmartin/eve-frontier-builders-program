"use client";

import { Fragment, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Form from "next/form";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AskEye,
  Field,
  isQuestion,
  Menu,
  MenuLink,
  MenuSeparator,
  NavItem,
  NavList,
  Sheet,
  ThemeToggle,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import styles from "./top-bar.module.css";

type NavLink = { label: string; href: string };

type TopBarProps = {
  brand: NavLink;
  tabs: NavLink[];
  secondary?: (NavLink & { sub?: boolean })[];
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
  const fieldRef = useRef<HTMLInputElement>(null);
  const sheetFieldRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  /* Both fields share one eye state, as in the prototype: it thinks while a question is typed */
  const [asking, setAsking] = useState(false);
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
  useEffect(() => {
    if (fieldRef.current && document.activeElement !== fieldRef.current) fieldRef.current.value = query;
  }, [query]);

  const onQuery = useCallback((next: string) => {
    setQuery(next);
    setAsking(isQuestion(next));
  }, []);

  const onType = (event: { target: HTMLInputElement }) => setAsking(isQuestion(event.target.value));

  const isCurrent = (href: string) => trim(href) === trim(pathname);
  const name = search.name ?? "q";

  /* A parent and its children form a group, divided from the links on either side */
  const startsGroup = (i: number) =>
    i > 0 && !secondary[i].sub && Boolean(secondary[i - 1].sub || secondary[i + 1]?.sub);

  return (
    <header ref={headerRef} className={styles.header}>
      <Suspense fallback={null}>
        <SearchQuery path={search.action} name={name} onQuery={onQuery} />
      </Suspense>
      <div ref={innerRef} className={cn("container gutter", styles.inner)}>
        <Link ref={brandRef} className={styles.brand} href={brand.href}>
          {brand.label}
        </Link>

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
              {secondary.map((link, i) => (
                <Fragment key={link.href}>
                  {startsGroup(i) && <MenuSeparator />}
                  <MenuLink href={link.href} sub={link.sub} current={isCurrent(link.href)}>
                    {link.label}
                  </MenuLink>
                </Fragment>
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

        <Form ref={searchRef} className={styles.search} action={search.action} role="search">
          <Field
            ref={fieldRef}
            interlock
            start={<AskEye thinking={asking} />}
            onChange={onType}
            name={name}
            placeholder="Search, or ask"
            aria-label="Search, or ask the assistant"
            shortcut={narrow ? undefined : "/"}
            className={styles.field}
          />
        </Form>

        <div ref={rightRef} className={styles.right}>
          <ThemeToggle />
        </div>

        <div className={styles.compact}>
          <Sheet
            label="Menu"
            header={
              <Link className={styles.brand} href={brand.href}>
                {brand.label}
              </Link>
            }
            open={sheetOpen}
            onOpenChange={(open) => {
              setSheetOpen(open);
              if (!open) setFocusField(false);
            }}
            initialFocus={focusField ? sheetFieldRef : undefined}
          >
            <Form action={search.action} role="search" onSubmit={() => {
                setSheetOpen(false);
                setFocusField(false);
              }}>
              <Field
                ref={sheetFieldRef}
                start={<AskEye thinking={asking} />}
                onChange={onType}
                name={name}
                defaultValue={query}
                placeholder="Search, or ask"
                aria-label="Search, or ask the assistant"
              />
            </Form>
            <nav aria-label="Primary" className={styles.sheetTabs}>
              {tabs.map((tab) => (
                <NavItem key={tab.href} href={tab.href} first current={isCurrent(tab.href)}>
                  {tab.label}
                </NavItem>
              ))}
            </nav>
            {secondary.length > 0 && (
              <nav aria-label="Secondary" className={styles.secondary}>
                {secondary.map((link, i) => (
                  <Fragment key={link.href}>
                    {startsGroup(i) && <hr className={styles.rule} />}
                    <Link
                      href={link.href}
                      className={link.sub ? styles.sub : undefined}
                      aria-current={isCurrent(link.href) ? "page" : undefined}
                    >
                      {link.sub && <span className={styles.branch} aria-hidden="true" />}
                      {link.label}
                    </Link>
                  </Fragment>
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

const trim = (path: string) => path.replace(/\/+$/, "") || "/";

/* Reads the search query from the URL on the results page, so the fields show what was searched.
   Kept apart in its own Suspense: reading search params opts a static page out of prerendering
   up to the nearest boundary, and this way that's only this empty component, not the bar */
function SearchQuery({ path, name, onQuery }: { path: string; name: string; onQuery: (query: string) => void }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.get(name) ?? "";
  const onSearchPage = trim(pathname) === trim(path);

  useEffect(() => {
    if (onSearchPage) onQuery(query);
  }, [onSearchPage, query, onQuery]);

  return null;
}
