import fs from "fs";
import path from "path";
import Script from "next/script";
import PageTransition from "@/components/PageTransition";
import teamMembers from "../../teamMembers.json";
import { getArticles, type Article } from "@/lib/api";
import { escapeHtml, formatDotDate } from "@/lib/legacyRender";

export const metadata = {
  title: "News - Sanfreight",
  description:
    "Latest news, insights, and updates from Sanfreight Logistics on global trade, freight, and supply chain management.",
};

export const revalidate = 60;

const CARDS_START_MARKER = "<!-- Put content here  -->";
const CARD_END_MARKER = '<div class="separator"></div></a>';

interface LegacyPageData {
  bodyClass: string;
  bodyHtml: string;
}

function getBaseTemplate(): LegacyPageData {
  const filePath = path.join(
    process.cwd(),
    "src",
    "content",
    "pages",
    "en",
    "news",
    "page.json"
  );
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function renderCard(article: Article): string {
  const href = `/en/news/${encodeURIComponent(article.slug)}`;
  const img = article.thumbnail || "";
  const dateLabel = formatDotDate(article.published_at);
  const category = article.category || "";
  return `
<a href="${href}" class="component-new new-container " data-component="NewOrJob" data-filterable data-filter="${escapeHtml(category)}" >
    <div class="dflex">

        <div class="left-container">
            <div class="image-wrapper">
                <div class="image-content">
                                            <picture ><source srcset="${escapeHtml(img)}" media="(min-width: 960px)" /><img src="${escapeHtml(img)}" loading="lazy" data-src="" alt="" class="picture" draggable="false" /></picture>                                    </div>
            </div>
                            <div class="date-wrapper">
                    <div class="date">
                            <div class="tag green">
            <span class="text-chinese-black-1">${dateLabel}</span>
            </div>
                    </div>
                </div>

        </div>
        <div class="right-container">
                            <div class="new-title-wrapper">
                    <span data-animation="reveal-lines">${escapeHtml(article.title)}</span>
                </div>

                            <div class="new-description-wrapper" data-animation="reveal-lines">
                    <p>${escapeHtml(article.summary || "")}</p>
                </div>

            <div class="flex">
                <div class="custom-icon-wrapper">
                    <div class="custom-icon-arrow"> ↗ </div>
                </div>

                <div class="new-type-wrapper">
                                            <p>${escapeHtml(category)}</p>
                                    </div>

            </div>
        </div>
    </div>

<div class="separator"></div></a>`;
}

export default async function NewsPage() {
  const articles = await getArticles();
  const base = getBaseTemplate();
  const html = base.bodyHtml;

  const startIdx = html.indexOf(CARDS_START_MARKER) + CARDS_START_MARKER.length;
  const lastCardEndIdx = html.lastIndexOf(CARD_END_MARKER) + CARD_END_MARKER.length;
  const prefix = html.slice(0, startIdx);
  const suffix = html.slice(lastCardEndIdx);
  const cardsHtml = articles.map(renderCard).join("");
  const finalHtml = prefix + cardsHtml + suffix;

  return (
    <>
      <PageTransition bodyClass={base.bodyClass} teamMembers={teamMembers} />
      <div suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html: finalHtml }} />
      <Script src="/js/email-decode.min.js" strategy="afterInteractive" />
      <Script src="/js/app-16e2282a.js" strategy="afterInteractive" />
    </>
  );
}
