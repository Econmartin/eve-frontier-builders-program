import type { ComponentPropsWithRef, MouseEvent } from "react";
import { Surface } from "./surface";
import { cn } from "@/lib/cn";
import styles from "./button.module.css";

type ButtonProps = {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
} & Omit<ComponentPropsWithRef<"button">, "style">;

/**
 * An animated action button built on `Surface`.
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
  const inert = disabled || loading;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <Surface
      as="button"
      {...rest}
      type={type}
      shape={size === "sm" ? "diagonal-small" : "diagonal"}
      keyline={
        loading
          ? "conic-gradient(from var(--ang), var(--sweepcol) 0 80deg, var(--edge) 80deg 360deg)"
          : inert
            ? "var(--color-line)"
            : "conic-gradient(from -90deg, var(--sweepcol) 0 var(--sweep), var(--edge) var(--sweep) 360deg)"
      }
      fill={
        inert
          ? "repeating-linear-gradient(-45deg, var(--color-line) 0 1px, transparent 1px 6px), var(--color-background)"
          : "var(--fill, var(--color-accent))"
      }
      className={cn(styles.button, styles[variant], styles[size], className)}
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
    >
      {children}
    </Surface>
  );
}
