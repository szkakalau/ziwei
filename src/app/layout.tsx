import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default:
      "Ziwei AI | Purple Star Astrology Reading (AI-Powered)",
    template: "%s | Ziwei AI",
  },
  description:
    "Get a modern, AI-powered read on your Purple Star (Zi Wei Dou Shu) chart—personality, relationships, and life themes. Free preview.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Ziwei AI",
    title: "Ziwei AI | Purple Star Astrology Reading (AI-Powered)",
    description:
      "Get a modern, AI-powered read on your Purple Star chart—personality, relationships, and life themes. Free preview.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ziwei AI | Purple Star Astrology Reading (AI-Powered)",
    description:
      "Get a modern, AI-powered read on your Purple Star chart—personality, relationships, and life themes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
