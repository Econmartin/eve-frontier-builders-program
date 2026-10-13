"use client";

import type { ComponentPropsWithRef, MouseEvent } from "react";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import styles from "./button.module.css";

export type ButtonProps = {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
} & Omit<ComponentPropsWithRef<"button">, "style">;

/**
 * An animated action button built on `Plate`.
 *
 * `className` styles the button itself. The focus ring wraps it in a
 * content-sized element, so layout utilities such as `w-full` belong on a
 * parent that stretches its children.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Start building
 * </Button>
 *
 * <Button variant="secondary" loading>
 *   Saving
 * </Button>
 * ```
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  // Disabled wins over loading.
  const busy = loading && !disabled;

  // Keep busy buttons focusable while preventing activation.
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (busy) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    // Render the focus ring outside the clipped button plate.
    <Plate as="span" className={cn(styles.focus, size === "sm" && styles.sm)}>
      <Plate
        as="button"
        {...rest}
        type={type}
        className={cn(styles.button, styles[variant], styles[size], className)}
        onClick={handleClick}
        disabled={disabled}
        aria-disabled={busy || undefined}
        aria-busy={busy || undefined}
      >
        <span className={styles.label}>{children}</span>
        {busy && (
          <>
            <span className="sr-only">, loading</span>
            <span className={styles.cells} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </>
        )}
      </Plate>
    </Plate>
  );
}
