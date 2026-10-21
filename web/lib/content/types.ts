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

/** A glossary term's definition, dropped into a lesson. */
export interface GlossaryCard extends Node {
  type: "glossaryCard";
  title: string;
  href: string;
  description: string;
}

export interface Exercise extends Node {
  type: "exercise";
  id: string;
  /** The block's other fields, such as the learner-facing text for each node. */
  config: Record<string, unknown>;
}

declare module "mdast" {
  interface RootContentMap {
    gitbook: GitbookBlock;
    excerpt: Excerpt;
    exercise: Exercise;
    glossaryCard: GlossaryCard;
  }
  interface BlockContentMap {
    gitbook: GitbookBlock;
    excerpt: Excerpt;
    exercise: Exercise;
    glossaryCard: GlossaryCard;
  }
  interface HeadingData {
    /** The anchor ID, unique within the page. */
    id?: string;
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
