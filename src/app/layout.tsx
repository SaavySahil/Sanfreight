import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homepage - MIMCO capital",
  description:
    "In this regard, MIMCO Capital structures, develops, and supports the growth of real estate investment vehicles. Professional investors can access through these vehicles top-tier management and strategies that would typically be beyond their reach.",
  alternates: {
    canonical: "https://www.mimcocapital.com/en/",
    languages: {
      "en": "https://www.mimcocapital.com/en/",
      "fr": "https://www.mimcocapital.com/",
      "de": "https://www.mimcocapital.com/de/",
    },
  },
  openGraph: {
    locale: "en_US",
    alternateLocale: ["fr_FR", "de_DE"],
    type: "website",
    title: "Homepage - MIMCO capital",
    description:
      "In this regard, MIMCO Capital structures, develops, and supports the growth of real estate investment vehicles. Professional investors can access through these vehicles top-tier management and strategies that would typically be beyond their reach.",
    url: "https://www.mimcocapital.com/en/",
    siteName: "MIMCO capital",
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
