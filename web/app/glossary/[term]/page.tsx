import type { Metadata } from "next";
import { ContentPage } from "@/components/lesson/content-page";
import { getGlossary, getPage } from "@/lib/content/load";

export const dynamicParams = false;

export function generateStaticParams() {
  return getGlossary().map((term) => ({ term: term.href.split("/").at(-1)! }));
}

const fileOf = (term: string) => `glossary/${term}.md`;

export async function generateMetadata({ params }: PageProps<"/glossary/[term]">): Promise<Metadata> {
  const page = getPage(fileOf((await params).term));
  return { title: page.title, description: page.description };
}

export default async function Term({ params }: PageProps<"/glossary/[term]">) {
  const file = fileOf((await params).term);
  return <ContentPage page={getPage(file)} file={file} parent={{ title: getPage("glossary/README.md").title, href: "/glossary" }} section="glossary" />;
}
