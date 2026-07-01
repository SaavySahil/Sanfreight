import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homepage - Sanfreight",
  description:
    "In this regard, Sanfreight structures, develops, and supports the growth of real estate investment vehicles. Professional investors can access through these vehicles top-tier management and strategies that would typically be beyond their reach.",
  alternates: {
    canonical: "https://sanfreightnew.vercel.app/",
    languages: {
      "en": "https://sanfreightnew.vercel.app/en/",
    },
  },
  openGraph: {
    locale: "en_US",
    type: "website",
    title: "Homepage - Sanfreight",
    description:
      "In this regard, Sanfreight structures, develops, and supports the growth of real estate investment vehicles. Professional investors can access through these vehicles top-tier management and strategies that would typically be beyond their reach.",
    url: "https://sanfreightnew.vercel.app/en/",
    siteName: "Sanfreight",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <head>
        <link rel="preconnect" href="https://www.mimcocapital.com/en/" crossOrigin="" />
      </head>
      <body className="wp-theme-mimco">
        {children}
      </body>
    </html>
  );
}
