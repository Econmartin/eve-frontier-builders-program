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
  const page = {
    file,
    title: title ?? allPages().find((item) => item.file === file)?.title ?? file,
    description: frontmatter.description,
    aliases: frontmatter.aliases,
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
      const { id } = parseYaml(node.value) ?? {};
      if (typeof id !== "string") throw new Error(`${file}: an exercise block needs an id`);
      return [{ type: "exercise", id } satisfies Exercise];
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
