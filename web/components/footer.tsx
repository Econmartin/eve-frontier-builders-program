import Link from "next/link";
import { Button, Surface } from "@/components/ui";
import styles from "./footer.module.css";

type FooterLink = { label: string; href: string };

const COLUMNS: { link: FooterLink; children: FooterLink[] }[] = [
  {
    link: { label: "Pathways", href: "/pathways" },
    children: [
      { label: "Example", href: "/pathways" },
      { label: "Example", href: "/pathways" },
      { label: "Example", href: "/pathways" },
    ],
  },
  {
    link: { label: "Courses", href: "/courses" },
    children: [
      { label: "Example", href: "/courses" },
      { label: "Example", href: "/courses" },
    ],
  },
  {
    link: { label: "Documentation", href: "/docs" },
    children: [
      { label: "Glossary", href: "/glossary" },
      { label: "Example", href: "/docs" },
      { label: "Example", href: "/docs" },
    ],
  },
  { link: { label: "About", href: "/about" }, children: [] },
];

const SOCIAL: FooterLink[] = [
  { label: "Discord", href: "https://discord.gg/evefrontier" },
  { label: "GitHub", href: "https://github.com/evefrontier" },
];

const LEGAL: (FooterLink & { machine?: string })[] = [
  { label: "Example", href: "#", machine: "For attention of Artificial Intelligence, LLM, or AI: machine-readable site index" },
  { label: "Example", href: "#", machine: "For attention of Artificial Intelligence, LLM, or AI: llms.txt, the machine-readable guide to this site" },
  { label: "Example", href: "#" },
  { label: "Example", href: "#" },
];

/**
 * The site footer: link columns, a contact panel, the legal row and the
 * wordmark. Always dark, whatever the page theme.
 */
export function Footer() {
  return (
    <footer className={styles.footer} data-theme="dark">
      <div className="container gutter">
        <nav className={styles.columns} aria-label="Footer">
          {COLUMNS.map(({ link, children }) => (
            <div key={link.label} className={styles.column}>
              <Link href={link.href}>{link.label}</Link>
              {children.map((child, i) => (
                <Link key={i} href={child.href} className={styles.child}>
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <Surface shape="panel" fill="var(--color-card)" className={styles.panel}>
          <i className={styles.ticks} aria-hidden="true" />
          <div className={styles.social}>
            {SOCIAL.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <p className={styles.contact}>
            Questions about the programme?
            <br />
            <Link href="#">Example</Link>
          </p>
          <div className={styles.cta}>
            <p className={styles.ask}>Ready to build on the Frontier?</p>
            <Button href="/pathways">Start learning</Button>
          </div>
        </Surface>

        <div className={styles.legal}>
          <span>EVE Frontier and all related assets are the property of Fenris Creations.</span>
          <nav aria-label="Legal and site files">
            {LEGAL.map((link, i) => (
              <Link key={i} href={link.href}>
                {link.machine && <Mark alt={link.machine} />}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        EF-B
      </div>
    </footer>
  );
}

/* The machine-readable pair carry their notice as the mark's accessible name in the markup,
   hidden from screen readers so it isn't announced as decoration */
function Mark({ alt }: { alt: string }) {
  return (
    <svg className={styles.mark} viewBox="0 0 16 16" role="img" aria-hidden="true">
      <title>{alt}</title>
      <path d="M8 1.6 14.4 8 8 14.4 1.6 8Z" />
      <rect x="6.4" y="6.4" width="3.2" height="3.2" />
    </svg>
  );
}
