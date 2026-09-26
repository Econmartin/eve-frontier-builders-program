"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Surface } from "./surface";
import { cn } from "@/lib/cn";
import styles from "./field.module.css";

type FieldProps = {
  placeholder: string;
  interlock?: boolean;
  shortcut?: string;
  start?: ReactNode;
} & Omit<ComponentPropsWithRef<"input">, "style" | "placeholder">;

const EDITABLE = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

/**
 * A single-line text field with a clear button and an optional keyboard shortcut.
 *
 * `placeholder` is required: the clear button hides via `:placeholder-shown`.
 *
 * @example
 * ```tsx
 * <Field
 *   type="search"
 *   name="q"
 *   placeholder="Search, or ask"
 *   aria-label="Search, or ask the assistant"
 *   shortcut="/"
 * />
 * ```
 */
export function Field({
  interlock = false,
  shortcut,
  start,
  type = "search",
  className,
  ref,
  ...rest
}: FieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const setRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      const cleanup = typeof ref === "function" ? ref(node) : undefined;
      if (ref && typeof ref !== "function") ref.current = node;
      return () => {
        inputRef.current = null;
        if (typeof cleanup === "function") cleanup();
        else if (typeof ref === "function") ref(null);
        else if (ref) ref.current = null;
      };
    },
    [ref],
  );

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== shortcut || event.metaKey || event.ctrlKey || event.altKey) return;
      if ((event.target as Element | null)?.closest?.(EDITABLE)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut]);

  const clear = () => {
    const input = inputRef.current;
    if (!input) return;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setValue?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  };

  const focusInput = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    inputRef.current?.focus();
  };

  return (
    <Surface
      shape={interlock ? "interlock" : "diagonal"}
      className={cn(styles.field, interlock && styles.linked, className)}
      onMouseDown={focusInput}
    >
      {start}
      <input
        {...rest}
        ref={setRef}
        type={type}
        className={styles.input}
        aria-keyshortcuts={shortcut}
      />
      <button type="button" className={styles.clear} aria-label="Clear" onClick={clear}>
        <svg viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1 1l8 8M9 1L1 9" />
        </svg>
      </button>
      {shortcut && (
        <kbd className={styles.kbd} aria-hidden="true">
          {shortcut}
        </kbd>
      )}
    </Surface>
  );
}
