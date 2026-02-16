import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { clientPromise } from "@/lib/db";
import { getAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import type { Organization, Membership, OrganizationRole } from "./models";

/**
 * Creates the tRPC context for both API routes and Server Components
 * Uses opts.req.headers instead of next/headers() to avoid RSC errors
 */
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const auth = await getAuth();

  // Use headers from the request object (works in both API routes and RSC)
  const headersList = opts.req.headers;

  const sessionData = await auth.api.getSession({
    headers: headersList,
  });

  const session = sessionData?.session || null;
  const user = sessionData?.user || null;

  let organization: Organization | null = null;
  let membership: Membership | null = null;
  let role: OrganizationRole | null = null;

  if (session && user) {
    const activeOrgId = (session as any).activeOrganizationId as
      | string
      | undefined;

    if (activeOrgId) {
      organization = await db
        .collection<Organization>("organizations")
        .findOne({ _id: new ObjectId(activeOrgId) });

      if (organization) {
        membership = await db.collection<Membership>("memberships").findOne({
          userId: user.id,
          organizationId: organization._id,
        });

        if (membership) {
          role = membership.role;
        }
      }
    }
  }

  return {
    db,
    headers: headersList,
    session,
    user,
    organization,
    membership,
    role,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

