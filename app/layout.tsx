import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://data-center-map-teal.vercel.app"),
  title: "AI Infrastructure Atlas — Major Data Centers Worldwide",
  description: "Explore the world's major purpose-built AI data center campuses on an interactive 3D globe.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "AI Infrastructure Atlas",
    description: "The physical frontier of AI, mapped across the globe.",
    type: "website",
    images: [{ url: "/og.png", width: 1664, height: 937, alt: "AI Infrastructure Atlas — the physical frontier of AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Infrastructure Atlas",
    description: "The physical frontier of AI, mapped across the globe.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
