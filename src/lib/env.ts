import { z } from "zod";

/**
 * Schema for environment variables
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url().optional(), // Optional in Vercel preview environments
});

/**
 * Validate process.env against schema
 * Throws error if validation fails
 */
// eslint-disable-next-line
const _env = envSchema.parse(process.env);

export const env = _env;

