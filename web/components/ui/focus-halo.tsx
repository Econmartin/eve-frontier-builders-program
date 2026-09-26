import type { ComponentPropsWithRef, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./focus-halo.module.css";

type FocusHaloProps = {
  shape: "diagonal" | "diagonal-small";
  children: ReactNode;
} & ComponentPropsWithRef<"span">;

export function FocusHalo({
  shape,
  className,
  style,
  children,
  ...rest
}: FocusHaloProps) {
  return (
    <span
      {...rest}
      className={cn(styles.halo, className)}
      style={
        {
          ...style,
          "--focus-clip": `var(--clip-${shape}-halo)`,
          "--focus-clip-inner": `var(--clip-${shape}-halo-inner)`,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}
