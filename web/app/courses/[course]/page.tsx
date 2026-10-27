import { getCourses } from "@/lib/curriculum";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().map(({ slug }) => ({ course: slug }));
}

export default function Course() {
  return null;
}
