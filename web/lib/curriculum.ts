import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

/* The curriculum folder, one level up from web/. Only the names that make
   addresses are read here; pages read the content itself. */
const root = join(process.cwd(), "..", "curriculum");

function read(file: string, from: string) {
  try {
    return readFileSync(join(root, file), "utf8");
  } catch {
    throw new Error(`${from}: curriculum/${file} doesn't exist`);
  }
}

const list = (file: string, key: string, from: string): string[] => parse(read(file, from))?.[key] ?? [];

const index = () => parse(read("index.yaml", "web/lib/curriculum.ts"));

export interface Course {
  slug: string;
  modules: { slug: string; lessons: string[] }[];
}

/** Every course in index.yaml, with its modules and their lessons, by file name. */
export function getCourses(): Course[] {
  return (index().courses?.list ?? []).map((course: string) => ({
    slug: course,
    modules: list(`courses/${course}.yaml`, "modules", "curriculum/index.yaml").map((module) => ({
      slug: module,
      lessons: list(`modules/${module}.yaml`, "lessons", `curriculum/courses/${course}.yaml`),
    })),
  }));
}

/** Every pathway in index.yaml, by file name. */
export function getPathways(): string[] {
  return index().pathways?.list ?? [];
}
