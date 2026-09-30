"use client";

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Surface } from "./surface";
import styles from "./sheet.module.css";

type SheetProps = {
  label: string;
  header?: ReactNode;
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
export function Sheet({ label, header, children }: SheetProps) {
  const [open, setOpen] = useState(false);

  const closeOnLink = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("a[href]")) setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={<Surface as="button" shape="diagonal-small" className={styles.dots} />}
        aria-label={label}
      >
        <Dots />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup}>
          <Dialog.Title className={styles.title}>{label}</Dialog.Title>
          <div className={styles.bar}>
            {header}
            <Dialog.Close
              render={<Surface as="button" shape="diagonal-small" className={styles.dots} />}
              aria-label={`Close ${label.toLowerCase()}`}
            >
              <Dots cross />
            </Dialog.Close>
          </div>
          <div className={styles.body}>
            <div className={styles.clip}>
              <div className={styles.content} onClick={closeOnLink}>
                {children}
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* 3 × 3 grid → cross with a centre dot. Corners run out to the tips, edges turn
   a quarter-step clockwise onto the inner diagonals. [grid x, grid y, cross x, cross y] */
const CELLS = [
  [3.5, 3.5, 1.5, 1.5], [10.5, 3.5, 15, 6], [17.5, 3.5, 19.5, 1.5],
  [3.5, 10.5, 6, 6], [10.5, 10.5, 10.5, 10.5], [17.5, 10.5, 15, 15],
  [3.5, 17.5, 1.5, 19.5], [10.5, 17.5, 6, 15], [17.5, 17.5, 19.5, 19.5],
].map(([gx, gy, xx, xy]) => ({ gx, gy, xx, xy }));

function Dots({ cross = false }: { cross?: boolean }) {
  return (
    <span className={cross ? `${styles.grid} ${styles.cross}` : styles.grid} aria-hidden="true">
      {CELLS.map((cell, i) => (
        <i
          key={i}
          style={
            {
              "--gx": `${cell.gx}px`,
              "--gy": `${cell.gy}px`,
              "--xx": `${cell.xx}px`,
              "--xy": `${cell.xy}px`,
              transitionDelay: `${i * 14}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
