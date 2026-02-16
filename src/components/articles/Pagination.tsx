"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages || 1 }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-12 gap-2 pb-10">
      {totalPages > 1 && (
        <Link
          href={getPageUrl(Math.max(1, currentPage - 1))}
          className={`p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-400 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm ${
            currentPage === 1 ? "opacity-30 pointer-events-none" : ""
          }`}>
          <ChevronLeft size={20} />
        </Link>
      )}

      <div className="flex items-center gap-2">
        {totalPages <= 1 ? (
          <div className="w-12 h-12 flex items-center justify-center rounded-xl text-sm font-bold bg-white/10 dark:bg-white/10 text-zinc-900 dark:text-white cursor-default border border-zinc-200 dark:border-zinc-800">
            1
          </div>
        ) : (
          pages.map((page) => (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all border ${
                currentPage === page
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent shadow-xl"
                  : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800"
              }`}>
              {page}
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Link
          href={getPageUrl(Math.min(totalPages, currentPage + 1))}
          className={`p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-400 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm ${
            currentPage === totalPages ? "opacity-30 pointer-events-none" : ""
          }`}>
          <ChevronRight size={20} />
        </Link>
      )}
    </div>
  );
}

