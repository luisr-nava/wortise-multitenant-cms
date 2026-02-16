import { clientPromise } from "@/lib/db";
import type { Article } from "@/server/models";

export interface AuthorPublishedCount {
  authorId: string;
  authorName: string;
  slug: string;
  publishedCount: number;
}

/**
 * Fetches a published article by its slug directly from the database.
 * Used for public pages and metadata generation to avoid tRPC context overhead.
 */
export async function getPublicArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const client = await clientPromise;
  const db = client.db();

  const article = await db.collection<Article>("articles").findOne({
    slug,
    status: "published",
  });

  return article;
}

/**
 * Aggregates authors across the entire platform by their published article count.
 */
export async function getAuthorsWithPublishedCount(): Promise<
  AuthorPublishedCount[]
> {
  const client = await clientPromise;
  const db = client.db();

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
        as: "authorDetails",
      },
    },
    {
      $addFields: {
        authorSlug: { $arrayElemAt: ["$authorDetails.slug", 0] },
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
        slug: { $ifNull: ["$authorSlug", "$_id"] }, // Fallback to ID if no slug
        publishedCount: 1,
      },
    },
  ];

  const results = await db
    .collection<Article>("articles")
    .aggregate<AuthorPublishedCount>(pipeline)
    .toArray();

  return results;
}

