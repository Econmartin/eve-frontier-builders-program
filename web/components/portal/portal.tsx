import Link from "next/link";
import { Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import { getOutline, getPage, getPillars, getPosition, getResources, getTerms } from "@/lib/content/load";
import { Markdown } from "@/components/lesson/markdown";
import { LessonTabs, MarkComplete } from "./lesson-tabs";
import { PortalShell } from "./portal-shell";

const idx = "font-heading text-step--2 font-bold tracking-[0.08em] text-muted uppercase";

/**
 * A pillar page in the lesson player. The Markdown is the Overview tab; the
 * syllabus, resources, outline and terms are all derived from the content.
 */
export function Portal({ file }: { file: string }) {
  const page = getPage(file);
  const pillars = getPillars();
  const pillar = pillars.find((p) => p.file === file || p.modules.some((m) => m.file === file))!;
  const { previous, next } = getPosition(file);
  const outline = getOutline(page.root);
  const terms = getTerms(page.root);
  const isOverview = pillar.file === file;

  return (
    <PortalShell
      pillars={pillars}
      current={file}
      outline={
        <div className="grid gap-m px-s pt-s pb-xl text-step--1">
          {outline.length > 0 && (
            <section>
              <h2 className={idx}>On this page</h2>
              <ol className="mt-xs border-l border-line">
                {outline.map((section, i) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="flex gap-2xs py-1 pl-xs text-muted hover:text-foreground">
                      <span aria-hidden="true" className="font-heading">{String(i + 1).padStart(2, "0")}</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {terms.length > 0 && (
            <section>
              <h2 className={idx}>Terms in this lesson</h2>
              <dl className="mt-xs grid gap-xs">
                {terms.map((term) => (
                  <div key={term.href} className="border border-line bg-background px-xs py-2xs">
                    <dt>
                      <Link href={term.href} className="font-bold text-accent-text underline underline-offset-2">{term.title}</Link>
                    </dt>
                    <dd className="mt-3xs text-step--2 text-muted">{term.description}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      }
    >
      <article className="mx-auto grid max-w-[55rem] gap-m px-s-l pt-m pb-2xl">
        <header className="grid gap-2xs">
          <p className={idx}>
            Pillar {String(pillar.number).padStart(2, "0")} · {pillar.title.replace(/^Pillar \d+ — /, "")}
          </p>
          <h1 className="text-step-3">{isOverview ? "Overview" : page.title}</h1>
          {page.description && <p className="text-step-0 text-muted">{page.description}</p>}
          {!isOverview && (
            <div className="mt-2xs flex flex-wrap items-center gap-x-s gap-y-2xs">
              {page.duration && <span className={idx}>{page.duration}</span>}
              <MarkComplete file={file} />
            </div>
          )}
        </header>

        <LessonTabs file={file} overview={<Markdown nodes={page.root.children} />} resources={getResources(page.root)} />

        {(previous || next) && (
          <nav aria-label="Previous and next" className="mt-l flex">
            {previous && (
              <Plate as={Link} href={previous.href} corners="tl" className={cn("grid flex-1 gap-3xs px-s py-xs hover:[--plate-fill:var(--color-card-secondary)]")}>
                <span className={idx}>Previous</span>
                <b className="text-step--1">{previous.title}</b>
              </Plate>
            )}
            {next && (
              <Plate as={Link} href={next.href} corners="br" className={cn("grid flex-1 gap-3xs px-s py-xs text-right hover:[--plate-fill:var(--color-card-secondary)]", previous && "-ml-px")}>
                <span className={idx}>Next</span>
                <b className="text-step--1">{next.title}</b>
              </Plate>
            )}
          </nav>
        )}
      </article>
    </PortalShell>
  );
}
