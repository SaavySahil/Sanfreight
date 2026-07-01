import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Script from "next/script";
import PageTransition from "@/components/PageTransition";
// Script is still used below for the app bundle
import teamMembers from "./teamMembers.json";

interface PageData {
  title: string;
  description: string;
  bodyClass: string;
  bodyHtml: string;
}

function getPageData(): PageData {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "content",
      "pages",
      "en",
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

export async function generateMetadata() {
  const data = getPageData();
  return {
    title: data.title,
    description: data.description,
  };
}

export default function Home() {
  const data = getPageData();

  return (
    <>
      {/* Dynamic transition controller, click intercept, and globals injection */}
      <PageTransition bodyClass={data.bodyClass} teamMembers={teamMembers} />

      {/* Render the scraped page body content */}
      <div
        suppressHydrationWarning={true}
        dangerouslySetInnerHTML={{ __html: data.bodyHtml }}
      />

      {/* Load core scripts */}
      <Script src="/js/email-decode.min.js" strategy="beforeInteractive" />
      <Script src="/js/app-16e2282a.js" strategy="lazyOnload" type="module" />
    </>
  );
}
