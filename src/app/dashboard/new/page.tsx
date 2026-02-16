"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createArticleSchema,
  type CreateArticleInput,
  type CreateArticleFormValues,
} from "@/schemas/articles";
import { useCreateArticle } from "@/features/articles/hooks/useArticles";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toastSuccess, toastError } from "@/lib/toast";
import { FormContainer, FormCard } from "@/components/layout/FormLayout";

export default function CreateArticlePage() {
  const router = useRouter();
  const createArticleMutation = useCreateArticle();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateArticleFormValues>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      status: "draft",
    },
  });

  const onSubmit = async (data: CreateArticleFormValues) => {
    try {
      await createArticleMutation.mutateAsync(data as CreateArticleInput);
      toastSuccess("Article created successfully");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toastError(
        error instanceof Error ? error.message : "Failed to create article",
      );
    }
  };

  return (
    <div className="pb-20">
      <div className="max-w-3xl mx-auto px-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            New Article
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Draft your next masterpiece and share it with the world.
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
                placeholder="The future of decentralized design..."
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
                placeholder="https://images.unsplash.com/..."
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

            {/* Text Field */}
            <div className="space-y-3 group">
              <label
                htmlFor="text"
                className="block text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">
                Body Content
              </label>
              <textarea
                id="text"
                placeholder="Start typing your story..."
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
                disabled={isSubmitting || createArticleMutation.isPending}
                className="w-full sm:w-auto px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl hover:opacity-90 active:scale-95 transition-all duration-200 font-black text-base shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {createArticleMutation.isPending
                  ? "Publishing..."
                  : "Publish Article"}
              </button>
            </div>
          </form>
        </FormCard>
      </FormContainer>
    </div>
  );
}

