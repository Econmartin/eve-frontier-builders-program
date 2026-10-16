import { useEffect, useRef, useState } from "react";

/** The value of a custom property on `<html>`, following the theme. */
export function useToken(name: string) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const html = document.documentElement;
    const read = () => setValue(getComputedStyle(html).getPropertyValue(name).trim());
    read();
    const observer = new MutationObserver(read);
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme", "class"] });
    const media = matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", read);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", read);
    };
  }, [name]);
  return value;
}

/** Computed styles of the element the ref is attached to, re-read on resize so fluid values stay current. */
export function useComputedStyles<T extends HTMLElement>(...properties: string[]) {
  const ref = useRef<T>(null);
  const [values, setValues] = useState<string[]>([]);
  // Rest args are a fresh array each render, so the effect keys on their contents
  const key = properties.join("\n");
  useEffect(() => {
    const names = key.split("\n");
    const read = () => {
      if (!ref.current) return;
      const style = getComputedStyle(ref.current);
      setValues(names.map((name) => style.getPropertyValue(name)));
    };
    read();
    addEventListener("resize", read);
    return () => removeEventListener("resize", read);
  }, [key]);
  return [ref, values] as const;
}
