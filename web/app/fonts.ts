import { Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";

export const disketMono = localFont({
  variable: "--font-disket-mono",
  src: [
    { path: "./fonts/Disket-Mono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Disket-Mono-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
