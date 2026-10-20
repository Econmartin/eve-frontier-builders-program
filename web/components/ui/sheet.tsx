"use client";

import { useEffect, useRef, useState, type ComponentProps, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import styles from "./sheet.module.css";

export type SheetProps = {
  label: string;
  header?: ReactNode;
  /** Controls the sheet; leave unset to let it manage itself. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Where focus lands on opening; the close button by default. */
  initialFocus?: ComponentProps<typeof Dialog.Popup>["initialFocus"];
  children: ReactNode;
};

/**
 * A full-width navigation sheet that drops from the top of the screen.
 *
 * Its header row redraws the bar, with the close button where the trigger sat,
 * so the trigger's dots appear to turn into a cross.
 *
 * @example
 * ```tsx
 * <Sheet label="Menu" header={<Brand />}>
 *   <NavLinks />
 * </Sheet>
 * ```
 */
export function Sheet({
  label,
  header,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  initialFocus,
  children,
}: SheetProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = openProp ?? openState;

  // The close button sits exactly over the trigger. As the sheet closes, the
  // trigger takes on whatever the close button shows, hovered or focused, so
  // the change happens under the panel and nothing shifts when it's revealed.
  // The browser marks hover a frame late, and the focus ring's thickness
  // animates, so otherwise the trigger would catch up after the panel goes.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [handoff, setHandoff] = useState({ hover: false, focus: false });

  useEffect(() => {
    if (!handoff.hover && !handoff.focus) return;
    // Hover goes when the pointer leaves the trigger's area; while the panel
    // is closing it's over the close button, so the check is by position
    const onPointerMove = (event: PointerEvent) => {
      const box = triggerRef.current?.getBoundingClientRect();
      const inside =
        box &&
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      if (!inside) setHandoff((state) => ({ ...state, hover: false }));
    };
    // Focus goes once focus lands anywhere but the trigger
    const onFocusIn = (event: FocusEvent) => {
      if (event.target !== triggerRef.current) setHandoff((state) => ({ ...state, focus: false }));
    };
    const onBlur = () => setHandoff((state) => ({ ...state, focus: false }));
    const trigger = triggerRef.current;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("focusin", onFocusIn);
    trigger?.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("focusin", onFocusIn);
      trigger?.removeEventListener("blur", onBlur);
    };
  }, [handoff.hover, handoff.focus]);

  // The same going in: opened from the keyboard, the close button mounts
  // already showing the focus ring rather than growing it once focused
  const [closeFocus, setCloseFocus] = useState(false);

  useEffect(() => {
    if (!closeFocus) return;
    const onFocusIn = (event: FocusEvent) => {
      if (event.target !== closeRef.current) setCloseFocus(false);
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [closeFocus]);

  const setOpen = (next: boolean) => {
    const close = closeRef.current;
    if (next) setCloseFocus(Boolean(triggerRef.current?.matches(":focus-visible")));
    else if (close) {
      setHandoff({ hover: close.matches(":hover"), focus: close.matches(":focus-visible") });
      setCloseFocus(false);
    }
    setOpenState(next);
    onOpenChange?.(next);
  };

  // Following a link leaves the sheet's page, so it closes behind it
  const closeOnLink = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("a[href]")) setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        ref={triggerRef}
        render={
          <DotsButton
            data-handoff={[handoff.hover && "hover", handoff.focus && "focus"].filter(Boolean).join(" ") || undefined}
          />
        }
        aria-label={label}
      >
        <Dots />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={cn("fixed inset-0 z-(--layer-scrim) bg-background/45", styles.backdrop)} />
        <Dialog.Popup
          className={cn("fixed inset-x-0 top-0 z-(--layer-scrim) max-h-dvh overflow-y-auto outline-none", styles.popup)}
          initialFocus={initialFocus ?? closeRef}
        >
          <Dialog.Title className="sr-only">{label}</Dialog.Title>
          <div className="mx-auto flex min-h-(--bar-height,64px) max-w-grid items-center justify-between gap-s bg-background px-s-l">
            {header}
            <Dialog.Close
              ref={closeRef}
              render={<DotsButton data-handoff={closeFocus ? "focus" : undefined} />}
              aria-label={`Close ${label.toLowerCase()}`}
            >
              <Dots cross />
            </Dialog.Close>
          </div>
          <div className={cn("grid border-b border-line bg-background", styles.body)}>
            <div className="min-h-0 overflow-hidden">
              <div className="mx-auto grid max-w-grid gap-s px-s-l pt-s pb-m" onClick={closeOnLink}>
                {children}
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* The trigger and the close: the small 12/4 octagon, 44px square */
function DotsButton(props: ComponentProps<"button">) {
  return (
    <Plate
      as="button"
      type="button"
      {...props}
      className={cn("grid size-11 flex-none cursor-pointer place-items-center text-foreground", styles.dots, props.className)}
    />
  );
}

/* 3 × 3 grid → cross with a centre dot. Corners run out to the tips, edges turn
   a quarter-step clockwise onto the inner diagonals. [grid x, grid y, cross x, cross y] */
const CELLS = [
  [3.5, 3.5, 1.5, 1.5], [10.5, 3.5, 15, 6], [17.5, 3.5, 19.5, 1.5],
  [3.5, 10.5, 6, 6], [10.5, 10.5, 10.5, 10.5], [17.5, 10.5, 15, 15],
  [3.5, 17.5, 1.5, 19.5], [10.5, 17.5, 6, 15], [17.5, 17.5, 19.5, 19.5],
].map(([gx, gy, xx, xy], i) => ({
  "--gx": `${gx}px`,
  "--gy": `${gy}px`,
  "--xx": `${xx}px`,
  "--xy": `${xy}px`,
  transitionDelay: `${i * 14}ms`,
}) as CSSProperties);

function Dots({ cross = false }: { cross?: boolean }) {
  return (
    <span className={cn("relative size-6", styles.grid, cross && styles.cross)} aria-hidden="true">
      {CELLS.map((style, i) => (
        <span key={i} className="absolute top-0 left-0 box-border size-[3px] border-[1.5px] border-current" style={style} />
      ))}
    </span>
  );
}
