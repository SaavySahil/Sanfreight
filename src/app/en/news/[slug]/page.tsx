import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Script from "next/script";
import PageTransition from "@/components/PageTransition";
import teamMembers from "../../../teamMembers.json";
import { getArticleBySlug, type Article } from "@/lib/api";
import { formatLongDate, formatSlashDate } from "@/lib/legacyRender";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface LegacyPageData {
  bodyClass: string;
  bodyHtml: string;
}

// Reference template: one of the real migrated articles. Every article
// detail page shares the exact same site markup/CSS (hero, infos, body,
// "Latest news" widget) — only these dynamic fields differ per article.
const REFERENCE_TEMPLATE_PATH = [
  "src",
  "content",
  "pages",
  "en",
  "2026",
  "06",
  "09",
  "logistics-control-towers-smart-networks-global-trade",
  "page.json",
];
const OLD_TITLE =
  "The Rise of Logistics Control Towers: Building Smart Networks for Unpredictable Global Trade";
const OLD_IMG = "/images/news-blog4.webp";
const OLD_HERO_DATE = "09 June 2026";
const OLD_PUBLISHED = "09/06/2026";
const OLD_CATEGORY = "Technology &amp; Operations";

function getReferenceTemplate(): LegacyPageData {
  const filePath = path.join(process.cwd(), ...REFERENCE_TEMPLATE_PATH);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function renderArticleHtml(article: Article, base: LegacyPageData): string {
  let html = base.bodyHtml;

  const newTitle = article.title.replace(/&/g, "&amp;");
  const newImg = article.thumbnail || OLD_IMG;
  const newHeroDate = formatLongDate(article.published_at) || OLD_HERO_DATE;
  const newPublished = formatSlashDate(article.published_at) || OLD_PUBLISHED;
  const newCategory = article.category ? article.category.replace(/&/g, "&amp;") : "";

  html = html.split(OLD_TITLE).join(newTitle);
  html = html.split(OLD_IMG).join(newImg);
  html = html.split(OLD_HERO_DATE).join(newHeroDate);
  html = html.split(OLD_PUBLISHED).join(newPublished);
  html = html.split(OLD_CATEGORY).join(newCategory);

  const infosIdx = html.indexOf('<div class="infos">');
  const bodyStartIdx = html.indexOf('<div class="partial-wysiwyg">', infosIdx);
  const bodyEndIdx = html.indexOf('<div class="module module-news', bodyStartIdx);

  if (bodyStartIdx === -1 || bodyEndIdx === -1) return html;

  return html.slice(0, bodyStartIdx) + (article.body || "") + html.slice(bodyEndIdx);
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found - Sanfreight" };
  return {
    title: `${article.title} - Sanfreight`,
    description: article.summary || undefined,
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const base = getReferenceTemplate();
  const finalHtml = renderArticleHtml(article, base);

  return (
    <>
      <PageTransition bodyClass={base.bodyClass} teamMembers={teamMembers} />
      <div suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html: finalHtml }} />
      <Script src="/js/email-decode.min.js" strategy="afterInteractive" />
      <Script src="/js/app-16e2282a.js" strategy="afterInteractive" />
    </>
  );
}
