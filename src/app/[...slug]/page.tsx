import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Script from "next/script";
import PageTransition from "@/components/PageTransition";
import teamMembers from "../teamMembers.json";
import { LogoMarquee } from "@/components/ui/logo-marquee";

interface PageData {
  title: string;
  description: string;
  bodyClass: string;
  bodyHtml: string;
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

function getPageData(slug: string[]): PageData {
  try {
    const decodedSlug = slug.map((seg) => decodeURIComponent(seg));
    const filePath = path.join(
      process.cwd(),
      "src",
      "content",
      "pages",
      ...decodedSlug,
      "page.json"
    );
    if (!fs.existsSync(filePath)) {
      notFound();
    }
    const rawData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(rawData);
  } catch (err) {
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const data = getPageData(slug);
  return {
    title: data.title,
    description: data.description,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const data = getPageData(slug);

  const isHomepage = slug.join("/") === "en";
  const heroSplitIdx = (() => {
    if (!isHomepage) return 0;
    const html = data.bodyHtml;
    const heroStart = html.indexOf("module-homepage-intro");
    if (heroStart === -1) return 0;
    const moduleStart = html.lastIndexOf("<div", heroStart);
    let depth = 0, p = moduleStart;
    while (p < html.length) {
      if (html.substring(p, p + 4) === "<div") depth++;
      if (html.substring(p, p + 6) === "</div>") { depth--; if (depth === 0) return p + 6; }
      p++;
    }
    return 0;
  })();

  return (
    <>
      {/* Dynamic transition controller for body classes and screen loader */}
      <PageTransition bodyClass={data.bodyClass} />

      {/* Set window.teamMembers global variable for the scripts */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.teamMembers = ${JSON.stringify(teamMembers)};
window.ADMIN_AJAX_URL = "https://www.mimcocapital.com/wp-admin/admin-ajax.php";`
        }}
      />

      {/* Render the scraped page body content */}
      {isHomepage ? (
        <>
          <div
            suppressHydrationWarning={true}
            dangerouslySetInnerHTML={{ __html: data.bodyHtml.substring(0, heroSplitIdx) }}
          />
          <LogoMarquee />
          <div
            suppressHydrationWarning={true}
            dangerouslySetInnerHTML={{ __html: data.bodyHtml.substring(heroSplitIdx) }}
          />
        </>
      ) : (
        <div
          suppressHydrationWarning={true}
          dangerouslySetInnerHTML={{ __html: data.bodyHtml }}
        />
      )}

      {/* Load core scripts */}
      <Script src="/js/email-decode.min.js" strategy="beforeInteractive" />
      <Script src="/js/app-16e2282a.js" strategy="lazyOnload" type="module" />
    </>
  );
}
