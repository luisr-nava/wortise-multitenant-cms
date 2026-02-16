import { MongoClient, ObjectId } from "mongodb";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Simple manual loader for .env.local variables
function loadEnv() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"'))
        value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables");
  process.exit(1);
}

const authors = [
  {
    name: "Luis Navarro",
    slug: "luis-navarro",
    bio: "Senior Software Architect specializing in distributed systems and high-performance cloud infrastructure. Passionate about clean code and scalable patterns.",
  },
  {
    name: "Sofía Martínez",
    slug: "sofia-martinez",
    bio: "Product Designer and UX Researcher. Focused on creating intuitive digital experiences and establishing robust design systems for global SaaS products.",
  },
  {
    name: "Diego Fernández",
    slug: "diego-fernandez",
    bio: "DevOps Engineer and Security Advocate. Expert in Kubernetes, CI/CD automation, and implementing Zero Trust security models in complex enterprise environments.",
  },
  {
    name: "Camila Torres",
    slug: "camila-torres",
    bio: "AI Research Engineer and Full-Stack Developer. Exploring the intersection of Large Language Models and modern web applications to build the next generation of intelligent tools.",
  },
];

const articleTitles = [
  "Evolving Your SaaS Architecture for Global Scale",
  "The Hidden Costs of Premature Optimization in Performance",
  "Building Resilient Database Clusters with MongoDB and Kubernetes",
  "Mastering Zero Trust Security in Modern Cloud Environments",
  "How AI is Revolutionizing Content Management Systems",
  "Design Systems: Bridging the Gap Between UX and Engineering",
  "DevOps Maturity: From Manual Deployments to GitOps Nirvana",
  "The Future of Serverless: Beyond the Hype",
  "Micro-frontend Architecture: Scaling Complex UI Teams",
  "Database Indexing Strategies Every Developer Should Know",
  "Securing Your API: Best Practices for 2026",
  "Core Web Vitals: A Deep Dive into Page Performance",
  "Leveraging WebSockets for Real-time SaaS Collaboration",
  "Pragmatic AI: Implementing LLMs Without Breaking the Bank",
  "Advanced CSS Layout Patterns for Multi-Tenant Dashboards",
  "Automating Compliance in Your CI/CD Pipelines",
  "The Rise of Edge Computing: Bringing Logic Closer to Users",
  "Observability vs Monitoring: Finding the Signal in the Noise",
  "Distributed Tracing: Debugging at SaaS Scale",
  "Crafting Accessible Interfaces for Enterprise Tools",
];

const articleTexts = [
  "In the rapidly evolving landscape of SaaS, architecture isn't just about code—it's about survival. As we grow from tens to thousands of concurrent users, the monolithic structures that once served us become weight around our necks. This article explores how to transition to asynchronous processing and distributed storage while maintaining strict data isolation in a multi-tenant environment.\n\nScalability requires a shift in mindset. We must move away from shared resources that create 'noisy neighbor' issues and towards a model where infrastructure can be dynamically provisioned and isolated. This involves not only technical changes in how we deploy our services but also architectural decisions at the data layer to ensure consistency and performance under load.\n\nFinally, we look at the real-world implications of these changes. From reducing latency across global regions to managing the complexity of microservices, the path to global scale is fraught with challenges. However, by adhering to solid principles and leveraging modern cloud primitives, we can build systems that don't just survive growth, but thrive on it.",
  "Performance is a feature, yet it's often the first one we over-engineer. Premature optimization is famously 'the root of all evil,' but in modern web apps, it's also a significant source of technical debt. We'll examine why focusing on micro-benchmarks often overlooks the macroscopic bottlenecks that truly impact user experience.\n\nInstead of obsessing over individual function execution times, we should look at the critical rendering path and cumulative layout shift. Real performance gains come from understanding how the browser parses and renders our code, how assets are delivered over the network, and how we handle state transitions in the client. These architectural optimizations have a far greater impact than squeezing out a few milliseconds from an algorithm.\n\nIn this deep dive, we provide a framework for identifying when to optimize. By using field data and real-user monitoring, we can focus our efforts where they matter most, ensuring that our performance work directly translates to better business outcomes and happier users.",
  "Modern applications demand high availability and horizontal scale, making database resilience a top priority. When running MongoDB on Kubernetes, we face unique challenges in managing state and networking. This guide walks through the best practices for deploying replica sets and sharded clusters that can survive node failures and regional outages.\n\nWe start by configuring stateful sets and persistent volume claims correctly. Understanding how Kubernetes handles pod restarts and how MongoDB's election process works is crucial for maintaining uptime. We also discuss the importance of anti-affinity rules to ensure that your database nodes are distributed across different physical hardware and availability zones.\n\nWe conclude with strategies for automated backups and point-in-time recovery. In a cloud-native world, manual intervention is a failure point. By building self-healing database infrastructure, we free our teams to focus on building features rather than managing servers.",
];

