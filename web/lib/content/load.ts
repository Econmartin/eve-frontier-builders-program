import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, posix } from "node:path";
import type { Heading, List, Nodes, Root, RootContent } from "mdast";
import { parse as parseYaml } from "yaml";
import { includeOf, parseMarkdown, tagOf, textOf } from "./parse";
import type { Excerpt, Exercise, NavGroup, NavItem } from "./types";

/** The GitBook space; the site builds from web/, so it sits one level up. */
const contentRoot = join(process.cwd(), "..", "content");
const vendorRoot = join(process.cwd(), "..", "vendor");
const basePath = "/learn";

interface Page {
  file: string;
  title: string;
  description?: string;
  aliases?: string[];
  duration?: string;
  root: Root;
}

interface VendorSource {
  repo: string;
  commit: string;
  files: Record<string, string>;
}

// next dev doesn't watch content/, so caching is for builds only; dev reads every request
const cache = process.env.NODE_ENV === "production";

const read = (file: string) => readFileSync(join(contentRoot, file), "utf8");

/** The route for a content file: `0-foundations/README.md` → `/learn/0-foundations`. */
export function routeOf(file: string) {
  const path = file.replace(/(^|\/)README\.md$/, "").replace(/\.md$/, "");
  return path ? `${basePath}/${path}` : basePath;
}

let nav: NavGroup[] | undefined;

/** The sidebar, read from SUMMARY.md as GitBook does. */
export function getNav(): NavGroup[] {
  if (cache && nav) return nav;
  const { root } = parseMarkdown(read("SUMMARY.md"), "SUMMARY.md");
  const groups: NavGroup[] = [{ title: null, items: [] }];

  for (const node of root.children) {
    if (node.type === "heading" && node.depth === 2) groups.push({ title: textOf(node), items: [] });
    if (node.type === "list") groups.at(-1)!.items.push(...navItems(node));
  }
  nav = groups.filter((group) => group.items.length);
  return nav;
}

function navItems(list: List): NavItem[] {
  return list.children.flatMap((item) => {
    const [first, ...rest] = item.children;
    const link = first?.type === "paragraph" ? first.children.find((child) => child.type === "link") : undefined;
    if (!link) return [];
    return [{
      title: textOf(link),
      file: link.url,
      href: routeOf(link.url),
      children: rest.flatMap((child) => (child.type === "list" ? navItems(child) : [])),
    }];
  });
}

function flatten(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children)]);
}

export function allPages() {
  return getNav().flatMap((group) => flatten(group.items));
}

const pages = new Map<string, Page>();

export function getPage(file: string): Page {
  const cached = cache && pages.get(file);
  if (cached) return cached;

  const { frontmatter, root } = parseMarkdown(read(file), file);
  root.children = expand(root.children, file, new Set([file]));

  const heading = root.children[0];
  const title = heading?.type === "heading" && heading.depth === 1 ? textOf(heading) : undefined;
  if (title) root.children.shift();

  resolve(root, file);
  const ids = new Map<string, number>();
  visit(root, (node) => {
    if (node.type !== "heading") return;
    const base = textOf(node).toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "section";
    const count = ids.get(base) ?? 0;
    ids.set(base, count + 1);
    node.data = { ...node.data, id: count ? `${base}-${count}` : base };
  });
  const page = {
    file,
    title: title ?? allPages().find((item) => item.file === file)?.title ?? file,
    description: frontmatter.description,
    aliases: frontmatter.aliases,
    duration: frontmatter.duration,
    root,
  };
  pages.set(file, page);
  return page;
}

