import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Libre_Baskerville } from "next/font/google";

import { LenisProvider } from "../components/providers/lenis-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-inter",
});

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
});

const garamond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dineos.raiyan.app"),
  title: "DineOS - Real-time Restaurant POS",
  description: "A real-time, decentralized multi-tenant iPOS system.",
  openGraph: {
    title: "DineOS - Real-time Restaurant POS",
    description: "A real-time, decentralized multi-tenant iPOS system.",
    url: "https://dineos.raiyan.app",
    siteName: "DineOS",
    type: "website",
    images: ["/dineos.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "DineOS - Real-time Restaurant POS",
    description: "A real-time, decentralized multi-tenant iPOS system.",
    images: ["/dineos.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${libre.variable} ${garamond.variable}`}>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased ">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
