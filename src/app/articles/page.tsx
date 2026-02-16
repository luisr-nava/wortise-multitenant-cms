import { createServerApi } from "@/lib/trpc-server";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleFilters } from "@/components/articles/ArticleFilters";
import { Pagination } from "@/components/articles/Pagination";
import { Suspense } from "react";
import { Newspaper, Ghost } from "lucide-react";

export const revalidate = 300;

interface ArticlesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    authorId?: string;
    fromDate?: string;
    toDate?: string;
  }>;
}

export default async function ArticlesPage({
  searchParams,
}: ArticlesPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? 1);
  const search = resolvedSearchParams.search ?? "";
  const authorId = resolvedSearchParams.authorId ?? "";
  const fromDate = resolvedSearchParams.fromDate ?? "";
  const toDate = resolvedSearchParams.toDate ?? "";

  const api = await createServerApi();

  // Fetch articles and authors in parallel
  const [data, authors] = await Promise.all([
    api.articles.getPublishedArticles({
      page,
      limit: 9,
      search,
      authorId,
      fromDate,
      toDate,
    }),
    api.authors.listWithPublishedCount(),
  ]);

  return (
    <div className="bg-zinc-50 dark:bg-black min-h-screen">
      {/* Header Section */}
      <section className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 pt-20 pb-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                <Newspaper size={14} />
                Explore Library
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                All Articles
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl">
                Browse through our entire collection of insights, tutorials, and
                technical deep-dives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <Suspense
          fallback={
            <div className="h-64 animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-3xl" />
          }>
          <ArticleFilters authors={authors} />
        </Suspense>

        {data.articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {data.articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  id={article._id}
                  slug={article.slug}
                  title={article.title}
                  coverImageUrl={article.coverImageUrl}
                  authorName={article.authorName}
                  createdAt={new Date(article.createdAt)}
                />
              ))}
            </div>

            <Pagination
              currentPage={data.currentPage}
              totalPages={data.totalPages || 1}
            />
          </>
        ) : (
          <div className="text-center py-40 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Ghost size={40} />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                No matching articles
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                We couldn't find any articles matching your current filter
                criteria.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

