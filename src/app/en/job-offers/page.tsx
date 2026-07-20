import fs from "fs";
import path from "path";
import Script from "next/script";
import PageTransition from "@/components/PageTransition";
import teamMembers from "../../teamMembers.json";
import { getJobs, type Job } from "@/lib/api";
import { escapeHtml } from "@/lib/legacyRender";

export const metadata = {
  title: "Careers - Sanfreight",
  description: "Current open positions at Sanfreight Logistics.",
};

export const revalidate = 60;

const CARDS_START_MARKER = "<!-- Put content here  -->";
const CARD_END_MARKER = '<div class="separator"></div></div>';

interface LegacyPageData {
  bodyClass: string;
  bodyHtml: string;
}

// The real jobs-listing design lives on the /en/career page (FilterableJobs
// component). /en/job-offers reuses that exact same template/CSS, with the
// job cards made dynamic and clickable.
function getBaseTemplate(): LegacyPageData {
  const filePath = path.join(
    process.cwd(),
    "src",
    "content",
    "pages",
    "en",
    "career",
    "page.json"
  );
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function renderCard(job: Job): string {
  const href = `/en/job-offers/${encodeURIComponent(job.slug)}`;
  const meta = [job.department, job.location, job.type].filter(Boolean).join(" · ");
  return `
<a href="${href}" class="partial-job" data-filterable data-filter="" data-component="JobCard">
    <div class="dflex">

        <div class="left-container">
            <div class="date-wrapper">${escapeHtml(meta)}</div>
        </div>
        <div class="right-container">
                            <div class="title-wrapper">
                                            <span>${escapeHtml(job.title)}</span>
                                    </div>

                            <div class="preview-wrapper">
                    <p>${escapeHtml(job.description || "")}</p>
                </div>

            <div class="icons-wrapper">

            </div>

        </div>
    </div>

<div class="separator"></div></a>`;
}

export default async function JobsPage() {
  const jobs = await getJobs();
  const base = getBaseTemplate();
  const html = base.bodyHtml;

  const startIdx = html.indexOf(CARDS_START_MARKER) + CARDS_START_MARKER.length;
  const lastCardEndIdx = html.lastIndexOf(CARD_END_MARKER) + CARD_END_MARKER.length;
  const prefix = html.slice(0, startIdx);
  const suffix = html.slice(lastCardEndIdx);
  const cardsHtml = jobs.map(renderCard).join("");
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
