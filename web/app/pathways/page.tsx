import type { Metadata } from "next";
import Link from "next/link";
import { Plate } from "@/components/ui";
import { ContentPage, eyebrow } from "@/components/lesson/content-page";
import { getIndex, getPathways, renderMarkdown } from "@/lib/content/load";

export function generateMetadata(): Metadata {
  const { title, description } = getIndex().pathways;
  return { title, description };
}

export default function Pathways() {
  const { title, description, intro } = getIndex().pathways;
  return (
    <ContentPage page={{ title, description, root: renderMarkdown(intro ?? "", "index.yaml") }} section="pathways">
      <ul role="list" className="mt-l grid gap-s sm:grid-cols-2">
        {getPathways().map((pathway) => (
          <li key={pathway.slug} className="grid">
            <Plate as={Link} href={pathway.href} corners="tr" className="grid gap-2xs px-s py-s hover:[--plate-fill:var(--color-card-secondary)]">
              {pathway.audience && <span className={eyebrow}>{pathway.audience}</span>}
              <span className="text-step-1 font-bold">{pathway.title}</span>
              {pathway.description && <span className="text-step--1 text-muted">{pathway.description}</span>}
              <span className="text-step--2 text-muted">{pathway.courses.map((c) => c.title).join(" → ")}</span>
            </Plate>
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}
