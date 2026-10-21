import type { Metadata } from "next";
import { ContentPage } from "@/components/lesson/content-page";
import { getPage } from "@/lib/content/load";

const file = "glossary/README.md";

export function generateMetadata(): Metadata {
  const page = getPage(file);
  return { title: page.title, description: page.description };
}

export default function Glossary() {
  return <ContentPage page={getPage(file)} file={file} section="glossary" />;
}
