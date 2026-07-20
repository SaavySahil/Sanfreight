import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/api";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-6 md:px-12">
        <Link href="/en/news" className="text-sm text-white/60 hover:text-white transition-colors">
          &larr; Back to News
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        {article.category && (
          <span className="text-xs uppercase tracking-wide text-white/40">
            {article.category}
          </span>
        )}
        <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-sm text-white/40">
          {article.author} &middot; {formatDate(article.published_at)}
        </p>

        {article.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.thumbnail}
            alt=""
            className="mt-8 w-full rounded-lg object-cover"
          />
        )}

        <div
          className="mt-8 space-y-4 text-white/80 leading-relaxed [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-white [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-white [&_a]:text-white [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
          dangerouslySetInnerHTML={{ __html: article.body || "" }}
        />
      </main>
    </div>
  );
}
