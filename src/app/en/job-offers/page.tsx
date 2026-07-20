import Link from "next/link";
import { getJobs } from "@/lib/api";

export const metadata = {
  title: "Careers - Sanfreight",
  description: "Current open positions at Sanfreight Logistics.",
};

export const revalidate = 60;

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-6 md:px-12">
        <Link href="/en" className="text-sm text-white/60 hover:text-white transition-colors">
          &larr; Back to Sanfreight
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Careers</h1>
        <p className="mt-4 max-w-2xl text-white/60">
          Join the Sanfreight team. See our current open positions below.
        </p>

        {jobs.length === 0 ? (
          <p className="mt-16 text-white/40">No open positions right now — check back soon.</p>
        ) : (
          <ul className="mt-12 divide-y divide-white/10 border-t border-white/10">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/en/job-offers/${job.slug}`}
                  className="group flex items-center justify-between gap-4 py-6 transition-colors hover:bg-white/5"
                >
                  <div>
                    <h2 className="text-lg font-medium group-hover:text-white">{job.title}</h2>
                    <p className="mt-1 text-sm text-white/50">
                      {[job.department, job.location, job.type].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="shrink-0 text-white/40 group-hover:text-white">&rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
