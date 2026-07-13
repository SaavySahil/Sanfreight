import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Script from "next/script";
import PageTransition from "@/components/PageTransition";
import teamMembers from "../teamMembers.json";

interface PageData {
  title: string;
  description: string;
  bodyClass: string;
  bodyHtml: string;
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

// Routes still holding old Mimco Capital (real-estate/investment) content that
// hasn't been rebranded for Sanfreight. Not ready for the client — gated here
// instead of deleting the underlying page.json files, so the content stays
// recoverable and easy to re-enable once each page is actually rebranded.
const DISABLED_ROUTE_PREFIXES = [
  "en/investement-solution/",
  "en/investor/",
  "en/reference/",
  "en/references",
  "en/mimco-real-estate",
  "en/job-offers/corporate-legal-officer",
  "en/job-offers/senior-fund-manager",
];

function isDisabledRoute(decodedSlug: string[]): boolean {
  // The entire non-English tree (bare /YYYY/MM/DD/slug routes, no /en/ prefix)
  // is old Mimco press content mirrored in French — never rebranded either.
  if (/^\d{4}$/.test(decodedSlug[0] ?? "")) return true;
  const joined = decodedSlug.join("/");
  return DISABLED_ROUTE_PREFIXES.some((prefix) => joined.startsWith(prefix));
}

function getPageData(slug: string[]): PageData {
  try {
    const decodedSlug = slug.map((seg) => decodeURIComponent(seg));
    if (isDisabledRoute(decodedSlug)) {
      notFound();
    }
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

  return (
    <>
      <PageTransition bodyClass={data.bodyClass} teamMembers={teamMembers} />
      <div
        suppressHydrationWarning={true}
        dangerouslySetInnerHTML={{ __html: data.bodyHtml }}
      />
      <Script src="/js/email-decode.min.js" strategy="afterInteractive" />
      <Script src="/js/app-16e2282a.js" strategy="afterInteractive" />
    </>
  );
}
