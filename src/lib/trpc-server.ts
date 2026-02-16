import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

/**
 * Server-side tRPC caller for use in Server Components
 * This allows us to call tRPC procedures directly without HTTP
 */
export const createServerApi = async () => {
  // Create a mock request object for Server Component context
  const mockHeaders = new Headers();

  const context = await createContext({
    req: { headers: mockHeaders } as any,
    resHeaders: new Headers(),
    info: {
      isBatchCall: false,
      calls: [],
      accept: "application/jsonl",
      type: "query" as const,
      connectionParams: null,
      signal: new AbortController().signal,
      url: new URL("http://localhost:3000/api/trpc"),
    },
  });

  return appRouter.createCaller(context);
};

// Export a promise that resolves to the API
export const api = await createServerApi();

