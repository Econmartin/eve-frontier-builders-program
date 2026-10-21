import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Root } from "mdast";
import { getBacklinks, getGlossary, getOutline } from "@/lib/content/load";
import { GlossaryIndex } from "./glossary-index";
import { Markdown } from "./markdown";
import { SiteHeader, type Section } from "./site-header";

export const eyebrow = "font-heading text-step--2 font-bold tracking-[0.08em] text-muted uppercase";

export interface ContentPageProps {
  page: { title: string; description?: string; aliases?: string[]; root: Root };
  /** The GitBook file behind the page, when there is one, for glossary extras. */
  file?: string;
  parent?: { title: string; href: string };
  section?: Section;
  children?: ReactNode;
}

/**
 * A page outside the lesson player: the Courses and Pathways pages, a
 * pathway, and the glossary and its terms. The page's own text comes first;
 * `children` adds what's generated for it, such as course cards.
 */
export function ContentPage({ page, file, parent, section, children }: ContentPageProps) {
  const outline = getOutline(page.root);
  const isTerm = file?.startsWith("glossary/") && file !== "glossary/README.md";

  return (
    <>
      <SiteHeader current={section} />
      <div className="mx-auto grid w-full max-w-[90rem] gap-l px-s-l py-l min-[90rem]:grid-cols-[minmax(0,1fr)_13rem]">
        <main className="w-full max-w-[52rem]">
          {parent && (
            <p className={eyebrow}>
              <Link href={parent.href} className="hover:text-foreground">{parent.title}</Link>
            </p>
          )}
          <h1 className="mt-xs text-step-4">{page.title}</h1>
          {page.description && <p className="mt-s text-step-1 text-muted">{page.description}</p>}
          {page.aliases?.length ? <p className="mt-xs text-step--1 text-muted">Also called {page.aliases.join(", ")}</p> : null}

          {page.root.children.length > 0 && (
            <div className="mt-l border-t border-line pt-l">
              <Markdown nodes={page.root.children} />
            </div>
          )}

          {file === "glossary/README.md" && (
            <GlossaryIndex terms={getGlossary().map(({ title, href, description, aliases }) => ({ title, href, description, aliases }))} />
          )}
          {isTerm && <UsedIn file={file!} />}
          {children}
        </main>

        {outline.length > 1 && (
          <nav aria-label="On this page" className="hidden text-step--1 min-[90rem]:sticky min-[90rem]:top-[calc(var(--bar-height)+1rem)] min-[90rem]:block min-[90rem]:self-start">
            <h2 className={eyebrow}>On this page</h2>
            <ol className="mt-xs border-l border-line">
              {outline.map((item, i) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="flex gap-2xs py-1 pl-xs text-muted hover:text-foreground">
                    <span aria-hidden="true" className="font-heading">{String(i + 1).padStart(2, "0")}</span>
                    {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </>
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
