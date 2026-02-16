import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { type Context } from "./context";
import { ZodError } from "zod";

/**
 * Initialization of tRPC backend
 * Should be done once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. Router & Procedure Helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the procedure.
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.user || !ctx.user.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource.",
    });
  }
  return next({
    ctx: {
      // infers the `user` as non-nullable
      user: ctx.user,
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

/**
 * 4. Organization Procedures & RBAC
 */
import type { OrganizationRole } from "./models";

// Reusable middleware that enforces organization context
const isOrganizationContext = t.middleware(({ ctx, next }) => {
  if (!ctx.organization || !ctx.membership || !ctx.role) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Organization context missing in protected route",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user!, // Guaranteed by protectedProcedure
      session: ctx.session!, // Guaranteed by protectedProcedure
      organization: ctx.organization,
      membership: ctx.membership,
      role: ctx.role,
    },
  });
});

export const organizationProcedure = protectedProcedure.use(
  isOrganizationContext,
);

// RBAC Middleware Factory
export function requireRole(allowedRoles: OrganizationRole[]) {
  return t.middleware(({ ctx, next }) => {
    // We can assume organizationProcedure has run, so ctx.role exists.
    // But to be safe and satisfy TS if used on bare protectedProcedure:
    if (!ctx.role) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Role context missing",
      });
    }

    if (!allowedRoles.includes(ctx.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
    }

    return next();
  });
}

