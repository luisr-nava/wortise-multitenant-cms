import { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Award,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Eye,
  Ghost,
} from "lucide-react";
import { createServerApi } from "@/lib/trpc-server";
import { AuthorFilters } from "@/components/authors/AuthorFilters";
import { Pagination } from "@/components/articles/Pagination";
import { Suspense } from "react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Authors - CMS Blog Platform",
  description: "Meet the brilliant minds behind our stories and insights.",
};

interface Author {
  authorId: string;
  authorName: string;
  slug: string;
  publishedCount: number;
}

interface AuthorsPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const sort = (resolvedParams.sort || "rank") as "rank" | "name" | "published";
  const page = Number(resolvedParams.page || 1);
  const limit = 9;

  const api = await createServerApi();
  const [data] = await Promise.all([
    api.authors.list({
      search,
      sort,
      page,
      limit,
    }),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Hero Header */}
      <section className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] bg-size-[32px_32px]"></div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
            <div className="p-6 rounded-[32px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-2xl ring-8 ring-zinc-100 dark:ring-zinc-900 animate-in zoom-in-50 duration-700">
              <Users size={40} strokeWidth={2.5} />
            </div>
            <div className="space-y-4 text-center md:text-left">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.85]">
                Authors
              </h1>
              <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-2xl font-bold tracking-tight leading-snug">
                Meet the intellectual collective behind our technical
                architecture and strategic insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <Suspense
          fallback={
            <div className="h-24 animate-pulse bg-white dark:bg-zinc-900 rounded-2xl mb-16" />
          }>
          <AuthorFilters />
        </Suspense>

        {data.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {data.data.map((author: Author, index: number) => (
                <AuthorCard
                  key={author.authorId}
                  author={author}
                  index={index}
                  sort={sort}
                  page={page}
                />
              ))}
            </div>

            <Pagination
              currentPage={data.page}
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
                No matching contributors
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                Adjustment required. Your search parameters yielded zero active
                entities.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AuthorCard({
  author,
  index,
  sort,
  page,
}: {
  author: Author;
  index: number;
  sort: string;
  page: number;
}) {
  const rank = (page - 1) * 9 + index + 1;
  const isTopAuthor = rank === 1;

  return (
    <div className="group relative">
      {/* Dynamic ranking indicator */}
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white border-2 border-white dark:border-zinc-900 flex items-center justify-center font-black text-white dark:text-zinc-950 shadow-2xl z-20 group-hover:scale-110 transition-transform duration-500">
        {rank}
      </div>

      <Link
        href={`/authors/${author.slug}`}
        className="block h-full bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[40px] p-10 shadow-sm hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-700 transform hover:-translate-y-4 ring-1 ring-zinc-50 dark:ring-zinc-900">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-10">
            <div className="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-3xl font-black text-zinc-400 dark:text-zinc-700 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-950 transition-all duration-500 shadow-inner">
              {author.authorName.charAt(0)}
            </div>
            {isTopAuthor && sort === "rank" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-widest ring-1 ring-amber-500/20 shadow-sm">
                <Award size={12} strokeWidth={3} />
                Summit Prime
              </div>
            )}
          </div>

          <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-3 tracking-tighter group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
            {author.authorName}
          </h3>

          <div className="flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400 mb-12">
            <BookOpen size={16} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-[0.15em]">
              {author.publishedCount} Published Items
            </span>
          </div>

          <div className="mt-auto flex items-center gap-3 text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.3em] group-hover:text-zinc-900 dark:group-hover:text-white transition-all duration-500">
            Access Terminal
            <ChevronRight
              size={14}
              strokeWidth={3}
              className="group-hover:translate-x-2 transition-transform duration-500"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}

