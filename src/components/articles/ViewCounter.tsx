"use client";

import { useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc-client";
import { Eye, Clock, BarChart3, Calendar } from "lucide-react";

interface ViewCounterProps {
  slug: string;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const incremented = useRef(false);
  const incrementView = trpc.articles.incrementView.useMutation();
  const { data: analytics, isLoading } =
    trpc.articles.getArticleAnalytics.useQuery({ slug });

  // Prevent multiple increment calls in StrictMode or re-renders
  useEffect(() => {
    if (!incremented.current) {
      incrementView.mutate({ slug });
      incremented.current = true;
    }
  }, [slug, incrementView]);

  // Derived data memoization to avoid re-calculating on every render
  const formattedDate = useMemo(() => {
    if (!analytics?.publishedAt) return "";
    return new Date(analytics.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [analytics?.publishedAt]);

  const stats = useMemo(() => {
    if (!analytics) return null;
    return {
      views: analytics.views.toLocaleString(),
      avg: analytics.avgViewsPerDay,
      days: analytics.daysSincePublished,
    };
  }, [analytics]);

  if (isLoading || !analytics || !stats) {
    return (
      <div className="flex gap-6 animate-pulse">
        <div className="h-5 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        <div className="h-5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-10 gap-y-6 items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-sm">
          <Eye size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-zinc-900 dark:text-white leading-none">
            {stats.views}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500 mt-1">
            Total Impressions
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
          <BarChart3 size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-zinc-900 dark:text-white leading-none">
            {stats.avg}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500 mt-1">
            Views Per Day
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 shadow-sm">
          <Calendar size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-zinc-900 dark:text-white leading-none">
            {formattedDate}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500 mt-1">
            Launch Date
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 shadow-sm">
          <Clock size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-zinc-900 dark:text-white leading-none">
            {stats.days}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500 mt-1">
            Active Days
          </span>
        </div>
      </div>
    </div>
  );
}

