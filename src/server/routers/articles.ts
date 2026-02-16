import {
  router,
  publicProcedure,
  protectedProcedure,
  organizationProcedure,
  requireRole,
} from "@/server/trpc";
import {
  createArticleSchema,
  updateArticleSchema,
  searchArticleSchema,
} from "@/schemas/articles";
import { z } from "zod";
import { ObjectId, type Db } from "mongodb";
import { TRPCError } from "@trpc/server";
import type { Filter } from "mongodb";
import type { Article } from "../models";
import { generateSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";

// Centralized "organizationProcedure" guarantees ctx.organization, ctx.membership, and ctx.role

/**
 * Generates a globally unique slug for an article.
 */
async function generateUniqueSlug(db: Db, title: string): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // Added defensive limit to prevent infinite loops
  while (counter < 100) {
    const existing = await db.collection<Article>("articles").findOne({ slug });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export const articlesRouter = router({
  create: organizationProcedure
    .use(requireRole(["OWNER", "ADMIN", "EDITOR"]))
    .input(createArticleSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, user, organization } = ctx;

      const slug = await generateUniqueSlug(db, input.title);

      const article: Article = {
        ...input,
        slug,
        status: input.status || "draft",
        publishedAt: null,
        views: 0,
        authorId: user.id,
        authorName: user.name || "Anonymous",
        organizationId: organization._id!, // Guaranteed to exist when read from DB
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        const result = await db
          .collection<Article>("articles")
          .insertOne(article);

        return {
          id: result.insertedId.toString(),
          ...article,
        };
      } catch (e: any) {
        if (e.code === 11000) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A conflict occurred while generating the unique slug. Please try saving again.",
          });
        }
        throw e;
      }
    }),

  update: organizationProcedure
    .use(requireRole(["OWNER", "ADMIN", "EDITOR"]))
    .input(updateArticleSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, user, organization } = ctx;
      const { id, data } = input;

      if (!ObjectId.isValid(id)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid article ID",
        });
      }

      const articleId = new ObjectId(id);

      const article = await db
        .collection<Article>("articles")
        .findOne({ _id: articleId, organizationId: organization._id }); // SCOPED

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // Check authorship OR role override (Admins/Owners can edit anyone's?)
      // Requirement: "Editor+"
      // If Editor, can they edit ANY article? Usually no, only their own.
      // If Owner/Admin, they can edit any.
      // Logic: If (Author != User) AND (Role != ADMIN && Role != OWNER) -> Forbidden
      const isOwnerOrAdmin = ctx.role === "OWNER" || ctx.role === "ADMIN";
      if (article.authorId !== user.id && !isOwnerOrAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to edit this article",
        });
      }

      await db.collection<Article>("articles").updateOne(
        { _id: articleId },
        {
          $set: {
            ...data,
            updatedAt: new Date(),
          },
        },
      );

      // Intelligent Cache Revalidation
      try {
        // 1. Revalidate the article page itself
        revalidatePath(`/articles/${article.slug}`);
        // 2. Revalidate home page list
        revalidatePath("/");
        // 3. Revalidate authors list
        revalidatePath("/authors");

        // 4. Revalidate specific author profile
        const authorUser = await db
          .collection("user")
          .findOne({ id: article.authorId });
        if (authorUser?.slug) {
          revalidatePath(`/authors/${authorUser.slug}`);
        }
      } catch (e) {
        console.error("Revalidation failed:", e);
      }

      return { success: true };
    }),

  delete: organizationProcedure
    .use(requireRole(["OWNER", "ADMIN"]))
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, organization } = ctx;
      const { id } = input;

      if (!ObjectId.isValid(id)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid article ID",
        });
      }

      const articleId = new ObjectId(id);
      const article = await db
        .collection<Article>("articles")
        .findOne({ _id: articleId, organizationId: organization._id }); // SCOPED

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // Requirement: ADMIN+ (Enforced by middleware)
      // No extra author check needed since Admin can delete any.

      await db.collection<Article>("articles").deleteOne({ _id: articleId });

      // Revalidate affected paths
      try {
        revalidatePath(`/articles/${article.slug}`);
        revalidatePath("/");
        revalidatePath("/authors");

        const authorUser = await db
          .collection("user")
          .findOne({ id: article.authorId });
        if (authorUser?.slug) {
          revalidatePath(`/authors/${authorUser.slug}`);
        }
      } catch (e) {
        console.error("Revalidation failed:", e);
      }

      return { success: true };
    }),

  updateStatus: organizationProcedure
    .use(requireRole(["OWNER", "ADMIN", "EDITOR"]))
    .input(
      z.object({
        articleId: z.string().min(1),
        status: z.enum(["draft", "published"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, organization } = ctx;
      const { articleId, status } = input;

      if (!ObjectId.isValid(articleId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid article ID",
        });
      }

      const _id = new ObjectId(articleId);

      // Find article and verify it belongs to current organization
      const article = await db
        .collection<Article>("articles")
        .findOne({ _id, organizationId: organization._id });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // Verify authorship (only author can publish/unpublish their own articles)
      // Unless user is OWNER or ADMIN
      const isOwnerOrAdmin = ctx.role === "OWNER" || ctx.role === "ADMIN";
      if (article.authorId !== user.id && !isOwnerOrAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only publish/unpublish your own articles",
        });
      }

      // Update status and publishedAt
      const updateData: Partial<Article> = {
        status,
        publishedAt: status === "published" ? new Date() : article.publishedAt,
        updatedAt: new Date(),
      };

      await db
        .collection<Article>("articles")
        .updateOne({ _id }, { $set: updateData });

      // Revalidate affected paths
      try {
        revalidatePath("/");
        revalidatePath("/authors");
        revalidatePath(`/articles/${article.slug}`);

        const authorUser = await db
          .collection("user")
          .findOne({ id: article.authorId });
        if (authorUser?.slug) {
          revalidatePath(`/authors/${authorUser.slug}`);
        }
      } catch (e) {
        console.error("Revalidation failed:", e);
      }

      console.log(
        `[updateStatus] Article ${articleId} status changed to ${status}`,
      );

      return { success: true, status };
    }),

  incrementView: publicProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { slug } = input;

      await db
        .collection<Article>("articles")
        .updateOne({ slug, status: "published" }, { $inc: { views: 1 } });

      return { success: true };
    }),

  getArticleAnalytics: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { slug } = input;

      const article = await db.collection<Article>("articles").findOne({
        slug,
        status: "published",
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      const views = article.views || 0;
      const publishedAt = article.publishedAt || article.createdAt;

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - publishedAt.getTime());
      const daysSincePublished = Math.max(
        1,
        Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
      );
      const avgViewsPerDay = views / daysSincePublished;

      return {
        views,
        publishedAt,
        daysSincePublished,
        avgViewsPerDay: Number(avgViewsPerDay.toFixed(2)),
      };
    }),

  getById: organizationProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { db, organization } = ctx;
      const { id } = input;

      if (!ObjectId.isValid(id)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid article ID",
        });
      }

      const article = await db
        .collection<Article>("articles")
        .findOne({ _id: new ObjectId(id), organizationId: organization._id }); // SCOPED

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      if (article.status === "published") {
        return { ...article, _id: article._id!.toString() };
      }

      // Draft logic
      const user = ctx.user;
      // Admins/Owners can see drafts? defaulting to strict author check + admin override
      const isOwnerOrAdmin = ctx.role === "OWNER" || ctx.role === "ADMIN";
      if (user.id !== article.authorId && !isOwnerOrAdmin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      return { ...article, _id: article._id!.toString() };
    }),

  getMyArticles: organizationProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, user, organization, session } = ctx;
      const { page, limit } = input;

      // Defensive null checks (should never happen with organizationProcedure)
      if (!user || !user.id) {
        console.error("[getMyArticles] ERROR: user is null or missing id", {
          user,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User context is missing",
        });
      }

      if (!organization || !organization._id) {
        console.error(
          "[getMyArticles] ERROR: organization is null or missing _id",
          { organization },
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Organization context is missing",
        });
      }

      if (!session) {
        console.error("[getMyArticles] ERROR: session is null");
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Session is missing",
        });
      }

      const skip = (page - 1) * limit;

      const filter = {
        authorId: user.id,
        organizationId: organization._id,
      };

      console.log(
        "[getMyArticles] Filter:",
        JSON.stringify({
          authorId: user.id,
          organizationId: organization._id.toString(),
        }),
      );
      console.log("[getMyArticles] Pagination:", { page, limit, skip });

      const articles = await db
        .collection<Article>("articles")
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await db
        .collection<Article>("articles")
        .countDocuments(filter);

      const totalPages = Math.ceil(total / limit);

      // Handle pagination out-of-bounds
      if (page > totalPages && total > 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found",
        });
      }

      console.log(
        `[getMyArticles] Found ${articles.length} articles for user ${user.id} in org ${organization._id}`,
      );

      return {
        items: articles.map((a) => ({ ...a, _id: a._id!.toString() })),
        total,
        page,
        totalPages: totalPages || 1, // Ensure at least 1 page for UI
      };
    }),

  search: organizationProcedure
    .input(
      searchArticleSchema.extend({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, organization } = ctx;
      const { query, page, limit } = input;
      const skip = (page - 1) * limit;

      const filter: Filter<Article> = {
        organizationId: organization._id, // SCOPED
        status: input.status || "published",
      };

      if (query) {
        const regex = new RegExp(query, "i");
        filter.$or = [
          { title: { $regex: regex } },
          { text: { $regex: regex } },
          { authorName: { $regex: regex } },
        ];
      }

      const articles = await db
        .collection<Article>("articles")
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await db
        .collection<Article>("articles")
        .countDocuments(filter);

      const totalPages = Math.ceil(total / limit);

      if (page > totalPages && total > 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Search page not found",
        });
      }

      return {
        items: articles.map((a) => ({ ...a, _id: a._id!.toString() })),
        total,
        page,
        totalPages: totalPages || 1,
      };
    }),

  publicList: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(12),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit } = input;

      const articles = await db
        .collection<Article>("articles")
        .find({ status: "published" })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return articles.map((a) => ({ ...a, _id: a._id!.toString() }));
    }),

  searchPublic: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { query, page, limit } = input;

      const skip = (page - 1) * limit;

      const filter: Filter<Article> = {
        status: "published",
      };

      if (query) {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(escapedQuery, "i");

        filter.$or = [
          { title: { $regex: regex } },
          { text: { $regex: regex } },
        ];
      }

      const [articles, total] = await Promise.all([
        db
          .collection<Article>("articles")
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        db.collection<Article>("articles").countDocuments(filter),
      ]);

      type PublicArticle = Omit<Article, "_id"> & { _id: string };

      const formatted: PublicArticle[] = articles.map((a) => ({
        ...a,
        _id: a._id!.toString(),
      }));

      const totalPages = Math.ceil(total / limit);

      if (page > totalPages && total > 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found",
        });
      }

      return {
        data: formatted,
        total,
        page,
        totalPages: totalPages || 1,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { slug } = input;

      const article = await db.collection<Article>("articles").findOne({
        slug,
        status: "published",
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      return { ...article, _id: article._id!.toString() };
    }),

  getPublishedArticles: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(9),
        search: z.string().optional(),
        authorId: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { page, limit, search, authorId, fromDate, toDate } = input;

      const filters: any = {
        status: "published",
      };

      if (search) {
        filters.title = { $regex: search, $options: "i" };
      }

      if (authorId) {
        filters.authorId = authorId;
      }

      if (fromDate || toDate) {
        filters.publishedAt = {};
        if (fromDate) filters.publishedAt.$gte = new Date(fromDate);
        if (toDate) filters.publishedAt.$lte = new Date(toDate);
      }

      const total = await db
        .collection<Article>("articles")
        .countDocuments(filters);

      const articles = await db
        .collection<Article>("articles")
        .find(filters)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      return {
        articles: articles.map((a) => ({ ...a, _id: a._id!.toString() })),
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),
});

