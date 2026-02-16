import { trpc } from "@/lib/trpc-client";

export const useAuthorsWithCount = (limit = 20) => {
  return trpc.authors.listAuthorsWithArticleCount.useQuery({ limit });
};

export const useAuthors = (input: {
  search?: string;
  sort?: "rank" | "name" | "published";
  page?: number;
  limit?: number;
}) => {
  return trpc.authors.list.useQuery(
    {
      ...input,
      page: input.page ?? 1,
      limit: input.limit ?? 9,
    },
    {
      placeholderData: (previousData) => previousData,
    },
  );
};