/** Splices in `{% include %}` files and turns `excerpt` and `exercise` code blocks into their nodes. */
function expand(children: RootContent[], file: string, seen: Set<string>): RootContent[] {
  return children.flatMap((node): RootContent[] => {
    const include = includeOf(node);
    if (include) {
      const target = posix.join(posix.dirname(file), include);
      if (seen.has(target)) throw new Error(`${file}: ${target} includes itself`);
      const { root } = parseMarkdown(read(target), target);
      return expand(root.children, target, new Set([...seen, target]));
    }
    if (node.type === "code" && node.lang === "excerpt") return [excerpt(node.value, file)];
    if (node.type === "code" && node.lang === "exercise") {
      const { id, ...config } = parseYaml(node.value) ?? {};
      if (typeof id !== "string") throw new Error(`${file}: an exercise block needs an id`);
      return [{ type: "exercise", id, config } satisfies Exercise];
    }
    if (node.type === "gitbook") node.children = expand(node.children, file, seen);
    return [node];
  });
}

let manifest: Record<string, VendorSource> | undefined;

function excerpt(value: string, file: string): Excerpt {
  if (!cache || !manifest) manifest = JSON.parse(readFileSync(join(vendorRoot, "manifest.json"), "utf8")).sources as Record<string, VendorSource>;
  const { source: name, file: path, heading } = parseYaml(value) ?? {};
  const source = manifest[name];
  if (!source) throw new Error(`${file}: no vendored source "${name}"`);
  const hash = source.files[path];
  if (!hash) throw new Error(`${file}: ${name}/${path} isn't in the snapshot; add it with scripts/refresh-vendor.mjs`);

  const data = readFileSync(join(vendorRoot, name, path));
  if (createHash("sha256").update(data).digest("hex") !== hash) {
    throw new Error(`vendor/${name}/${path} doesn't match vendor/manifest.json`);
  }

  const { root } = parseMarkdown(data.toString("utf8"), `vendor/${name}/${path}`);
  const start = root.children.findIndex(
    (node) => node.type === "heading" && textOf(node).trim().toLowerCase() === String(heading).trim().toLowerCase(),
  );
  if (start === -1) throw new Error(`${file}: ${name}/${path} has no heading "${heading}"`);

  const depth = (root.children[start] as Heading).depth;
  const end = root.children.findIndex((node, i) => i > start && node.type === "heading" && node.depth <= depth);
  const children = root.children.slice(start + 1, end === -1 ? undefined : end).filter((node) => node.type !== "thematicBreak");

  // Links inside the excerpt point back at the source, at the pinned commit
  const blob = `https://github.com/${source.repo}/blob/${source.commit}/`;
  const raw = `https://raw.githubusercontent.com/${source.repo}/${source.commit}/`;
  visit({ type: "root", children }, (node) => {
    if ((node.type === "link" || node.type === "image") && !/^[a-z]+:|^#/.test(node.url)) {
      node.url = (node.type === "image" ? raw : blob) + posix.join(posix.dirname(path), node.url);
    }
  });

  return { type: "excerpt", title: textOf(root.children[start]), href: blob + path, children };
}

