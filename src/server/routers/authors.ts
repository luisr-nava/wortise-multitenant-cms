import { router, organizationProcedure, publicProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Article } from "../models";

/**
 * Return shape for the authors aggregation
 */
interface AuthorPublishedCount {
  authorId: string;
  authorName: string;
  slug: string;
  publishedCount: number;
}

/**
 * Technical type for organization-specific aggregation
 */
interface AuthorAggregate {
  authorId: string;
  authorName: string;
  totalArticles: number;
}

export const authorsRouter = router({
  /**
   * Returns a list of authors aggregated by their published article count.
   * Publicly accessible, no authentication required.
   */
  listWithPublishedCount: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const pipeline = [
      {
        $match: {
          status: "published",
        },
      },
      {
        $group: {
          _id: "$authorId",
          authorName: { $first: "$authorName" },
          publishedCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "_id",
          foreignField: "id",
          as: "userDetails",
        },
      },
      {
        $addFields: {
          authorSlug: { $arrayElemAt: ["$userDetails.slug", 0] },
        },
      },
      {
        $sort: {
          publishedCount: -1,
        },
      },
      {
        $project: {
          _id: 0,
          authorId: "$_id",
          authorName: 1,
          slug: { $ifNull: ["$authorSlug", "$_id"] },
          publishedCount: 1,
        },
      },
    ];

    const results = await db
      .collection<Article>("articles")
      .aggregate<AuthorPublishedCount>(pipeline)
      .toArray();

    return results;
  }),

  searchPublicAuthors: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        minArticles: z.number().min(1).optional(),
        sort: z.enum(["ranking", "name"]).default("ranking"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { query, minArticles, sort } = input;

      const pipeline: any[] = [
        {
          $match: {
            status: "published",
          },
        },
        {
          $group: {
            _id: "$authorId",
            authorName: { $first: "$authorName" },
            publishedCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "_id",
            foreignField: "id",
            as: "userDetails",
          },
        },
        {
          $addFields: {
            authorSlug: { $arrayElemAt: ["$userDetails.slug", 0] },
          },
        },
      ];

      // Filtering
      const matchStage: any = {};
      if (query) {
        matchStage.authorName = { $regex: query, $options: "i" };
      }
      if (minArticles) {
        matchStage.publishedCount = { $gte: minArticles };
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Sorting
      if (sort === "ranking") {
        pipeline.push({ $sort: { publishedCount: -1, authorName: 1 } });
      } else {
        pipeline.push({ $sort: { authorName: 1 } });
      }

      // Projection
      pipeline.push({
        $project: {
          _id: 0,
          authorId: "$_id",
          authorName: 1,
          slug: { $ifNull: ["$authorSlug", "$_id"] },
          publishedCount: 1,
        },
      });

      const results = await db
        .collection<Article>("articles")
        .aggregate<AuthorPublishedCount>(pipeline)
        .toArray();

      return results;
    }),

  getPublicAuthorBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { slug, page, limit } = input;

      // 1. Find user by slug
      const user = await db.collection("user").findOne({ slug });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author not found",
        });
      }

      const authorId = user.id;
      const skip = (page - 1) * limit;

      // 2. Fetch published articles and total count
      const [articles, totalCount] = await Promise.all([
        db
          .collection<Article>("articles")
          .find({ authorId, status: "published" })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        db.collection<Article>("articles").countDocuments({
          authorId,
          status: "published",
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      if (page > totalPages && totalCount > 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author page not found",
        });
      }

      return {
        author: {
          authorId,
          authorName: user.name || "Anonymous",
          slug: user.slug,
          publishedCount: totalCount,
        },
        articles: articles.map((a) => ({ ...a, _id: a._id!.toString() })),
        total: totalCount,
        page,
        totalPages: totalPages || 1,
      };
    }),

  getTrendingAuthors: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          status: "published",
          publishedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: "$authorId",
          authorName: { $first: "$authorName" },
          articleCount: { $sum: 1 },
        },
      },
      {
        $sort: { articleCount: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          authorId: "$_id",
          authorName: 1,
          articleCount: 1,
        },
      },
    ];

    const results = await db
      .collection<Article>("articles")
      .aggregate(pipeline)
      .toArray();

    return results;
  }),

  getMostViewedAuthors: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const pipeline = [
      {
        $match: {
          status: "published",
        },
      },
      {
        $group: {
          _id: "$authorId",
          authorName: { $first: "$authorName" },
          totalViews: { $sum: { $ifNull: ["$views", 0] } },
        },
      },
      {
        $sort: { totalViews: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          authorId: "$_id",
          authorName: 1,
          totalViews: 1,
        },
      },
    ];

    const results = await db
      .collection<Article>("articles")
      .aggregate(pipeline)
      .toArray();

    return results;
  }),

  /**
   * Internal/Dashboard procedure: lists authors within an organization.
   */
  listAuthorsWithArticleCount: organizationProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
        })
        .strict(),
    )
    .query(async ({ ctx, input }) => {
      const { db, organization } = ctx;
      const { limit } = input;

      const authors = await db
        .collection<Article>("articles")
        .aggregate<AuthorAggregate>([
          {
            $match: {
              organizationId: organization._id, // STRICT TENANT ISOLATION
            },
          },
          {
            $group: {
              _id: "$authorId",
              authorName: { $first: "$authorName" },
              totalArticles: { $sum: 1 },
            },
          },
          {
            $sort: { totalArticles: -1 },
          },
          {
            $limit: limit,
          },
          {
            $project: {
              _id: 0,
              authorId: "$_id",
              authorName: 1,
              totalArticles: 1,
            },
          },
        ])
        .toArray();

      return authors;
    }),

  /**
   * Public procedure to list authors with search, sort, and pagination.
   * Uses an aggregation pipeline with $facet to calculate total and data in a single pass.
   */
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        sort: z.enum(["rank", "name", "published"]).default("rank"),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(9),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { search, sort, page, limit } = input;
      const skip = (page - 1) * limit;

      const pipeline: any[] = [
        {
          $match: {
            status: "published",
          },
        },
        {
          $group: {
            _id: "$authorId",
            authorName: { $first: "$authorName" },
            publishedCount: { $sum: 1 },
          },
        },
      ];

      // Match condicional (search)
      if (search) {
        pipeline.push({
          $match: {
            authorName: { $regex: search, $options: "i" },
          },
        });
      }

      // $sort dinámico
      const sortStage: any = {};
      if (sort === "rank" || sort === "published") {
        sortStage.publishedCount = -1;
      } else if (sort === "name") {
        sortStage.authorName = 1;
      }
      // Estabilidad: sort secundario
      if (sort !== "name") sortStage.authorName = 1;

      pipeline.push({ $sort: sortStage });

      // $facet para paginación y total
      pipeline.push({
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "user",
                localField: "_id",
                foreignField: "id",
                as: "userDetails",
              },
            },
            {
              $addFields: {
                slug: { $arrayElemAt: ["$userDetails.slug", 0] },
              },
            },
            {
              $project: {
                _id: 0,
                authorId: "$_id",
                authorName: 1,
                publishedCount: 1,
                slug: { $ifNull: ["$slug", "$_id"] },
              },
            },
          ],
        },
      });

      const [result] = await db
        .collection("articles")
        .aggregate<{
          metadata: { total: number }[];
          data: AuthorPublishedCount[];
        }>(pipeline)
        .toArray();

      const total = result?.metadata[0]?.total || 0;
      const data = result?.data || [];
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        totalPages: totalPages || 1,
      };
    }),

  getPublicAuthors: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        sort: z.enum(["rank", "name", "published"]).default("rank"),
        page: z.number().default(1),
        limit: z.number().default(9),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { search, sort, page, limit } = input;

      const pipeline: any[] = [
        {
          $match: {
            status: "published",
          },
        },
        {
          $group: {
            _id: "$authorId",
            authorName: { $first: "$authorName" },
            publishedCount: { $sum: 1 },
          },
        },
      ];

      // Search filter
      if (search) {
        pipeline.push({
          $match: {
            authorName: { $regex: search, $options: "i" },
          },
        });
      }

      // Dynamic sorting
      const sortStage: any = {};
      if (sort === "rank" || sort === "published") {
        sortStage.publishedCount = -1;
      } else if (sort === "name") {
        sortStage.authorName = 1;
      }
      // Secondary sort to ensure stability
      if (sort !== "name") sortStage.authorName = 1;

      pipeline.push({ $sort: sortStage });

      // Calculate total count (using a separate skip/limit-free pipeline)
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await db
        .collection("articles")
        .aggregate(countPipeline)
        .toArray();
      const total = countResult[0]?.total || 0;

      // Pagination
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });

      // Lookup for extra user data (like slug)
      pipeline.push(
        {
          $lookup: {
            from: "user",
            localField: "_id",
            foreignField: "id",
            as: "userDetails",
          },
        },
        {
          $addFields: {
            slug: { $arrayElemAt: ["$userDetails.slug", 0] },
          },
        },
        {
          $project: {
            _id: 0,
            authorId: "$_id",
            authorName: 1,
            publishedCount: 1,
            slug: { $ifNull: ["$slug", "$_id"] },
          },
        },
      );

      const data = await db
        .collection("articles")
        .aggregate(pipeline)
        .toArray();

      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),
});

