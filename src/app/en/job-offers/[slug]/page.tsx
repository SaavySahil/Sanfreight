import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getJobBySlug, type Job } from "@/lib/api";
import PageTransition from "@/components/PageTransition";
import teamMembers from "@/app/teamMembers.json";
import { escapeHtml, splitBullets } from "@/lib/legacyRender";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface LegacyPageData {
  title: string;
  description: string;
  bodyClass: string;
  bodyHtml: string;
}

// Old Mimco job postings gated off in the catch-all route ([...slug]/page.tsx).
// This route sits outside that catch-all, so it must repeat the same gate —
// otherwise these would silently come back online here.
const LEGACY_DISABLED_SLUGS = ["corporate-legal-officer", "senior-fund-manager"];

// Job postings created before the admin panel was wired up still live as
// static scraped pages. New/edited postings come from the API. Try the API
// first (source of truth going forward); fall back to the legacy static
// file so old job URLs already shared/indexed don't break.
function getLegacyJobPage(slug: string): LegacyPageData | null {
  if (LEGACY_DISABLED_SLUGS.includes(slug)) return null;
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "content",
      "pages",
      "en",
      "job-offers",
      slug,
      "page.json"
    );
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

// Reference template: one of the real migrated jobs. Every job detail page
// shares the exact same site markup/CSS (hero, description, requirements
// list) — only these dynamic fields differ per job.
function getReferenceTemplate(): LegacyPageData {
  const filePath = path.join(
    process.cwd(),
    "src",
    "content",
    "pages",
    "en",
    "job-offers",
    "administrative-sales-support",
    "page.json"
  );
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

const OLD_TITLE = "Administrative &amp; Sales Support";
const OLD_DESC_MARKER = '<div class="description" data-animation="reveal-lines">\n                <p>';
const LISTS_INNER_MARKER = '<div class="module module-lists"';
const SECTION_END_MARKER = "</div></section>";

function renderBullet(text: string): string {
  return `<div class="options-texts">
                                                        ${escapeHtml(text)}                                                    </div>

<div class="separator"></div>`;
}

function renderRequirementsCard(bullets: string[]): string {
  if (bullets.length === 0) return "";
  return `
                                    <div class="information-card-wrapper">
                    <div class="information-card">

                        <div class="left">
                                                            <div class="title-w">
                                    <div class="title">
                                        Requirements                                    </div>
                                </div>
                                                    </div>
                        <div class="right">

                                                                                                <div class="options-title-w">
                                                                            </div>

                                                                            <div class="options-texts-w">
                                                                                                                                                ${bullets.map(renderBullet).join("")}
                                    </div>

                        </div>
                    </div>

<div class="separator"></div></div>`;
}

function renderJobHtml(job: Job, base: LegacyPageData): string {
  let html = base.bodyHtml;

  const newTitle = job.title.replace(/&/g, "&amp;");
  html = html.split(OLD_TITLE).join(newTitle);

  const descStart = html.indexOf(OLD_DESC_MARKER);
  if (descStart !== -1) {
    const pStart = descStart + OLD_DESC_MARKER.length;
    const pEnd = html.indexOf("</p>", pStart);
    if (pEnd !== -1) {
      html =
        html.slice(0, pStart) +
        escapeHtml(job.description || "") +
        html.slice(pEnd);
    }
  }

  const listsIdx = html.indexOf(LISTS_INNER_MARKER);
  if (listsIdx !== -1) {
    const innerMarker = '<div class="inner">';
    const innerIdx = html.indexOf(innerMarker, listsIdx);
    const innerStart = innerIdx + innerMarker.length;
    const sectionEndIdx = html.indexOf(SECTION_END_MARKER, innerStart);
    if (innerIdx !== -1 && sectionEndIdx !== -1) {
      const bullets = splitBullets(job.requirements);
      html =
        html.slice(0, innerStart) + renderRequirementsCard(bullets) + html.slice(sectionEndIdx);
    }
  }

  return html;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (job) {
    return {
      title: `${job.title} - Sanfreight`,
      description: job.description?.slice(0, 200) || undefined,
    };
  }
  const legacy = getLegacyJobPage(slug);
  if (legacy) return { title: legacy.title, description: legacy.description };
  return { title: "Job not found - Sanfreight" };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (job) {
    const base = getReferenceTemplate();
    const finalHtml = renderJobHtml(job, base);
    return (
      <>
        <PageTransition bodyClass={base.bodyClass} teamMembers={teamMembers} />
        <div suppressHydrationWarning={true} dangerouslySetInnerHTML={{ __html: finalHtml }} />
        <Script src="/js/email-decode.min.js" strategy="afterInteractive" />
        <Script src="/js/app-16e2282a.js" strategy="afterInteractive" />
      </>
    );
  }

  // Fall back to the legacy static page for job slugs not in the API.
  const legacy = getLegacyJobPage(slug);
  if (!legacy) notFound();

  return (
    <>
      <PageTransition bodyClass={legacy.bodyClass} teamMembers={teamMembers} />
      <div
        suppressHydrationWarning={true}
        dangerouslySetInnerHTML={{ __html: legacy.bodyHtml }}
      />
      <Script src="/js/email-decode.min.js" strategy="afterInteractive" />
      <Script src="/js/app-16e2282a.js" strategy="afterInteractive" />
    </>
  );
}
