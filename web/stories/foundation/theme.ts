import css from "@/app/theme.css?raw";

export type Token = { name: string; value: string };
export type Group = { heading: string; tokens: Token[] };

/* Each comment on its own line in theme.css starts a group, so the
  stories follow the file: a token added under a heading shows up under it. */
function parse(block: string) {
  const groups: Group[] = [];
  let group: Group | undefined;
  for (const match of block.matchAll(/\/\*([\s\S]*?)\*\/|(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const [, comment, name, value] = match;
    if (comment !== undefined) {
      const lineStart = block.lastIndexOf("\n", match.index) + 1;
      if (block.slice(lineStart, match.index).trim()) continue;
      group = { heading: comment.replace(/\s+/g, " ").trim(), tokens: [] };
      groups.push(group);
    } else if (group) {
      group.tokens.push({ name, value: value.trim() });
    }
  }
  return groups.filter((item) => item.tokens.length);
}

function block(opening: string) {
  const start = css.indexOf(opening) + opening.length;
  return css.slice(start, css.indexOf("\n}", start));
}

/** Groups from the `@theme` block: the tokens utilities are built from. */
export const theme = parse(block("@theme {"));

/** Groups from the plain `:root` block: primitives, cuts and layers. */
export const root = parse(block(":root {"));

/** The groups whose tokens start with one of the prefixes, with the tokens narrowed to those. */
export function tokens(groups: Group[], ...prefixes: string[]) {
  return groups
    .map((group) => ({
      ...group,
      tokens: group.tokens.filter((token) => prefixes.some((prefix) => token.name.startsWith(prefix))),
    }))
    .filter((group) => group.tokens.length);
}
