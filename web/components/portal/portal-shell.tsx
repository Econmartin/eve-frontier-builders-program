"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { PortalPillar } from "@/lib/content/load";
import { cn } from "@/lib/cn";
import { minutesOf, useDone } from "./progress";

const idx = "font-heading text-step--2 font-bold tracking-[0.08em] text-muted uppercase";

export type PortalShellProps = {
  pillars: PortalPillar[];
  current: string;
  outline: ReactNode;
  children: ReactNode;
};

/**
 * The lesson player: an app bar over three columns that scroll on their own,
 * the syllabus, the lesson and an outline. Either rail folds away; folding sets
 * its column to zero so the grid keeps its order. Below lg the page scrolls
 * normally and the rails open as sheets from a bottom bar.
 */
export function PortalShell({ pillars, current, outline, children }: PortalShellProps) {
  const [rail, setRail] = useState(true);
  const [side, setSide] = useState(true);
  const [sheet, setSheet] = useState<"rail" | "side" | null>(null);
  const done = useDone();

  const pillar = pillars.find((p) => p.file === current || p.modules.some((m) => m.file === current))!;
  const index = pillar.modules.findIndex((m) => m.file === current);

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:min-h-0">
      <header className="sticky top-0 z-(--layer-sticky) flex h-(--bar-height) flex-none items-center gap-x-s border-b border-line bg-background px-s">
        <Link href="/learn" className="flex flex-none items-center gap-2xs text-step--1 font-bold">
          <span aria-hidden="true">←</span>
          <span className="max-md:sr-only">All pillars</span>
        </Link>
        <p className="flex min-w-0 items-baseline gap-xs">
          <b className="truncate font-heading text-step-0">{pillar.title.replace(/^Pillar \d+ — /, "")}</b>
          <span className="whitespace-nowrap text-step--2 text-muted max-lg:hidden">Pillar {pillar.number}</span>
        </p>
        <div className="ml-auto flex flex-none items-center gap-xs">
          <span className={cn(idx, "max-md:hidden")}>
            {index >= 0 ? `Module ${index + 1} of ${pillar.modules.length}` : "Overview"}
          </span>
          <span aria-hidden="true" className="flex gap-0.5">
            {pillar.modules.map((m) => (
              <i
                key={m.file}
                className={cn(
                  "h-3.5 w-2",
                  m.file === current ? "bg-accent" : done.has(m.file) ? "bg-foreground" : "bg-line",
                )}
              />
            ))}
          </span>
        </div>
        <div className="flex flex-none gap-2xs max-lg:hidden">
          <FoldButton pressed={rail} onClick={() => setRail(!rail)}>Contents</FoldButton>
          <FoldButton pressed={side} onClick={() => setSide(!side)}>Outline</FoldButton>
        </div>
      </header>

      <div
        className={cn(
          "grow lg:grid lg:min-h-0",
          rail && side && "lg:grid-cols-[19rem_minmax(0,1fr)_18rem]",
          rail && !side && "lg:grid-cols-[19rem_minmax(0,1fr)_0]",
          !rail && side && "lg:grid-cols-[0_minmax(0,1fr)_18rem]",
          !rail && !side && "lg:grid-cols-[0_minmax(0,1fr)_0]",
        )}
      >
        <div
          className={cn(
            "overflow-y-auto overscroll-contain border-line bg-card lg:border-r",
            !rail && "lg:invisible lg:border-r-0",
            sheet === "rail" ? "max-lg:fixed max-lg:inset-x-0 max-lg:top-[42%] max-lg:bottom-13 max-lg:z-(--layer-scrim) max-lg:border-t" : "max-lg:hidden",
          )}
        >
          <Syllabus pillars={pillars} pillar={pillar} current={current} done={done} />
        </div>

        <main className="min-w-0 overflow-y-auto overscroll-contain max-lg:pb-16">{children}</main>

        <aside
          aria-label="In this lesson"
          className={cn(
            "overflow-y-auto overscroll-contain border-line bg-card lg:border-l",
            !side && "lg:invisible lg:border-l-0",
            sheet === "side" ? "max-lg:fixed max-lg:inset-x-0 max-lg:top-[42%] max-lg:bottom-13 max-lg:z-(--layer-scrim) max-lg:border-t" : "max-lg:hidden",
          )}
        >
          {outline}
        </aside>
      </div>

      <nav aria-label="Lesson panels" className="fixed inset-x-0 bottom-0 z-(--layer-scrim) flex h-13 bg-foreground text-background lg:hidden">
        {(["rail", "side"] as const).map((name) => (
          <button
            key={name}
            type="button"
            aria-expanded={sheet === name}
            onClick={() => setSheet(sheet === name ? null : name)}
            className="flex-1 text-step--1 font-bold opacity-65 aria-expanded:opacity-100 aria-expanded:shadow-[inset_0_-2px_0_var(--color-accent)]"
          >
            {name === "rail" ? "Lessons" : "In this lesson"}
          </button>
        ))}
      </nav>
    </div>
  );
}

