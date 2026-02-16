"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createArticleSchema,
  type CreateArticleInput,
  type CreateArticleFormValues,
} from "@/schemas/articles";
import { useUpdateArticle } from "@/features/articles/hooks/useArticles";
import { trpc } from "@/lib/trpc-client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { toastSuccess, toastError } from "@/lib/toast";
import { FormContainer, FormCard } from "@/components/layout/FormLayout";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // Fetch article data
  const {
    data: article,
    isLoading,
    isError,
  } = trpc.articles.getById.useQuery(
    { id },
    {
      enabled: !!id,
      retry: false,
    },
  );

  const updateArticleMutation = useUpdateArticle();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateArticleFormValues>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      status: "draft",
    },
  });

  // Set form defaults when article data is loaded
  useEffect(() => {
    if (article) {
      reset({
        title: article.title,
        text: article.text,
        coverImageUrl: article.coverImageUrl,
        status: article.status || "draft",
      });
    }
  }, [article, reset]);

  // Stable submit handler
  const onSubmit = useCallback(
    (data: CreateArticleFormValues) => {
      updateArticleMutation.mutate(
        { id, data: data as CreateArticleInput },
        {
          onSuccess: () => {
            toastSuccess("Article updated successfully");
            router.push("/dashboard");
            router.refresh();
          },
          onError: (error) => {
            toastError(error.message || "Failed to update article");
          },
        },
      );
    },
    [id, updateArticleMutation, router],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg">
          Article not found or access denied.
        </p>
        <Link
          href="/dashboard"
          className="text-zinc-600 dark:text-zinc-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="max-w-3xl mx-auto px-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Refine Article
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Polish your content to perfection before the world sees it.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-2">
          Discard
        </Link>
      </div>

      <FormContainer>
        <FormCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Title Field */}
            <div className="space-y-3 group">
              <label
                htmlFor="title"
                className="block text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">
                Headline
              </label>
              <input
                id="title"
                type="text"
                placeholder="Article title"
                className={`w-full px-5 py-4 rounded-2xl border bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition-all duration-300 font-bold text-xl ${
                  errors.title
                    ? "border-red-300 focus:border-red-500"
                    : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-700"
                }`}
                disabled={isSubmitting}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-500 font-bold pl-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Status Field */}
              <div className="space-y-3 group">
                <label
                  htmlFor="status"
                  className="block text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">
                  Visibility Status
                </label>
                <div className="relative">
                  <select
                    id="status"
                    className={`w-full px-5 py-4 rounded-2xl border appearance-none bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition-all duration-300 font-bold ${
                      errors.status
                        ? "border-red-300 focus:border-red-500"
                        : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-700"
                    }`}
                    disabled={isSubmitting}
                    {...register("status")}>
                    <option value="draft">Draft - Private</option>
                    <option value="published">Published - Live</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500 dark:text-zinc-400 font-bold">
                    <svg
                      className="h-5 w-5 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
                {errors.status && (
                  <p className="text-xs text-red-500 font-bold pl-1">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Cover Image URL Field */}
              <div className="space-y-3 group">
                <label
                  htmlFor="coverImageUrl"
                  className="block text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">
                  Cover Image URL
                </label>
                <input
                  id="coverImageUrl"
                  type="url"
                  placeholder="https://..."
                  className={`w-full px-5 py-4 rounded-2xl border bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition-all duration-300 font-medium ${
                    errors.coverImageUrl
                      ? "border-red-300 focus:border-red-500"
                      : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-700"
                  }`}
                  disabled={isSubmitting}
                  {...register("coverImageUrl")}
                />
                {errors.coverImageUrl && (
                  <p className="text-xs text-red-500 font-bold pl-1">
                    {errors.coverImageUrl.message}
                  </p>
                )}
              </div>
            </div>

            {/* Text Field */}
            <div className="space-y-3 group">
              <label
                htmlFor="text"
                className="block text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">
                Body Content
              </label>
              <textarea
                id="text"
                placeholder="Write your content here..."
                className={`w-full px-5 py-5 rounded-2xl border bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition-all duration-300 resize-y min-h-[200px] max-h-[400px] leading-relaxed text-base ${
                  errors.text
                    ? "border-red-300 focus:border-red-500"
                    : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-700"
                }`}
                disabled={isSubmitting}
                {...register("text")}
              />
              {errors.text && (
                <p className="text-xs text-red-500 font-bold pl-1">
                  {errors.text.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || updateArticleMutation.isPending}
                className="w-full sm:w-auto px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl hover:opacity-90 active:scale-95 transition-all duration-200 font-black text-base shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {updateArticleMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </FormCard>
      </FormContainer>
    </div>
  );
}

