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

export const metadata: Metadata = {
  title: "Constitutional AI Playground",
  description:
    "An interactive platform for experimenting with Constitutional AI principles. Build custom AI constitutions, visualize self-critique, and compare different approaches.",
  keywords: [
    "Constitutional AI",
    "AI Safety",
    "Anthropic",
    "AI Alignment",
    "Machine Learning",
    "AI Ethics",
  ],
  authors: [{ name: "Constitutional AI Playground" }],
  openGraph: {
    title: "Constitutional AI Playground",
    description:
      "Experiment with Constitutional AI principles - build custom constitutions, visualize self-critique, and compare different approaches.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Constitutional AI Playground",
    description:
      "Experiment with Constitutional AI principles - build custom constitutions, visualize self-critique, and compare different approaches.",
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
