import { router, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getAuth } from "@/lib/auth";

export const profileRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // Return safe user data from session context
    const { user } = ctx;

    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      image: user.image,
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const auth = await getAuth();

      try {
        // Use BetterAuth API to update user
        const result = await auth.api.updateUser({
          body: {
            name: input.name,
          },
          headers: ctx.headers,
        });

        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
          cause: error,
        });
      }
    }),
});

