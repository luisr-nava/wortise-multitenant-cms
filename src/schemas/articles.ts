import { z } from "zod";

export const createArticleSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters long"),
    text: z
      .string()
      .trim()
      .min(10, "Content must be at least 10 characters long"),
    coverImageUrl: z.string().url("Must be a valid URL"),
    status: z.enum(["draft", "published"]).default("draft"),
  })
  .strict();

export const updateArticleSchema = z
  .object({
    id: z.string().min(1, "Article ID is required"),
    data: createArticleSchema.partial(),
  })
  .refine((val) => Object.keys(val.data).length > 0, {
    message: "At least one field must be provided to update",
    path: ["data"],
  })
  .strict();

export const searchArticleSchema = z
  .object({
    query: z.string().trim().min(1).optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .strict();

export type CreateArticleSchema = typeof createArticleSchema;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type CreateArticleFormValues = z.input<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type SearchArticleInput = z.infer<typeof searchArticleSchema>;

