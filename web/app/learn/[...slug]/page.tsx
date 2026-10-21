import type { Metadata } from "next";
import { LessonPage } from "@/components/lesson/lesson-page";
import { allPages, getPage, routeOf } from "@/lib/content/load";

export const dynamicParams = false;

export function generateStaticParams() {
  return allPages()
    .filter((page) => page.file !== "README.md")
    .map((page) => ({ slug: routeOf(page.file).split("/").slice(2) }));
}

function fileOf(slug: string[]) {
  const route = `/learn/${slug.join("/")}`;
  return allPages().find((page) => routeOf(page.file) === route)!.file;
}

export async function generateMetadata({ params }: PageProps<"/learn/[...slug]">): Promise<Metadata> {
  const page = getPage(fileOf((await params).slug));
  return { title: page.title, description: page.description };
}

export default async function Lesson({ params }: PageProps<"/learn/[...slug]">) {
  return <LessonPage file={fileOf((await params).slug)} />;
}
