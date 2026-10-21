import Link from "next/link";
import { cn } from "@/lib/cn";
import { getNav, getPage } from "@/lib/content/load";
import type { NavItem } from "@/lib/content/types";
import { Markdown } from "./markdown";

/** A content page with the lesson sidebar, built from its Markdown file. */
export function LessonPage({ file }: { file: string }) {
  const page = getPage(file);

  return (
    <div className="mx-auto grid w-full max-w-(--container-grid) gap-l px-s-l py-l md:grid-cols-[16rem_minmax(0,1fr)]">
      <main className="max-w-[44rem] md:col-start-2 md:row-start-1">
        <h1>{page.title}</h1>
        {page.description && <p className="mt-xs text-step-1 text-muted">{page.description}</p>}
        {page.aliases?.length ? <p className="mt-2xs text-step--1 text-muted">Also called {page.aliases.join(", ")}</p> : null}
        <div className="mt-l">
          <Markdown nodes={page.root.children} />
        </div>
      </main>
      <nav aria-label="Lessons" className="text-step--1 md:col-start-1 md:row-start-1">
        {getNav().map((group, i) => (
          <section key={i} className="mt-m first:mt-0">
            {group.title && <h2 className="font-heading text-step--2 tracking-[0.04em] text-muted uppercase">{group.title}</h2>}
            <NavTree items={group.items} current={file} />
          </section>
        ))}
      </nav>
    </div>
  );
}

function NavTree({ items, current, nested = false }: { items: NavItem[]; current: string; nested?: boolean }) {
  return (
    <ul role="list" className={cn("mt-2xs", nested && "ml-xs border-l border-line pl-xs")}>
      {items.map((item) => (
        <li key={item.file}>
          <Link
            href={item.href}
            aria-current={item.file === current ? "page" : undefined}
            className="block py-1 text-muted hover:text-foreground aria-[current=page]:font-bold aria-[current=page]:text-foreground"
          >
            {item.title}
          </Link>
          {item.children.length > 0 && <NavTree items={item.children} current={current} nested />}
        </li>
      ))}
    </ul>
  );
}
