import { MongoClient } from "mongodb";
import { env } from "@/lib/env";

const uri = env.DATABASE_URL;

if (!uri) {
  throw new Error("Please add your DATABASE_URL to environment variables");
}

type GlobalWithMongo = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const globalWithMongo = globalThis as GlobalWithMongo;

let clientPromise: Promise<MongoClient>;

const options = {};

async function initDB(client: MongoClient) {
  const db = client.db();

  // 1. Organization Slug Unique Index
  await db
    .collection("organizations")
    .createIndex({ slug: 1 }, { unique: true });

  // 2. Membership Compound Unique Index
  await db
    .collection("memberships")
    .createIndex({ userId: 1, organizationId: 1 }, { unique: true });

  // 3. Articles Organization Index (for filtering by org)
  await db
    .collection("articles")
    .createIndex({ organizationId: 1, createdAt: -1 });

  // 4. Articles Text Index (for search)
  await db
    .collection("articles")
    .createIndex({ title: "text", text: "text", authorName: "text" });

  // 5. Articles Slug Partial Unique Index
  // Drop existing simple unique index if it exists to allow reconfiguration
  try {
    await db.collection("articles").dropIndex("slug_1");
  } catch (e) {
    // Ignore error if index doesn't exist
  }

  // Clean up existing null slugs to avoid errors during index creation/updates
  await db
    .collection("articles")
    .updateMany({ slug: null }, { $unset: { slug: "" } });

  await db.collection("articles").createIndex(
    { slug: 1 },
    {
      name: "articles_slug_unique",
      unique: true,
      partialFilterExpression: { slug: { $type: "string" } },
    },
  );

  // 6. User Slug Unique Index (for Author Profiles)
  await db.collection("user").createIndex(
    { slug: 1 },
    {
      unique: true,
      name: "user_slug_unique",
      partialFilterExpression: { slug: { $type: "string" } },
    },
  );

  // Migration: Ensure users have slugs and 'id' string field for public profiles
  const usersToUpdate = await db
    .collection("user")
    .find({
      $or: [{ slug: { $exists: false } }, { id: { $exists: false } }],
    })
    .toArray();

  if (usersToUpdate.length > 0) {
    const { generateSlug } = await import("./slug");
    for (const user of usersToUpdate) {
      const updates: any = {};

      if (!user.slug) {
        const baseSlug = generateSlug(user.name || "author");
        let slug = baseSlug;
        let counter = 1;
        while (
          await db.collection("user").findOne({ slug, _id: { $ne: user._id } })
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        updates.slug = slug;
      }

      if (!user.id) {
        updates.id = user._id.toString();
      }

      if (Object.keys(updates).length > 0) {
        await db
          .collection("user")
          .updateOne({ _id: user._id }, { $set: updates });
      }
    }
  }
}

if (env.NODE_ENV === "development") {
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().then(async (c) => {
      await initDB(c);
      return c;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect().then(async (c) => {
    await initDB(c);
    return c;
  });
}

export { clientPromise };

