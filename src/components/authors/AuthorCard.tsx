import { memo } from "react";

interface AuthorCardProps {
  authorName: string;
  totalArticles: number;
}

export const AuthorCard = memo(function AuthorCard({
  authorName,
  totalArticles,
}: AuthorCardProps) {
  return (
    <div className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold text-lg">
          {authorName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-black dark:group-hover:text-white transition-colors">
            {authorName}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Content Creator
          </p>
        </div>
      </div>
      <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-900">
        <span className="font-semibold text-zinc-900 dark:text-zinc-200 mr-1.5">
          {totalArticles}
        </span>
        <span>articles published</span>
      </div>
    </div>
  );
});

