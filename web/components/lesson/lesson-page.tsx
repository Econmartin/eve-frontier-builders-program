import Link from "next/link";
import { Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import { getBacklinks, getGlossary, getNav, getOutline, getPage, getPosition } from "@/lib/content/load";
import type { NavItem } from "@/lib/content/types";
import { Portal } from "@/components/portal/portal";
import { GlossaryIndex } from "./glossary-index";
import { Markdown } from "./markdown";

const eyebrow = "font-heading text-step--2 font-bold tracking-[0.08em] text-muted uppercase";

/**
 * A content page: the syllabus rail, the lesson, and an outline of its
 * sections. Everything around the body comes from SUMMARY.md and the page
 * itself, so authors only write the Markdown.
 */
export function LessonPage({ file }: { file: string }) {
  // Pillar pages open in the lesson player
  if (/^\d+-/.test(file)) return <Portal file={file} />;

  const page = getPage(file);
  const position = getPosition(file);
  const outline = getOutline(page.root);
  const isTerm = file.startsWith("glossary/") && file !== "glossary/README.md";

  return (
    <div className="mx-auto grid w-full max-w-[90rem] gap-l px-s-l py-l lg:grid-cols-[17rem_minmax(0,1fr)] min-[90rem]:grid-cols-[17rem_minmax(0,1fr)_13rem]">
      <main className="w-full max-w-[52rem] justify-self-center lg:col-start-2 lg:row-start-1">
        <p className={eyebrow}>
          {position.parent && position.parent.file !== file ? (
            <>
              <Link href={position.parent.href} className="hover:text-foreground">{position.parent.title}</Link>
              {position.number > 0 && <> · {isTerm ? "Glossary term" : `Module ${position.number} of ${position.total}`}</>}
            </>
          ) : (
            "Builder Program"
          )}
        </p>
        <h1 className="mt-xs text-step-4">{page.title}</h1>
        {page.description && <p className="mt-s text-step-1 text-muted">{page.description}</p>}
        {(page.duration || page.aliases?.length) && (
          <p className="mt-xs flex flex-wrap gap-x-s text-step--1 text-muted">
            {page.duration && <span>{page.duration}</span>}
            {page.aliases?.length ? <span>Also called {page.aliases.join(", ")}</span> : null}
          </p>
        )}

        <div className="mt-l border-t border-line pt-l">
          <Markdown nodes={page.root.children} />
        </div>

        {file === "glossary/README.md" && <GlossaryIndex terms={getGlossary().map(({ title, href, description, aliases }) => ({ title, href, description, aliases }))} />}
        {isTerm && <UsedIn file={file} />}

        <Pager previous={position.previous} next={position.next} />
      </main>

      <nav aria-label="Syllabus" className="text-step--1 lg:sticky lg:top-0 lg:col-start-1 lg:row-start-1 lg:max-h-dvh lg:self-start lg:overflow-y-auto lg:py-2xs">
        {getNav().map((group, i) => (
          <section key={i} className="mt-m first:mt-0">
            {group.title && <h2 className={cn(eyebrow, "mb-2xs")}>{group.title}</h2>}
            {group.items.map((item) => (
              <Syllabus key={item.file} item={item} current={file} />
            ))}
          </section>
        ))}
      </nav>

      {outline.length > 1 && (
        <nav aria-label="On this page" className="hidden text-step--1 min-[90rem]:sticky min-[90rem]:top-0 min-[90rem]:col-start-3 min-[90rem]:row-start-1 min-[90rem]:block min-[90rem]:self-start min-[90rem]:py-2xs">
          <h2 className={eyebrow}>On this page</h2>
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
        </nav>
      )}
    </div>
  );
}

/** A top-level sidebar entry; one with children folds open when it holds the current page. */
function Syllabus({ item, current }: { item: NavItem; current: string }) {
  if (!item.children.length) return <SyllabusRow item={item} current={current} />;
  const open = item.file === current || item.children.some((child) => child.file === current);
  return (
    <details open={open} className="group mt-2xs first:mt-0">
      <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-2xs py-1 font-bold text-foreground [&::-webkit-details-marker]:hidden">
        {item.title}
        <span aria-hidden="true" className="font-heading text-muted group-open:rotate-45">+</span>
      </summary>
      <ul role="list" className="mb-xs">
        <li><SyllabusRow item={{ ...item, title: "Overview" }} current={current} /></li>
        {item.children.map((child) => (
          <li key={child.file}><SyllabusRow item={child} current={current} /></li>
        ))}
      </ul>
    </details>
  );
}

function SyllabusRow({ item, current }: { item: NavItem; current: string }) {
  const here = item.file === current;
  return (
    <Link
      href={item.href}
      aria-current={here ? "page" : undefined}
      className={cn(
        "grid grid-cols-[0.75rem_1fr] items-center gap-2xs px-2xs py-1",
        here ? "bg-tint-background font-bold text-tint-text" : "text-muted hover:text-foreground",
      )}
    >
      <span aria-hidden="true" className={cn("size-2.5", here ? "bg-accent" : "border border-trim")} />
      {item.title}
    </Link>
  );
}

/** Previous and next pages in reading order. */
function Pager({ previous, next }: { previous?: NavItem; next?: NavItem }) {
  if (!previous && !next) return null;
  return (
    <nav aria-label="Previous and next" className="mt-xl grid gap-xs sm:grid-cols-2">
      {previous ? (
        <Plate as={Link} href={previous.href} corners="tl" className="block px-s py-xs hover:[--plate-fill:var(--color-card-secondary)]">
          <span className={eyebrow}>Previous</span>
          <span className="mt-3xs block font-bold">{previous.title}</span>
        </Plate>
      ) : (
        <span />
      )}
      {next && (
        <Plate as={Link} href={next.href} corners="br" className="block px-s py-xs text-right hover:[--plate-fill:var(--color-card-secondary)]">
          <span className={eyebrow}>Next</span>
          <span className="mt-3xs block font-bold">{next.title}</span>
        </Plate>
      )}
    </nav>
  );
}

/** The lessons that link to a glossary term. */
function UsedIn({ file }: { file: string }) {
  const pages = getBacklinks(file);
  if (!pages.length) return null;
  return (
    <section aria-labelledby="used-in" className="mt-xl">
      <p aria-hidden="true" className={cn(eyebrow, "flex items-center gap-xs")}>
        Where it&rsquo;s taught
        <span className="h-px grow bg-line" />
      </p>
      <h2 id="used-in" className="sr-only">Where it&rsquo;s taught</h2>
      <ul role="list" className="mt-xs">
        {pages.map((item) => (
          <li key={item.file} className="border-b border-line">
            <Link href={item.href} className="flex items-center justify-between gap-s py-xs hover:text-accent-text">
              <span className="font-bold">{item.title}</span>
              <span aria-hidden="true" className="text-muted">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
