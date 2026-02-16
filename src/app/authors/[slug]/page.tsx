import { notFound } from "next/navigation";
import { createServerApi } from "@/lib/trpc-server";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Metadata } from "next";
import { BookOpen, User as UserIcon, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export const revalidate = 300;

/**
 * SEO Metadata generation for the public author profile page.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const api = await createServerApi();

  try {
    const { author } = await api.authors.getPublicAuthorBySlug({ slug });

    return {
      title: `${author.authorName} – Published Articles | CMS Blog`,
      description: `Read ${author.publishedCount} published articles written by ${author.authorName}.`,
      openGraph: {
        title: author.authorName,
        description: `Author profile of ${author.authorName} - ${author.publishedCount} articles`,
        type: "profile",
      },
    };
  } catch (e) {
    return {
      title: "Author Not Found",
    };
  }
}

export default async function AuthorProfilePage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const limit = 9;

  const api = await createServerApi();

  try {
    const data = await api.authors.getPublicAuthorBySlug({
      slug,
      page,
      limit,
    });

    const { author, articles, total, totalPages } = data;

    return (
      <main className="min-h-screen bg-white dark:bg-black selection:bg-zinc-950 selection:text-white dark:selection:bg-white dark:selection:text-black">
        {/* Author Header */}
        <section className="bg-zinc-50/50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 pt-24 pb-32 relative overflow-hidden animate-in fade-in duration-1000">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-size-[40px_40px]"></div>

          <div className="max-w-[1400px] mx-auto px-10 relative z-10">
            <Link
              href="/authors"
              className="inline-flex items-center gap-3 text-zinc-400 hover:text-zinc-950 dark:hover:text-white mb-16 transition-all text-[10px] font-black uppercase tracking-[0.3em] group">
              <ArrowLeft
                size={14}
                strokeWidth={3}
                className="group-hover:-translate-x-2 transition-transform duration-500"
              />
              System Authority Index
            </Link>

            <div className="flex flex-col md:flex-row md:items-end gap-12 animate-in slide-in-from-left-8 duration-1000 fill-mode-both">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[40px] bg-zinc-900 dark:bg-white flex items-center justify-center text-5xl md:text-7xl font-black text-white dark:text-zinc-950 shadow-[0_32px_64px_rgba(0,0,0,0.15)] ring-8 ring-white/50 dark:ring-zinc-900/50 transform hover:scale-105 transition-transform duration-700">
                {author.authorName.charAt(0)}
              </div>
              <div className="space-y-6 pb-2">
                <div className="space-y-2">
                  <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.9]">
                    {author.authorName}
                  </h1>
                  <p className="text-[11px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.4em]">
                    Validated Platform Contributor
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
                      <BookOpen size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-xl font-black text-zinc-900 dark:text-white leading-none">
                        {author.publishedCount}
                      </div>
                      <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                        Articles
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-500">
                      <UserIcon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-xl font-black text-zinc-900 dark:text-white leading-none">
                        Faculty
                      </div>
                      <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                        Rank status
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="max-w-[1400px] mx-auto px-10 py-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-20 border-b border-zinc-50 dark:border-zinc-900 pb-12">
            <div className="space-y-1">
              <h2 className="text-[11px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.4em]">
                Intellectual Portfolio
              </h2>
              <div className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                Latest Contributions
              </div>
            </div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Segment {articles.length} of {total} results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-24">
            {articles.map((article, idx) => (
              <div
                key={article._id}
                className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${idx * 100}ms` }}>
                <ArticleCard
                  id={article._id}
                  slug={article.slug}
                  title={article.title}
                  coverImageUrl={article.coverImageUrl}
                  authorName={article.authorName}
                  createdAt={article.createdAt}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-10 pt-16 border-t border-zinc-50 dark:border-zinc-900">
              <div className="flex items-center gap-4">
                <Link
                  href={`?page=${Math.max(1, page - 1)}`}
                  className={`flex items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                    page === 1
                      ? "opacity-20 cursor-not-allowed border-zinc-200 dark:border-zinc-800"
                      : "hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 border-zinc-200 dark:border-zinc-800 active:scale-90"
                  }`}
                  aria-disabled={page === 1}>
                  <ArrowLeft size={20} strokeWidth={3} />
                </Link>

                <div className="flex items-center gap-2 px-6">
                  {[...Array(totalPages)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-700 ${page === i + 1 ? "w-8 bg-zinc-900 dark:bg-white" : "w-1.5 bg-zinc-200 dark:bg-zinc-800"}`}
                    />
                  ))}
                </div>

                <Link
                  href={`?page=${Math.min(totalPages, page + 1)}`}
                  className={`flex items-center justify-center p-4 rounded-2xl border transition-all duration-300 rotate-180 ${
                    page === totalPages
                      ? "opacity-20 cursor-not-allowed border-zinc-200 dark:border-zinc-800"
                      : "hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 border-zinc-200 dark:border-zinc-800 active:scale-90"
                  }`}
                  aria-disabled={page === totalPages}>
                  <ArrowLeft size={20} strokeWidth={3} />
                </Link>
              </div>
              <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.4em]">
                Registry Page {page} of {totalPages}
              </div>
            </div>
          )}
        </section>
      </main>
    );
  } catch (e) {
    notFound();
  }
}

