const { MongoClient } = require("mongodb");

async function check() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("No DATABASE_URL");
    return;
  }
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db();
    const users = await db.collection("user").find({}).toArray();
    console.log("Users:", JSON.stringify(users, null, 2));

    const articles = await db
      .collection("articles")
      .find({})
      .limit(5)
      .toArray();
    console.log(
      "Articles:",
      JSON.stringify(
        articles.map((a) => ({
          authorId: a.authorId,
          authorName: a.authorName,
        })),
        null,
        2,
      ),
    );
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

check();