function FoldButton({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="min-h-8 border px-xs text-step--2 font-bold aria-pressed:border-foreground aria-pressed:text-foreground border-line text-muted"
    >
      {children}
    </button>
  );
}

function Syllabus({
  pillars,
  pillar,
  current,
  done,
}: {
  pillars: PortalPillar[];
  pillar: PortalPillar;
  current: string;
  done: ReadonlySet<string>;
}) {
  const complete = pillar.modules.filter((m) => done.has(m.file)).length;
  const left = pillar.modules.filter((m) => !done.has(m.file)).reduce((sum, m) => sum + minutesOf(m.duration), 0);
  const percent = pillar.modules.length ? Math.round((complete / pillar.modules.length) * 100) : 0;

  return (
    <div className="grid gap-s px-s pt-s pb-xl">
      <div className="border border-line bg-background px-s py-xs">
        <p className="flex items-baseline justify-between gap-xs">
          <b className="font-heading text-step-1">{percent}%</b>
          <span className="text-step--2 text-muted">{left ? `${left} min left` : complete ? "All done" : ""}</span>
        </p>
        <p className="sr-only">{complete} of {pillar.modules.length} modules complete</p>
        <span aria-hidden="true" className="mt-2xs flex gap-0.5">
          {pillar.modules.map((m) => (
            <i key={m.file} className={cn("h-2 flex-1", done.has(m.file) ? "bg-accent" : "bg-line")} />
          ))}
        </span>
      </div>

      <nav aria-label="Pillars and modules" className="grid gap-2xs">
        {pillars.map((p) => {
          const open = p.file === pillar.file;
          return (
            <details key={p.file} open={open} className="group border border-line bg-background">
              <summary className="grid cursor-pointer list-none grid-cols-[1.5rem_minmax(0,1fr)_0.75rem] items-center gap-xs px-xs py-xs [&::-webkit-details-marker]:hidden">
                <span className="text-step--2 font-bold text-muted tabular-nums">{String(p.number).padStart(2, "0")}</span>
                <span className="text-step--1 leading-tight font-bold">{p.title.replace(/^Pillar \d+ — /, "")}</span>
                <span aria-hidden="true" className="text-muted group-open:rotate-45">+</span>
              </summary>
              <ol className="grid gap-px px-xs pb-xs">
                {[{ file: p.file, href: p.href, title: "Overview", duration: undefined }, ...p.modules].map((m) => {
                  const here = m.file === current;
                  const state = here ? "here" : done.has(m.file) ? "done" : "next";
                  return (
                    <li key={m.file}>
                      <Link
                        href={m.href}
                        aria-current={here ? "page" : undefined}
                        className={cn(
                          "grid grid-cols-[0.75rem_minmax(0,1fr)_auto] items-center gap-xs px-2xs py-2xs text-step--1",
                          here ? "bg-tint-background font-bold" : "hover:bg-card-secondary",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-3",
                            state === "here" && "bg-accent shadow-[0_0_8px_1px_var(--color-accent)]",
                            state === "done" && "bg-foreground",
                            state === "next" && "border border-line",
                          )}
                        />
                        <span>
                          {m.title}
                          {state === "done" && <span className="sr-only"> (complete)</span>}
                        </span>
                        <span className="text-step--2 text-muted tabular-nums">{m.duration?.replace(/\s*min.*/, "m")}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </details>
          );
        })}
      </nav>
    </div>
  );
}
