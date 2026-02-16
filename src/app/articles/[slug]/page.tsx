import { notFound } from "next/navigation";
import { getPublicArticleBySlug } from "@/lib/articles";
import { Metadata } from "next";
import { ViewCounter } from "@/components/articles/ViewCounter";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 300;

/**
 * SEO Metadata generation for the public article page.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  const description = article.text.slice(0, 160);

  return {
    title: article.title,
    description: description,
    openGraph: {
      title: article.title,
      description: description,
      images: article.coverImageUrl ? [article.coverImageUrl] : [],
      type: "article",
      publishedTime:
        article.publishedAt?.toISOString() || article.createdAt.toISOString(),
      authors: [article.authorName],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: description,
      images: article.coverImageUrl ? [article.coverImageUrl] : [],
    },
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
  };
}

/**
 * Server Component for the public article view.
 * Fetches data directly from MongoDB to avoid tRPC context issues in RSC.
 */
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);

  if (!article || article.status !== "published") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black selection:bg-zinc-950 selection:text-white dark:selection:bg-white dark:selection:text-black">
      <article className="max-w-4xl mx-auto px-6 py-16 md:py-32 lg:py-40 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
        {/* Header Section */}
        <header className="mb-20 md:mb-32">
          <div className="mb-12 md:mb-16">
            <ViewCounter slug={article.slug} />
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-zinc-900 dark:text-white mb-12 leading-[0.95] text-balance">
            {article.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-t border-zinc-100 dark:border-zinc-900 pt-12 mt-12">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-black text-3xl md:text-4xl shadow-2xl transition-transform hover:scale-105 active:scale-95 duration-300">
                {article.authorName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="font-black text-2xl text-zinc-900 dark:text-white leading-tight tracking-tight">
                  {article.authorName}
                </div>
                <div className="text-[10px] md:text-xs font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
                  Validated Platform Author
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-1">
                Publication Timeline
              </div>
              <div className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                {article.publishedAt?.toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }) ||
                  article.createdAt.toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImageUrl && (
          <div className="mb-24 md:mb-32 rounded-5xl overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-none ring-1 ring-zinc-100 dark:ring-zinc-900 transform hover:scale-[1.01] transition-all animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-auto object-cover aspect-video md:aspect-21/10 hover:scale-105 transition-transform duration-1000"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="max-w-3xl mx-auto space-y-16">
          <div className="prose prose-zinc prose-xl md:prose-2xl dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-zinc-950 dark:prose-headings:text-white prose-p:leading-[1.8] prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-img:rounded-4xl prose-strong:font-black prose-strong:text-zinc-900 dark:prose-strong:text-white">
            <p className="text-2xl md:text-3xl lg:text-4xl leading-relaxed text-zinc-900 dark:text-white font-black mb-16 tracking-tight">
              {article.text.slice(0, 200)}...
            </p>
            <div className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200 leading-[1.6] text-xl md:text-2xl font-medium tracking-tight">
              {article.text}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-40 pt-20 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity duration-500">
            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
              wortise engineering • v2.0
            </p>
            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
              {new Date().getUTCFullYear()} protocol active
            </p>
          </div>
        </footer>
      </article>
    </main>
  );
}

