import { publicProcedure, router } from "@/server/trpc";
import { articlesRouter } from "@/server/routers/articles";
import { authorsRouter } from "@/server/routers/authors";
import { profileRouter } from "@/server/routers/profile";
import { organizationsRouter } from "@/server/routers/organizations";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => "ok"),
  articles: articlesRouter,
  authors: authorsRouter,
  profile: profileRouter,
  organizations: organizationsRouter,
});

export type AppRouter = typeof appRouter;

