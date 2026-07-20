import Link from "next/link";
import { getArticles } from "@/lib/api";

export const metadata = {
  title: "News - Sanfreight",
  description:
    "Latest news, insights, and updates from Sanfreight Logistics on global trade, freight, and supply chain management.",
};

export const revalidate = 60;

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NewsPage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-6 md:px-12">
        <Link href="/en" className="text-sm text-white/60 hover:text-white transition-colors">
          &larr; Back to Sanfreight
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16 md:px-12">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">News</h1>
        <p className="mt-4 max-w-2xl text-white/60">
          Insights and updates on logistics, global trade, and supply chain management from the
          Sanfreight team.
        </p>

        {articles.length === 0 ? (
          <p className="mt-16 text-white/40">No articles published yet — check back soon.</p>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/en/news/${article.slug}`}
                className="group block overflow-hidden rounded-lg border border-white/10 transition-colors hover:border-white/30"
              >
                {article.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.thumbnail}
                    alt=""
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-6">
                  {article.category && (
                    <span className="text-xs uppercase tracking-wide text-white/40">
                      {article.category}
                    </span>
                  )}
                  <h2 className="mt-2 text-xl font-medium leading-snug group-hover:text-white">
                    {article.title}
                  </h2>
                  {article.summary && (
                    <p className="mt-2 line-clamp-3 text-sm text-white/60">{article.summary}</p>
                  )}
                  <p className="mt-4 text-xs text-white/40">
                    {article.author} &middot; {formatDate(article.published_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
