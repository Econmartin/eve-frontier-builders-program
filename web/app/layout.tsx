import type { Metadata } from "next";
import { disketMono, inter } from "./fonts";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVE Frontier Builders",
  description: "A learning and enablement hub for EVE Frontier builders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${disketMono.variable} ${inter.variable} h-full antialiased`}
      // The theme script sets data-theme before React hydrates
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
