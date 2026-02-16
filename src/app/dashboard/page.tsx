"use client";

import {
  useMyArticles,
  useDeleteArticle,
  useUpdateArticleStatus,
} from "@/features/articles/hooks/useArticles";
import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  Trash2,
  FileText, Search
} from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { toastSuccess, toastError } from "@/lib/toast";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Switch between 'List' and 'Search' queries
  const {
    data: myData,
    isLoading: isMyLoading,
    isError: isMyError,
  } = useMyArticles(page, 10);
  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = trpc.articles.search.useQuery(
    { query: searchQuery, page, limit: 10, status: undefined },
    { enabled: searchQuery.length > 0 },
  );

  const data = searchQuery ? searchData : myData;
  const isLoading = searchQuery ? isSearchLoading : isMyLoading;
  const isError = searchQuery ? isSearchError : isMyError;

  const deleteArticleMutation = useDeleteArticle();
  const updateStatusMutation = useUpdateArticleStatus();
  const { confirm } = useConfirm();
  const utils = trpc.useUtils();

  // Stable callback for deletion
  const handleDelete = useCallback(
    async (id: string) => {
      const isConfirmed = await confirm({
        title: "Delete Article",
        description:
          "Are you sure you want to delete this article? This action cannot be undone.",
        confirmText: "Delete",
        variant: "danger",
      });

      if (isConfirmed) {
        deleteArticleMutation.mutate(
          { id },
          {
            onSuccess: () => {
              toastSuccess("Article deleted successfully");
              utils.articles.getMyArticles.invalidate(); // Selective invalidation
            },
            onError: (error) => {
              toastError(error.message || "Failed to delete article");
            },
          },
        );
      }
    },
    [confirm, deleteArticleMutation, utils],
  );

  // Stable callback for status updates
  const handleStatusChange = useCallback(
    (articleId: string, newStatus: "draft" | "published") => {
      updateStatusMutation.mutate(
        { articleId, status: newStatus },
        {
          onSuccess: () => {
            toastSuccess(
              newStatus === "published"
                ? "Article published successfully"
                : "Article moved to draft",
            );
            utils.articles.getMyArticles.invalidate();
          },
          onError: (error) => {
            toastError(error.message || "Failed to update article status");
          },
        },
      );
    },
    [updateStatusMutation, utils],
  );

  if (isLoading) {
    return (
      <div className="space-y-12 animate-in fade-in duration-700 fill-mode-both">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-zinc-100 dark:border-zinc-800 pb-12">
          <div className="space-y-4">
            <Skeleton className="h-14 w-72 rounded-3xl" />
            <Skeleton className="h-6 w-96 rounded-2xl opacity-50" />
          </div>
          <Skeleton className="h-16 w-full sm:w-56 rounded-3xl" />
        </div>
        <div className="bg-white dark:bg-zinc-950 rounded-5xl border border-zinc-200 dark:border-zinc-800 p-10 space-y-8 shadow-sm">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-8 py-6 border-b border-zinc-50 dark:border-zinc-900 last:border-0">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-1/4 rounded-md opacity-40" />
              </div>
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-16 text-center bg-red-50 dark:bg-red-500/5 rounded-4xl border border-red-100 dark:border-red-500/20 max-w-2xl mx-auto mt-24 animate-in zoom-in-95 duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 mb-8 shadow-inner">
          <Trash2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
          System Interruption
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-10 font-medium">
          We encountered a protocol error while fetching your data streams.
        </p>
        <Button
          variant="danger"
          size="lg"
          className="rounded-2xl"
          onClick={() => window.location.reload()}>
          Re-initialize Stream
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 fill-mode-both">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            Dashboard
          </h1>
          <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-500 font-medium max-w-lg">
            Manage your content engine and publication lifecycle with precision.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors duration-300"
              size={18}
              strokeWidth={2.5}
            />
            <input
              type="text"
              placeholder="Filter by title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 h-[56px] rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:border-zinc-900 dark:focus:border-white focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-semibold"
            />
          </div>
          <Link href="/dashboard/new" className="shrink-0">
            <Button
              size="lg"
              className="h-[56px] rounded-2xl w-full sm:w-auto px-1 whitespace-nowrap shadow-xl shadow-zinc-200/50 dark:shadow-none hover:translate-y-[-2px] active:translate-y-0 transition-transform flex items-center justify-center">
              New Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-zinc-100 dark:border-zinc-900 overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800/50">
        {data?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center bg-zinc-50/50 dark:bg-zinc-900/10">
            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-zinc-900 flex items-center justify-center mb-8 shadow-2xl border border-zinc-100 dark:border-zinc-800 transform animate-in zoom-in-90 duration-700">
              {searchQuery ? (
                <Search
                  className="w-10 h-10 text-zinc-300 dark:text-zinc-700"
                  strokeWidth={2}
                />
              ) : (
                <FileText
                  className="w-10 h-10 text-zinc-300 dark:text-zinc-700"
                  strokeWidth={2}
                />
              )}
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight uppercase">
              {searchQuery ? "No matching records" : "Empty Repository"}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-12 font-medium leading-relaxed">
              {searchQuery
                ? `No results found for "${searchQuery}". Please refine your query parameters.`
                : "Your organization has not deployed any content yet. Start by creating your first article."}
            </p>
            {searchQuery ? (
              <Button
                variant="secondary"
                size="lg"
                className="rounded-2xl px-10"
                onClick={() => setSearchQuery("")}>
                Clear Filter
              </Button>
            ) : (
              <Link href="/dashboard/new">
                <Button size="lg" className="rounded-2xl px-12 shadow-xl">
                  Deploy First Article
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-zinc-50/80 dark:bg-zinc-900/50">
                    <th className="pl-10 pr-6 py-6 text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest w-[45%]">
                      Content Identity
                    </th>
                    <th className="px-6 py-6 text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-6 text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      Deployment
                    </th>
                    <th className="pl-6 pr-10 py-6 text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                  {data?.items.map((article: any, idx: number) => (
                    <tr
                      key={article._id}
                      className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all duration-300 animate-in fade-in slide-in-from-left-2 fill-mode-both"
                      style={{ animationDelay: `${idx * 40}ms` }}>
                      <td className="pl-10 pr-6 py-8">
                        <div className="font-bold text-[17px] text-zinc-900 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors tracking-tight line-clamp-1">
                          {article.title}
                        </div>
                        <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 mt-2 uppercase tracking-[0.2em] font-mono">
                          ID_{article._id.slice(-6).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        {article.status === "published" ? (
                          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                            Staging
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">
                            {new Date(article.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                            Committed
                          </span>
                        </div>
                      </td>

                      <td className="pl-6 pr-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                          {article.status === "draft" ? (
                            <Button
                              size="xs"
                              variant="primary"
                              isLoading={updateStatusMutation.isPending}
                              className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px]"
                              onClick={() =>
                                handleStatusChange(article._id, "published")
                              }>
                              Push Live
                            </Button>
                          ) : (
                            <Button
                              size="xs"
                              variant="secondary"
                              isLoading={updateStatusMutation.isPending}
                              className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px]"
                              onClick={() =>
                                handleStatusChange(article._id, "draft")
                              }>
                              Revert
                            </Button>
                          )}
                          <Link href={`/dashboard/edit/${article._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 w-10 p-0 rounded-xl border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-white transition-all shadow-sm">
                              <Edit size={14} strokeWidth={3} />
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            className="h-10 w-10 p-0 rounded-xl transition-all shadow-sm"
                            onClick={() => handleDelete(article._id)}
                            isLoading={deleteArticleMutation.isPending}>
                            <Trash2 size={14} strokeWidth={3} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && (
              <div className="px-10 py-8 border-t border-zinc-50 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-900/10">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] h-10 shadow-sm transition-all hover:bg-white dark:hover:bg-zinc-800">
                  Previous
                </Button>
                <div className="flex items-center gap-6">
                  <div className="flex gap-1.5">
                    {[...Array(data.totalPages)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${page === i + 1 ? "w-8 bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                    Page{" "}
                    <span className="text-zinc-900 dark:text-white">
                      {page}
                    </span>{" "}
                    of {data.totalPages}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
                  }
                  disabled={page === data.totalPages}
                  className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] h-10 shadow-sm transition-all hover:bg-white dark:hover:bg-zinc-800">
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