const coverImages = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1537498425277-c283d32ef9db?q=80&w=1000&auto=format&fit=crop",
];

async function seed() {
  const client = new MongoClient(DATABASE_URL!);

  try {
    await client.connect();
    console.log("Connected to MongoDB...");
    const db = client.db();

    // 1. Get or Create Organization
    let organization = await db.collection("organizations").findOne();
    if (!organization) {
      const orgId = new ObjectId();
      await db.collection("organizations").insertOne({
        _id: orgId,
        name: "Wortise Tech",
        slug: "wortise-tech",
        ownerId: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      organization = await db
        .collection("organizations")
        .findOne({ _id: orgId });
      console.log("Created default organization: Wortise Tech");
    }
    const orgId = organization!._id;

    // 2. Insert Authors (User collection)
    const authorIds: string[] = [];
    for (const author of authors) {
      let user = await db.collection("user").findOne({ slug: author.slug });
      if (!user) {
        const id = new ObjectId().toString();
        const newUser = {
          id,
          name: author.name,
          email: `${author.slug}@example.com`,
          emailVerified: true,
          image: null,
          slug: author.slug,
          bio: author.bio,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.collection("user").insertOne(newUser);
        authorIds.push(id);
        console.log(`Created author: ${author.name}`);
      } else {
        authorIds.push(user.id);
      }
    }

    // 3. Clear existing articles to avoid slug conflicts during seeding
    // (Optional: depending on whether the user wants to append or replace)
    // For a "seed" script, it's often better to start fresh for articles.
    await db.collection("articles").deleteMany({ organizationId: orgId });
    console.log("Cleared existing articles in organization.");

    // 4. Generate 20 articles
    const articles = [];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
      const title = articleTitles[i % articleTitles.length];
      const authorId = authorIds[i % authorIds.length];
      const author =
        authors.find((a) => a.slug === authorIds[i % authorIds.length]) ||
        authors[i % authors.length];

      // Determine date distribution
      let createdAt: Date;
      if (i < 5) {
        // Recent: last 7 days
        createdAt = new Date(
          now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        );
      } else if (i < 12) {
        // Last 30 days
        createdAt = new Date(
          now.getTime() - (7 + Math.random() * 23) * 24 * 60 * 60 * 1000,
        );
      } else {
        // Old: > 30 days (let's say up to 90)
        createdAt = new Date(
          now.getTime() - (30 + Math.random() * 60) * 24 * 60 * 60 * 1000,
        );
      }

      const slug =
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/^-+|-+$/g, "") + `-${i}`; // Append index to ensure uniqueness

      articles.push({
        title,
        slug,
        text: articleTexts[i % articleTexts.length],
        coverImageUrl: coverImages[i % coverImages.length],
        authorId,
        authorName:
          authors.find((a) => a.slug === author.slug)?.name || "Anonymous",
        organizationId: orgId,
        status: "published",
        publishedAt: createdAt,
        views: Math.floor(Math.random() * 795) + 5,
        createdAt,
        updatedAt: createdAt,
      });
    }

    await db.collection("articles").insertMany(articles);
    console.log(`Inserted ${articles.length} articles.`);

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();

