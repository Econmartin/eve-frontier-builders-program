import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { useEffect, type ReactNode } from "react";
import { geistMono, geistSans } from "../app/fonts";
import "./preview.css";

/* The app sets the font variables and the theme on <html>, so stories do the same */
function Document({ theme, children }: { theme: string; children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add(geistSans.variable, geistMono.variable, "antialiased");
    if (theme === "light" || theme === "dark") html.dataset.theme = theme;
    else delete html.dataset.theme;
  }, [theme]);
  return children;
}

const withDocument: Decorator = (Story, { globals }) => (
  <Document theme={globals.theme as string}>
    <Story />
  </Document>
);

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [withDocument],
  globalTypes: {
    theme: {
      description: "Colour scheme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "system", title: "System" },
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "system" },
  parameters: {
    layout: "padded",
    backgrounds: { disable: true },
    options: {
      /* Groups in this order; within a component, stories keep their file order (All first, Playground last) */
      storySort: {
        method: "alphabetical-by-kind",
        order: ["Foundation", "Actions", "Components", "Feedback", "Forms", "Navigation"],
      },
    },
  },
};

export default preview;
