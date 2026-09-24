import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Script from "next/script";
import PageTransition from "@/components/PageTransition";
import KeyFiguresRoll from "@/components/KeyFiguresRoll";
import ImageGlobe from "@/components/ImageGlobe";
import { withHomepageServices } from "@/lib/homeServiceMarkup";
import { withSolutionsNav } from "@/lib/solutionsNavMarkup";
import "./home-services.css";
import "./key-figures-roll.css";
import "./image-globe.css";
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
  const homepageHtml = withSolutionsNav(withHomepageServices(data.bodyHtml));
  const previousSection = '<div class="module-full module-homepage-interactive-image"';
  const teamSection = '<div class="module module-team-slideshow"';
  const previousStart = homepageHtml.indexOf(previousSection);
  const teamStart = homepageHtml.indexOf(teamSection, previousStart);
  const bodyHtml = previousStart >= 0 && teamStart > previousStart
    ? `${homepageHtml.slice(0, previousStart)}<div id="sf-image-globe-root"></div>${homepageHtml.slice(teamStart)}`
    : homepageHtml.replace(teamSection, `<div id="sf-image-globe-root"></div>${teamSection}`);

  return (
    <>
      {/* Dynamic transition controller, click intercept, and globals injection */}
      <PageTransition bodyClass={data.bodyClass} teamMembers={teamMembers} />
      <KeyFiguresRoll />
      <ImageGlobe />

      {/* Render the scraped page body content */}
      <div
        suppressHydrationWarning={true}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {/* Load core scripts */}
      <Script src="/js/email-decode.min.js" strategy="afterInteractive" />
      <Script src="/js/app-16e2282a.js" strategy="afterInteractive" />
    </>
  );
}