/** Rewrites links to other pages as routes, marks glossary links, and rejects broken ones. */
function resolve(root: Root, file: string) {
  const known = new Set(allPages().map((item) => item.file));

  visit(root, (node) => {
    if (node.type === "paragraph" && tagOf(node)) {
      throw new Error(`${file}: GitBook blocks can't sit inside lists or quotes: "${textOf(node).trim()}"`);
    }
    if (node.type !== "link" || /^[a-z]+:|^#|^\//.test(node.url)) return;

    const [path, hash] = node.url.split("#");
    const target = posix.normalize(posix.join(posix.dirname(file), decodeURI(path)));
    if (!known.has(target)) throw new Error(`${file}: link to ${target}, which isn't in SUMMARY.md`);

    node.url = routeOf(target) + (hash ? `#${hash}` : "");
    if (target.startsWith("glossary/") && !target.endsWith("README.md")) {
      node.data = { ...node.data, term: termOf(target) };
    }
  });
}

function termOf(file: string) {
  const { frontmatter } = parseMarkdown(read(file), file);
  if (!frontmatter.description) throw new Error(`${file}: glossary terms need a description`);
  return frontmatter.description;
}

function visit(node: Nodes, fn: (node: Nodes) => void) {
  fn(node);
  if ("children" in node) for (const child of node.children) visit(child as Nodes, fn);
}

export interface GlossaryTerm {
  file: string;
  title: string;
  href: string;
  description: string;
  aliases: string[];
}

/** Every term page listed under the glossary in SUMMARY.md, A to Z. */
export function getGlossary(): GlossaryTerm[] {
  return allPages()
    .filter((item) => item.file.startsWith("glossary/") && !item.file.endsWith("README.md"))
    .map((item) => {
      const page = getPage(item.file);
      return {
        file: item.file,
        title: page.title,
        href: item.href,
        description: page.description ?? "",
        aliases: page.aliases ?? [],
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
}

/** The lessons that link to a page, in sidebar order. */
export function getBacklinks(file: string) {
  const href = routeOf(file);
  return allPages().filter((item) => {
    if (item.file === file || item.file.startsWith("glossary/")) return false;
    let found = false;
    visit(getPage(item.file).root, (node) => {
      if (node.type === "link" && node.url.split("#")[0] === href) found = true;
    });
    return found;
  });
}

/** The page's place in the sidebar: its pillar, its position there, and its neighbours in reading order. */
export function getPosition(file: string) {
  const pages = allPages();
  const index = pages.findIndex((item) => item.file === file);
  const parent = getNav()
    .flatMap((group) => group.items)
    .find((item) => item.file === file || item.children.some((child) => child.file === file));
  const siblings = parent?.children ?? [];
  return {
    parent,
    number: siblings.findIndex((child) => child.file === file) + 1,
    total: siblings.length,
    previous: index > 0 ? pages[index - 1] : undefined,
    next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : undefined,
  };
}

/** The page's second-level headings, for an "On this page" list. */
export function getOutline(root: Root) {
  return root.children.flatMap((node) =>
    node.type === "heading" && node.depth === 2 && node.data?.id ? [{ id: node.data.id, title: textOf(node) }] : [],
  );
}

export interface PortalModule {
  file: string;
  href: string;
  title: string;
  duration?: string;
}

export interface PortalPillar {
  file: string;
  href: string;
  title: string;
  number: number;
  modules: PortalModule[];
}

/** The pillars and their modules, for the lesson player's syllabus. */
export function getPillars(): PortalPillar[] {
  return getNav()
    .flatMap((group) => group.items)
    .filter((item) => /^\d+-/.test(item.file))
    .map((item) => ({
      file: item.file,
      href: item.href,
      title: item.title,
      number: Number(item.file.match(/^(\d+)-/)![1]),
      modules: item.children.map((child) => ({
        file: child.file,
        href: child.href,
        title: child.title,
        duration: getPage(child.file).duration,
      })),
    }));
}

/** Links a lesson points out to, and the sources it quotes, for its Resources tab. */
export function getResources(root: Root) {
  const resources: { title: string; href: string; kind: string }[] = [];
  const seen = new Set<string>();
  visit(root, (node) => {
    if (node.type === "excerpt" && !seen.has(node.href)) {
      seen.add(node.href);
      resources.push({ title: node.title, href: node.href, kind: "Builder docs" });
    }
    if (node.type === "link" && /^https?:/.test(node.url) && !seen.has(node.url)) {
      seen.add(node.url);
      resources.push({ title: textOf(node), href: node.url, kind: new URL(node.url).hostname.replace(/^www\./, "") });
    }
  });
  return resources;
}

/** Glossary terms a lesson links to, in the order they first appear. */
export function getTerms(root: Root) {
  const terms = new Map<string, { title: string; href: string; description: string }>();
  visit(root, (node) => {
    if (node.type === "link" && node.data?.term && !terms.has(node.url)) {
      const file = allPages().find((item) => item.href === node.url)?.file;
      terms.set(node.url, { title: file ? getPage(file).title : textOf(node), href: node.url, description: node.data.term });
    }
  });
  return [...terms.values()];
}
