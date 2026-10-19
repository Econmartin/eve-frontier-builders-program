/** Whether a link leaves the site, so it opens in a new tab. */
export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

/** Props for a link that leaves the site. */
export const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;
