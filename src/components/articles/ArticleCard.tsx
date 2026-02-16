import { memo, useMemo } from "react";
import Link from "next/link";
import { User, Calendar } from "lucide-react";
import Image from "next/image";

interface ArticleCardProps {
  id: string;
  slug: string;
  title: string;
  coverImageUrl?: string;
  authorName: string;
  createdAt: string | Date;
}

export const ArticleCard = memo(function ArticleCard({
  id,
  slug,
  title,
  coverImageUrl,
  authorName,
  createdAt,
}: ArticleCardProps) {
  // Memoize date formatting - derived data optimization
  const date = useMemo(() => {
    return new Date(createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [createdAt]);

  return (
    <Link
      href={`/articles/${slug}`}
      className="group block h-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-zinc-200/40 dark:shadow-none hover:shadow-zinc-300 dark:hover:ring-1 dark:hover:ring-zinc-700 transition-all duration-500 h-full flex flex-col group-hover:-translate-y-2">
        <div className="aspect-16/10 w-full bg-zinc-50 dark:bg-zinc-900 relative overflow-hidden">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
              <span className="text-4xl font-black text-white opacity-5 tracking-tighter">
                CMS Content
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="p-8 flex flex-col grow space-y-5">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-lg transition-transform group-hover:scale-105">
              Editorial
            </span>
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
              {date}
            </span>
          </div>

          <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors line-clamp-3 tracking-tighter">
            {title}
          </h3>

          <div className="pt-6 mt-auto flex items-center gap-4 border-t border-zinc-100 dark:border-zinc-900">
            <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 group-hover:bg-zinc-950 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-950 transition-all duration-300">
              <User size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                {authorName}
              </span>
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Platform Contributor
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

