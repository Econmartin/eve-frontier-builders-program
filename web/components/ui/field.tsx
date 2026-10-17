"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import styles from "./field.module.css";
import navStyles from "./nav-item.module.css";

export type FieldProps = {
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
 * `interlock` notches the left edge so the field can sit after a `NavList`.
 *
 * @example
 * ```tsx
 * <Field
 *   type="search"
 *   name="q"
 *   placeholder="Search"
 *   aria-label="Search"
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

  // Set the value natively so React's onChange still fires
  const clear = () => {
    const input = inputRef.current;
    if (!input) return;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setValue?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  };

  // Clicks on the frame's padding land in the input
  const focusInput = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    inputRef.current?.focus();
  };

  return (
    <Plate
      className={cn(
        "group flex min-h-[2.75rem] min-w-0 cursor-text items-center gap-2 pr-4 pl-(--field-inset) text-foreground",
        "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:text-muted",
        styles.field,
        interlock && [navStyles.notched, styles.linked],
        className,
      )}
      onMouseDown={focusInput}
    >
      {start}
      <input
        {...rest}
        ref={setRef}
        type={type}
        className={cn(
          "peer min-w-0 flex-1 appearance-none bg-transparent px-0.5 py-2 text-base outline-none",
          "placeholder:text-muted placeholder:opacity-100 disabled:cursor-not-allowed",
          styles.input,
        )}
        aria-keyshortcuts={shortcut}
      />
      <button
        type="button"
        className={cn(
          "grid size-6 flex-none cursor-pointer place-items-center text-accent",
          "peer-placeholder-shown:hidden peer-disabled:hidden",
          styles.clear,
        )}
        aria-label="Clear"
        onClick={clear}
      >
        <svg viewBox="0 0 10 10" className="size-2.5 fill-none stroke-current stroke-[1.6]" aria-hidden="true">
          <path d="M1 1l8 8M9 1L1 9" />
        </svg>
      </button>
      {shortcut && (
        <kbd
          className={cn(
            "flex-none border border-line px-[5px] py-px font-bold",
            "text-step--3 leading-[1.4] tracking-[0.08em] text-muted",
            /* The hint hides once it has done its job */
            "group-focus-within:hidden peer-disabled:hidden peer-[:not(:placeholder-shown)]:hidden",
          )}
          aria-hidden="true"
        >
          {shortcut}
        </kbd>
      )}
    </Plate>
  );
}
