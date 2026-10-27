import { getCourses } from "@/lib/curriculum";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().flatMap((course) =>
    course.modules.flatMap((module) => module.lessons.map((lesson) => ({ course: course.slug, module: module.slug, lesson }))),
  );
}

export default function Lesson() {
  return null;
}
