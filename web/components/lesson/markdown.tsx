import type { ReactNode } from "react";
import Link from "next/link";
import type { Nodes, RootContent } from "mdast";
import { EXTERNAL, isExternal } from "@/lib/external";
import { textOf } from "@/lib/content/parse";
import type { HintStyle } from "@/lib/content/types";
import { Excerpt } from "./excerpt";
import { Exercise } from "./exercise";
import { Hint } from "./hint";
import { Tabs } from "./tabs";
import { Term } from "./term";

const link = "text-accent-text underline underline-offset-2 hover:decoration-2";

/** Renders a page's resolved Markdown tree with the site's components. */
export function Markdown({ nodes }: { nodes: RootContent[] }) {
  const ids = new Map<string, number>();

  function idFor(node: Nodes) {
    const base = textOf(node).toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
    const count = ids.get(base) ?? 0;
    ids.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  }

  function all(children: RootContent[]) {
    return children.map((child, i) => render(child, i));
  }

  function render(node: RootContent, key: number): ReactNode {
    switch (node.type) {
      case "paragraph":
        return <p key={key} className="mt-s first:mt-0">{all(node.children)}</p>;
      case "heading": {
        const Heading = `h${Math.min(Math.max(node.depth, 2), 6)}` as "h2";
        return <Heading key={key} id={idFor(node)} className="mt-l scroll-mt-l first:mt-0">{all(node.children)}</Heading>;
      }
      case "text":
        return node.value;
      case "emphasis":
        return <em key={key}>{all(node.children)}</em>;
      case "strong":
        return <strong key={key}>{all(node.children)}</strong>;
      case "delete":
        return <del key={key}>{all(node.children)}</del>;
      case "inlineCode":
        return <code key={key} className="bg-card px-1 font-mono text-[0.875em]">{node.value}</code>;
      case "break":
        return <br key={key} />;
      case "link":
        if (node.data?.term) {
          return <Term key={key} href={node.url} description={node.data.term}>{all(node.children)}</Term>;
        }
        if (isExternal(node.url)) {
          return <a key={key} href={node.url} {...EXTERNAL} className={link}>{all(node.children)}</a>;
        }
        return <Link key={key} href={node.url} className={link}>{all(node.children)}</Link>;
      case "image":
        // Static export serves images as they are; there's nothing for next/image to optimise
        // eslint-disable-next-line @next/next/no-img-element
        return <img key={key} src={node.url} alt={node.alt ?? ""} className="mt-s max-w-full" />;
      case "list": {
        const List = node.ordered ? "ol" : "ul";
        return (
          <List key={key} className={`mt-s pl-m ${node.ordered ? "list-decimal" : "list-disc"}`}>
            {all(node.children)}
          </List>
        );
      }
      case "listItem":
        return <li key={key} className="mt-2xs [&>p]:mt-0">{all(node.children)}</li>;
      case "blockquote":
        return <blockquote key={key} className="mt-s border-l-2 border-line pl-s">{all(node.children)}</blockquote>;
      case "code":
        return (
          <pre key={key} tabIndex={0} className="mt-s overflow-x-auto bg-card p-s font-mono text-step--1 leading-normal">
            <code>{node.value}</code>
          </pre>
        );
      case "thematicBreak":
        return <hr key={key} className="mt-l border-line" />;
      case "table": {
        const [head, ...body] = node.children;
        return (
          <div key={key} tabIndex={0} className="mt-s overflow-x-auto">
            <table className="w-full border-collapse text-left text-step--1">
              <thead>
                <tr className="border-b border-trim">
                  {head.children.map((cell, i) => <th key={i} scope="col" className="py-2xs pr-s font-bold">{all(cell.children)}</th>)}
                </tr>
              </thead>
              <tbody>
                {body.map((row, r) => (
                  <tr key={r} className="border-b border-line">
                    {row.children.map((cell, i) => <td key={i} className="py-2xs pr-s align-top">{all(cell.children)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case "gitbook":
        if (node.name === "hint") {
          return <Hint key={key} style={node.attributes.style as HintStyle}>{all(node.children)}</Hint>;
        }
        if (node.name === "tabs") {
          const tabs = node.children.map((tab) => {
            if (tab.type !== "gitbook" || tab.name !== "tab") throw new Error("A tabs block can only hold tab blocks");
            return { title: tab.attributes.title ?? "", content: all(tab.children) };
          });
          return <Tabs key={key} tabs={tabs} />;
        }
        throw new Error("A tab block has to sit inside a tabs block");
      case "excerpt":
        return <Excerpt key={key} title={node.title} href={node.href}>{all(node.children)}</Excerpt>;
      case "exercise":
        return <Exercise key={key} id={node.id} />;
      default:
        // Raw HTML and other GitBook-only nodes don't render in the portal
        return null;
    }
  }

  return <>{all(nodes)}</>;
}
