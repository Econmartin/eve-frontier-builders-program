import { getCourses } from "@/lib/curriculum";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().flatMap((course) => course.modules.map((module) => ({ course: course.slug, module: module.slug })));
}

export default function Module() {
  return null;
}
