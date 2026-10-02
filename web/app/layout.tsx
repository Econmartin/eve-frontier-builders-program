import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { TopBar } from "@/components/top-bar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* Applies a saved theme before first paint; with none saved, the system preference applies */
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

const TABS = [
  { label: "Pathways", href: "/pathways" },
  { label: "Courses", href: "/courses" },
];

const SECONDARY = [
  { label: "Documentation", href: "/docs" },
  { label: "Glossary", href: "/glossary", sub: true },
  { label: "About", href: "/about" },
];

export const metadata: Metadata = {
  title: { default: "EVE Frontier Builders", template: "%s · EVE Frontier Builders" },
  description: "A learning and enablement hub for EVE Frontier builders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <TopBar brand={{ label: "EF-B", href: "/" }} tabs={TABS} secondary={SECONDARY} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
