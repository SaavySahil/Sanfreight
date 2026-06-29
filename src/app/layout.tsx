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
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            // Next.js App Router intercepts <a> clicks (bubbling phase) for soft/client-side
            // navigation. The scraped app (app-16e2282a.js) has its own AJAX router that
            // also intercepts clicks and replaces the DOM body via fetch ?isAjax=1.
            // When both fire simultaneously, they race: Next.js swaps the React tree while
            // the scraped JS re-inits against stale DOM nodes, causing:
            //   "Cannot read properties of null (reading 'addEventListener')"
            //
            // Fix: capture-phase listener (fires before bubbling) stops propagation on
            // internal <a> clicks so Next.js never sees them. The scraped app's own
            // delegated handlers still run and drive navigation exclusively.
            document.addEventListener('click', function(e) {
              var el = e.target;
              var a = el && el.closest ? el.closest('a[href]') : null;
              if (!a) return;
              var href = a.getAttribute('href') || '';
              if (!href ||
                  href.charAt(0) === '#' ||
                  href.indexOf('://') !== -1 ||
                  href.indexOf('mailto:') === 0 ||
                  href.indexOf('tel:') === 0 ||
                  a.target === '_blank' ||
                  a.getAttribute('download') != null) return;
              e.stopPropagation();
            }, true);
          })();
        ` }} />
      </head>
      <body className="wp-theme-mimco">
        {children}
      </body>
    </html>
  );
}
