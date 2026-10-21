import type { Node, Parent, RootContent } from "mdast";

export const hintStyles = ["info", "success", "warning", "danger"] as const;
export type HintStyle = (typeof hintStyles)[number];

/** A GitBook `{% name %}` block, grouped with its children. */
export interface GitbookBlock extends Parent {
  type: "gitbook";
  name: "hint" | "tabs" | "tab";
  attributes: Record<string, string>;
  children: RootContent[];
}

/** A section quoted from a vendored source, resolved at build time. */
export interface Excerpt extends Parent {
  type: "excerpt";
  title: string;
  href: string;
  children: RootContent[];
}

export interface Exercise extends Node {
  type: "exercise";
  id: string;
}

declare module "mdast" {
  interface RootContentMap {
    gitbook: GitbookBlock;
    excerpt: Excerpt;
    exercise: Exercise;
  }
  interface BlockContentMap {
    gitbook: GitbookBlock;
    excerpt: Excerpt;
    exercise: Exercise;
  }
  interface LinkData {
    /** The linked glossary term's description, shown as a preview. */
    term?: string;
  }
}

export interface NavItem {
  title: string;
  href: string;
  file: string;
  children: NavItem[];
}

export interface NavGroup {
  title: string | null;
  items: NavItem[];
}
