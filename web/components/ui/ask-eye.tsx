"use client";

import { useEffect, useRef, type ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";
import { mountEye, type EyeState } from "./eye";
import styles from "./ask-eye.module.css";

type AskEyeProps = { thinking?: boolean } & Omit<ComponentPropsWithRef<"button">, "children" | "type">;

/**
 * The search field's submit button, drawn as the assistant's eye. It blinks at
 * rest and thinks while a question is typed.
 *
 * @example
 * ```tsx
 * <Field start={<AskEye thinking={isQuestion(value)} />} … />
 * ```
 */
export function AskEye({ thinking = false, className, ...rest }: AskEyeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<EyeState>("idle");
  const eyeRef = useRef<ReturnType<typeof mountEye> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const eye = mountEye(canvasRef.current, () => stateRef.current);
    eyeRef.current = eye;
    return () => {
      eye.destroy();
      eyeRef.current = null;
    };
  }, []);

  useEffect(() => {
    stateRef.current = thinking ? "think" : "idle";
    eyeRef.current?.redraw();
  }, [thinking]);

  return (
    <button type="submit" aria-label="Search, or ask" {...rest} className={cn(styles.eye, className)}>
      <canvas ref={canvasRef} width={60} height={60} aria-hidden="true" />
    </button>
  );
}

/** A question rather than a search: ends with "?" or runs to more than three words. */
export const isQuestion = (text: string) => /\?\s*$/.test(text) || text.trim().split(/\s+/).length > 3;
