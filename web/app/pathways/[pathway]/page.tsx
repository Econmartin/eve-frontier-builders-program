import { getPathways } from "@/lib/curriculum";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPathways().map((pathway) => ({ pathway }));
}

export default function Pathway() {
  return null;
}
