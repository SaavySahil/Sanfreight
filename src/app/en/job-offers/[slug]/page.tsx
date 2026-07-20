import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getJobBySlug } from "@/lib/api";
import PageTransition from "@/components/PageTransition";
import teamMembers from "@/app/teamMembers.json";

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
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-white/10 px-6 py-6 md:px-12">
          <Link
            href="/en/job-offers"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            &larr; Back to Careers
          </Link>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-16 md:px-12">
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{job.title}</h1>
          <p className="mt-4 text-sm text-white/50">
            {[job.department, job.location, job.type].filter(Boolean).join(" · ")}
          </p>

          {job.description && (
            <div className="mt-8">
              <h2 className="text-lg font-medium">Description</h2>
              <div className="mt-2 whitespace-pre-line text-white/80 leading-relaxed">
                {job.description}
              </div>
            </div>
          )}

          {job.requirements && (
            <div className="mt-8">
              <h2 className="text-lg font-medium">Requirements</h2>
              <div className="mt-2 whitespace-pre-line text-white/80 leading-relaxed">
                {job.requirements}
              </div>
            </div>
          )}
        </main>
      </div>
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
