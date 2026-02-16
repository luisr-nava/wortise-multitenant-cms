import { ArticleCard } from "@/components/articles/ArticleCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createServerApi } from "@/lib/trpc-server";

export const revalidate = 300;

export default async function Home() {
  const api = await createServerApi();
  const articles = await api.articles.publicList({ limit: 9 });

  return (
    <div className="bg-zinc-50 dark:bg-black min-h-[calc(100vh-72px)]">
      {/* Hero Section */}
      <section className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 pt-16 pb-20 md:pt-32 md:pb-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] bg-size-[32px_32px]"></div>
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <div className="flex justify-center mb-10 md:mb-12">
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
              <img
                src="/logo-wortise.webp"
                alt="Wortise Logo"
                className="h-8 md:h-10 w-auto"
              />
            </div>
          </div>

          <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-1.5 text-xs md:text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Technical Evaluation • Full-Stack Web
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-zinc-900 dark:text-white mb-8 max-w-5xl mx-auto leading-[0.95] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            Next Generation <br />
            <span className="text-zinc-400 dark:text-zinc-700">
              Content Engine
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto mb-12 md:mb-16 leading-relaxed font-medium text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            A production-level Multi-Tenant CMS architecture built with Next.js
            16, tRPC, and MongoDB. Engineered for performance and strict data
            isolation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Link href="#articles" className="w-full sm:w-auto">
              <button className="w-full px-10 py-5 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-zinc-200 dark:shadow-none flex items-center justify-center gap-3">
                Explore Content
                <ArrowRight size={22} />
              </button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <button className="w-full px-10 py-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md text-zinc-900 dark:text-white font-bold text-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                Access Panel
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Articles Grid Section */}
      <section id="articles" className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Latest Articles
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Fresh perspectives from our top authors.
            </p>
          </div>
          <Link
            href="/articles"
            className="group flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
            View All
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
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
        ) : (
          <div className="text-center py-24 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              No articles published yet. Be the first to write one!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

