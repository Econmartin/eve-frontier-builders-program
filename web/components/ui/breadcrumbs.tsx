import Link from "next/link";
import { Fragment, type ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";
import styles from "./breadcrumbs.module.css";

type Crumb = { label: string; href?: string };

type BreadcrumbsProps = { items: Crumb[] } & Omit<ComponentPropsWithRef<"nav">, "children">;

/**
 * The trail at the top of a page's hero. The last item is the current page.
 * On phones the middle steps fold into an ellipsis.
 *
 * @example
 * ```tsx
 * <Breadcrumbs items={[{ label: "Courses", href: "/courses" }, { label: "Pillar 2" }, { label: "World Interaction" }]} />
 * ```
 */
export function Breadcrumbs({ items, className, ...rest }: BreadcrumbsProps) {
  const last = items.length - 1;

  return (
    <nav aria-label="Breadcrumb" {...rest} className={cn(styles.crumbs, className)}>
      <ol>
        {items.map((item, i) => (
          <Fragment key={i}>
            <li className={i > 0 && i < last ? styles.middle : undefined}>
              {i === last ? (
                <span aria-current="page">{item.label}</span>
              ) : item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
            {i === 0 && items.length > 2 && (
              <li className={styles.fold} aria-hidden="true">
                …
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
