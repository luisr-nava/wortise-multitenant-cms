import { trpc } from "@/lib/trpc-client";
import type { SearchArticleInput } from "@/schemas/articles";

export const useMyArticles = (page = 1, limit = 10) => {
  return trpc.articles.getMyArticles.useQuery(
    { page, limit },
    {
      placeholderData: (previousData) => previousData, // Keeps UI stable while fetching new page
    },
  );
};

export const useSearchArticles = (
  input: SearchArticleInput & { page?: number; limit?: number },
) => {
  return trpc.articles.search.useQuery(
    {
      ...input,
      page: input.page ?? 1,
      limit: input.limit ?? 10,
    },
    {
      placeholderData: (previousData) => previousData,
    },
  );
};

export const useCreateArticle = () => {
  const utils = trpc.useUtils();

  return trpc.articles.create.useMutation({
    onSuccess: () => {
      // Precise invalidation to save bandwidth
      utils.articles.getMyArticles.invalidate();
      utils.articles.search.invalidate();
      utils.articles.publicList.invalidate();
    },
  });
};

export const useDeleteArticle = () => {
  const utils = trpc.useUtils();

  return trpc.articles.delete.useMutation({
    onSuccess: () => {
      utils.articles.getMyArticles.invalidate();
      utils.articles.search.invalidate();
      utils.articles.publicList.invalidate();
    },
  });
};

export const useUpdateArticle = () => {
  const utils = trpc.useUtils();

  return trpc.articles.update.useMutation({
    onSuccess: (data, variables) => {
      utils.articles.getById.invalidate({ id: variables.id });
      utils.articles.getMyArticles.invalidate();
      utils.articles.search.invalidate();
      utils.articles.publicList.invalidate();
    },
  });
};

export const useUpdateArticleStatus = () => {
  const utils = trpc.useUtils();

  return trpc.articles.updateStatus.useMutation({
    onSuccess: () => {
      utils.articles.getMyArticles.invalidate();
      utils.articles.search.invalidate();
      utils.articles.publicList.invalidate();
    },
  });
};

export const usePublicArticles = (limit = 12) => {
  return trpc.articles.publicList.useQuery(
    { limit },
    { staleTime: 1000 * 30 }, // 30s for public listing (shared across users)
  );
};

