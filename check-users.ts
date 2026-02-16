import { clientPromise } from "./src/lib/db";

async function checkUsers() {
  const client = await clientPromise;
  const db = client.db();
  const users = await db.collection("user").find({}).toArray();
  console.log("Users in DB:", JSON.stringify(users, null, 2));
  process.exit(0);
}

checkUsers();

