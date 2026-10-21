import type { Metadata } from "next";
import { LessonPage } from "@/components/lesson/lesson-page";
import { getPage } from "@/lib/content/load";

export function generateMetadata(): Metadata {
  const page = getPage("README.md");
  return { title: page.title, description: page.description };
}

export default function Learn() {
  return <LessonPage file="README.md" />;
}
