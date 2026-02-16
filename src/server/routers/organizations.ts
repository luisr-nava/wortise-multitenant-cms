import {
  router,
  protectedProcedure,
  organizationProcedure,
} from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import type { Organization, Membership } from "../models";

export const organizationsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z
          .string()
          .min(3)
          .regex(
            /^[a-z0-9-]+$/,
            "Slug must be lowercase alphanumeric with hyphens",
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      // Check if slug exists
      const existing = await db
        .collection<Organization>("organizations")
        .findOne({ slug: input.slug });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Organization slug already taken",
        });
      }

      const orgId = new ObjectId();
      const newOrg: Organization = {
        _id: orgId,
        name: input.name,
        slug: input.slug,
        ownerId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const membership: Membership = {
        userId: user.id,
        organizationId: orgId,
        role: "OWNER", // RBAC: Assign OWNER role
        createdAt: new Date(),
      };

      // Transaction-like (MongoDB 4.0+ supports multi-doc transactions, but we'll do sequential for simplicity if standalone)
      await db.collection<Organization>("organizations").insertOne(newOrg);
      await db.collection<Membership>("memberships").insertOne(membership);

      return newOrg;
    }),

  listMyOrganizations: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    const memberships = await db
      .collection<Membership>("memberships")
      .find({ userId: user.id })
      .toArray();
    const orgIds = memberships.map((m) => m.organizationId);

    const organizations = await db
      .collection<Organization>("organizations")
      .find({ _id: { $in: orgIds } })
      .toArray();

    return organizations;
  }),

  // "Switch" is mostly client-side (setting header/cookie), but we can validate access here
  switchOrganization: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, session } = ctx;

      const org = await db
        .collection<Organization>("organizations")
        .findOne({ slug: input.slug });

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      const membership = await db
        .collection<Membership>("memberships")
        .findOne({
          userId: user.id,
          organizationId: org._id,
        });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this organization",
        });
      }

      // Update Session
      // We rely on BetterAuth to update the session state.
      // Since strict context requires activeOrganizationId, we MUST update it now.

      // Direct DB update ensures consistency without relying on complex API calls mocking requests
      // BetterAuth 'organization' plugin adds 'activeOrganizationId' to the session table.
      const result = await db
        .collection("session")
        .updateOne(
          { token: session.token },
          { $set: { activeOrganizationId: org._id.toString() } },
        );

      if (result.modifiedCount === 0 && result.matchedCount === 0) {
        // Should ideally not happen if session exists
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update session",
        });
      }

      return { success: true, slug: org.slug };
    }),

  getCurrent: organizationProcedure.query(({ ctx }) => {
    return {
      organization: ctx.organization,
      membership: ctx.membership,
      role: ctx.role,
    };
  }),
});

