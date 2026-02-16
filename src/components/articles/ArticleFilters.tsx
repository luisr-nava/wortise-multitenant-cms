"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search, User, Calendar, X } from "lucide-react";

interface Author {
  authorId: string;
  authorName: string;
  slug: string;
}

interface ArticleFiltersProps {
  authors: Author[];
}

export function ArticleFilters({ authors }: ArticleFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [authorId, setAuthorId] = useState(searchParams.get("authorId") || "");
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl({ search });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const updateUrl = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Always reset to page 1 when filters change
      if (Object.keys(updates).some((key) => key !== "page")) {
        params.delete("page");
      }

      router.push(`/articles?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilters = () => {
    setSearch("");
    setAuthorId("");
    setFromDate("");
    setToDate("");
    router.push("/articles");
  };

  const hasActiveFilters = search || authorId || fromDate || toDate;

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm rounded-2xl shadow-lg shadow-zinc-200/50 dark:shadow-black/40 p-6 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
            Search
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Filter by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
            />
          </div>
        </div>

        {/* Author */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
            Author
          </label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
            <select
              value={authorId}
              onChange={(e) => {
                setAuthorId(e.target.value);
                updateUrl({ authorId: e.target.value });
              }}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 appearance-none cursor-pointer">
              <option value="" className="bg-white dark:bg-zinc-950">
                All Authors
              </option>
              {authors.map((author) => (
                <option
                  key={author.authorId}
                  value={author.authorId}
                  className="bg-white dark:bg-zinc-950">
                  {author.authorName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* From Date */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
            From Date
          </label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                updateUrl({ fromDate: e.target.value });
              }}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
            />
          </div>
        </div>

        {/* To Date */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
            To Date
          </label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                updateUrl({ toDate: e.target.value });
              }}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X size={14} />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}

