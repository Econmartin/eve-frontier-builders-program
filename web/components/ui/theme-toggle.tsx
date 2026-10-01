"use client";

import { useSyncExternalStore, type ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";
import styles from "./theme-toggle.module.css";

type Theme = "light" | "dark";

const DARK = "(prefers-color-scheme: dark)";

function readTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return matchMedia(DARK).matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const media = matchMedia(DARK);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

/**
 * Switches between light and dark themes and remembers the choice.
 *
 * The root layout applies a saved choice before first paint.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */
export function ThemeToggle({ className, ...rest }: Omit<ComponentPropsWithRef<"button">, "onClick">) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <button
      type="button"
      {...rest}
      className={cn(styles.toggle, className)}
      aria-label={theme ? `Switch to ${next} theme` : "Switch theme"}
      onClick={toggle}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 3a7 7 0 0 1 0 14z" />
      </svg>
    </button>
  );
}
