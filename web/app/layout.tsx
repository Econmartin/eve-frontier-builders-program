import type { Metadata } from "next";
import { disketMono, geistMono, inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVE Frontier Builders",
  description: "A learning and enablement hub for EVE Frontier builders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${disketMono.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
