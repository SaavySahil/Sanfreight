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
