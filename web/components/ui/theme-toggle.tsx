"use client";

import { useEffect, useRef, useSyncExternalStore, type ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";
import { mountEclipse } from "./eclipse";

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

export type ThemeToggleProps = Omit<ComponentPropsWithRef<"button">, "onClick" | "ref" | "children">;

/**
 * Switches between light and dark themes and remembers the choice.
 *
 * The root layout applies a saved choice before first paint. The mark is the
 * Eclipse: a sun in light, crossed by an ink body in dark, lit on hover and focus.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */
export function ThemeToggle({ className, ...rest }: ThemeToggleProps) {
  // Null on the server, so the label and mark settle once the page's theme is known
  const theme = useSyncExternalStore(subscribe, readTheme, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eclipseRef = useRef<ReturnType<typeof mountEclipse> | null>(null);
  const painted = useRef(false);

  useEffect(() => {
    if (!buttonRef.current || !canvasRef.current) return;
    const eclipse = mountEclipse(canvasRef.current, buttonRef.current);
    eclipseRef.current = eclipse;
    return () => {
      eclipse.destroy();
      eclipseRef.current = null;
      painted.current = false;
    };
  }, []);

  // The first paint is instant, so a page never loads mid-eclipse
  useEffect(() => {
    if (!theme) return;
    eclipseRef.current?.set(theme === "dark", !painted.current);
    painted.current = true;
  }, [theme]);

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      {...rest}
      className={cn(
        "grid size-10 flex-none cursor-pointer place-items-center text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-foreground",
        className,
      )}
      aria-label={theme ? `Switch to ${next} theme` : "Switch theme"}
      onClick={toggle}
    >
      <canvas ref={canvasRef} className="block size-10" aria-hidden="true" />
    </button>
  );
}
