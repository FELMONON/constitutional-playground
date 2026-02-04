import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://web-cyan-ten-16.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Constitutional AI Playground",
    template: "%s | Constitutional AI Playground",
  },
  description:
    "An interactive platform for experimenting with Constitutional AI principles. Build custom AI constitutions, visualize self-critique loops, and compare different approaches to AI alignment.",
  keywords: [
    "Constitutional AI",
    "AI Safety",
    "Anthropic",
    "AI Alignment",
    "Machine Learning",
    "AI Ethics",
    "RLHF",
    "AI Governance",
    "Self-Critique",
  ],
  authors: [{ name: "Constitutional AI Playground" }],
  creator: "Constitutional AI Playground",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Constitutional AI Playground",
    description:
      "Build custom AI constitutions, visualize self-critique loops in real-time, and compare different approaches to AI alignment.",
    url: siteUrl,
    siteName: "Constitutional AI Playground",
    locale: "en_US",
    type: "website",
      },
  twitter: {
    card: "summary_large_image",
    title: "Constitutional AI Playground",
    description:
      "Build custom AI constitutions and visualize self-critique loops in real-time. An interactive tool for AI alignment research.",
    creator: "@anthropic",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
